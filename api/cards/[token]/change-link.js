import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function sanitizeToken(raw) {
    if (!raw) return null;
    const t = String(raw).trim().toUpperCase();
    if (!/^[A-Z0-9]{8,10}$/.test(t)) return null;
    return t;
}

function nowIso() {
    return new Date().toISOString();
}

function minutesFromNowIso(mins) {
    return new Date(Date.now() + mins * 60 * 1000).toISOString();
}

function parseAndValidateLink(raw) {
    const input = String(raw ?? "").trim();
    if (!input) return { ok: false, error: "Please paste a link." };

    let url;
    try {
        url = new URL(input);
    } catch {
        return { ok: false, error: "That doesn’t look like a valid URL." };
    }

    if (url.protocol !== "https:") {
        return { ok: false, error: "Please use an https:// link." };
    }

    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname;

    // YouTube formats:
    // - youtube.com/watch?v=VIDEOID
    // - youtu.be/VIDEOID
    // - youtube.com/shorts/VIDEOID
    let youtubeId = null;

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
        if (path === "/watch") {
            youtubeId = url.searchParams.get("v");
        } else if (path.startsWith("/shorts/")) {
            youtubeId = path.split("/")[2] || null;
        }
    } else if (host === "youtu.be") {
        youtubeId = path.split("/")[1] || null;
    }

    if (youtubeId) {
        youtubeId = youtubeId.trim();
        if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
            return {
                ok: false,
                error:
                    "That YouTube link looks off. Please paste a standard YouTube link (watch / youtu.be / shorts).",
            };
        }
        return { ok: true, link_type: "youtube", youtube_id: youtubeId, destination_url: null };
    }

    // Direct audio URL (https) ending in .mp3/.m4a/.wav
    const pathnameLower = url.pathname.toLowerCase();
    const allowed = [".mp3", ".m4a", ".wav"];
    const pathnameOk = allowed.some((ext) => pathnameLower.endsWith(ext));

    if (pathnameOk) {
        return { ok: true, link_type: "audio", youtube_id: null, destination_url: input };
    }

    return {
        ok: false,
        error:
            "Link not supported. Use an unlisted YouTube link, or a direct https audio link ending in .mp3, .m4a, or .wav.",
    };
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const token = sanitizeToken(req.query.token);
        if (!token) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const setupCode = String(body?.setup_code ?? "").trim();
        const link = body?.link;

        if (!setupCode || !/^\d{6}$/.test(setupCode)) {
            return res.status(400).json({ error: "Please enter the 6-digit setup code." });
        }

        const linkParsed = parseAndValidateLink(link);
        if (!linkParsed.ok) {
            return res.status(400).json({ error: linkParsed.error });
        }

        const supabase = getSupabaseAdmin();

        const { data: card, error: fetchErr } = await supabase
            .from("cards")
            .select(
                "id, token, setup_code_hash, claimed_at, setup_code_attempts, setup_code_locked_until"
            )
            .eq("token", token)
            .maybeSingle();

        if (fetchErr) {
            return res.status(500).json({ error: "DB error", details: fetchErr });
        }
        if (!card) {
            return res.status(404).json({
                error: "Token not found",
                message: "We couldn’t find that card. Please double-check the QR code and try again.",
            });
        }

        // Must be claimed to change link (per intended UX)
        if (!card.claimed_at) {
            return res.status(409).json({
                error: "Not claimed",
                message: "This card hasn’t been claimed yet. Use the claim form first.",
            });
        }

        // Lockout check
        if (card.setup_code_locked_until) {
            const lockedUntil = new Date(card.setup_code_locked_until).getTime();
            if (Number.isFinite(lockedUntil) && lockedUntil > Date.now()) {
                return res.status(429).json({
                    error: "Too many attempts",
                    message: "Too many failed attempts. Please try again later.",
                    locked_until: card.setup_code_locked_until,
                });
            }
        }

        // Verify setup code
        const okCode = await bcrypt.compare(setupCode, card.setup_code_hash);
        if (!okCode) {
            const newAttempts = (card.setup_code_attempts ?? 0) + 1;

            const updates = {
                setup_code_attempts: newAttempts,
                setup_code_locked_until:
                    newAttempts >= MAX_FAILED_ATTEMPTS ? minutesFromNowIso(LOCK_MINUTES) : null,
            };

            await supabase.from("cards").update(updates).eq("id", card.id);

            return res.status(401).json({
                error: "Invalid setup code",
                message: "Incorrect setup code. Please try again.",
                attempts_remaining: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
                locked_until: updates.setup_code_locked_until,
            });
        }

        // Successful change: overwrite link fields, reset attempts/lock
        const update = {
            link_type: linkParsed.link_type,
            youtube_id: linkParsed.youtube_id,
            destination_url: linkParsed.destination_url,
            setup_code_attempts: 0,
            setup_code_locked_until: null,
            // claimed_at remains unchanged; updated_at trigger will update
            updated_at: nowIso(), // harmless even with trigger; ensures change is recorded
        };

        const { data: updated, error: updateErr } = await supabase
            .from("cards")
            .update(update)
            .eq("id", card.id)
            .select("token, link_type, youtube_id, destination_url, claimed_at")
            .single();

        if (updateErr) {
            return res.status(500).json({ error: "Failed to change link", details: updateErr });
        }

        return res.status(200).json({
            ok: true,
            token: updated.token,
            claimed: true,
            link:
                updated.link_type === "youtube"
                    ? { type: "youtube", youtube_id: updated.youtube_id }
                    : { type: "audio", url: updated.destination_url },
        });
    } catch (err) {
        return res.status(500).json({
            error: "Unexpected server error",
            details: err?.message ?? String(err),
        });
    }
}