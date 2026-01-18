// api/cards/[token].js
import { getSupabaseAdmin } from "../../lib/supabaseAdmin.js";

function sanitizeToken(raw) {
    if (!raw) return null;
    const t = String(raw).trim().toUpperCase();
    // 8–10 chars, uppercase letters/digits only
    if (!/^[A-Z0-9]{8,10}$/.test(t)) return null;
    return t;
}

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const token = sanitizeToken(req.query.token);
        if (!token) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const supabase = getSupabaseAdmin();

        const { data: card, error } = await supabase
            .from("cards")
            .select(
                "token,waveform_template_id,link_type,youtube_id,destination_url,claimed_at"
            )
            .eq("token", token)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: "DB error", details: error });
        }

        if (!card) {
            return res.status(404).json({
                error: "Token not found",
                message: "We couldn’t find that card. Please double-check the QR code and try again."
            });
        }

        const claimed = !!card.claimed_at;

        // Never return secrets like setup_code_hash, attempts, etc.
        return res.status(200).json({
            ok: true,
            token: card.token,
            waveform_template_id: card.waveform_template_id,
            claimed,
            link: claimed
                ? card.link_type === "youtube"
                    ? { type: "youtube", youtube_id: card.youtube_id }
                    : card.link_type === "audio"
                        ? { type: "audio", url: card.destination_url }
                        : null
                : null
        });
    } catch (err) {
        return res.status(500).json({
            error: "Unexpected server error",
            details: err?.message ?? String(err)
        });
    }
}