import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
import {
    generateToken,
    generateSetupCode,
    hashSetupCode,
    resolveWaveformTemplateId,
} from "../lib/generate.js";
import { makeQrPngBuffer, makeQrSvgString } from "../lib/qr.js";
import { buildZipBuffer } from "../lib/zip.js";
import { sendProductionEmail } from "../lib/email.js";

const MAX_CARDS_PER_ORDER = 10;
const TOKEN_RETRY_LIMIT = 8;

// CHANGE THIS: where production emails go
const PRODUCTION_EMAIL_TO = process.env.PRODUCTION_EMAIL_TO || "you@yourdomain.com";

// Your public site base URL
const BASE_URL = process.env.BASE_URL || "https://exact3design.com";

// Supabase Storage bucket name
const PACKS_BUCKET = "production-packs";

const SetupSchema = z.object({
    source: z.enum(["etsy", "direct"]).default("etsy"),
    buyer: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional().nullable(),
        address: z.object({
            line1: z.string().min(1),
            line2: z.string().optional().nullable(),
            city: z.string().min(1),
            state: z.string().min(1),
            zip: z.string().min(1),
            country: z.string().min(1).default("US"),
        }),
        etsyOrderNumber: z.string().optional().nullable(),
    }),
    cards: z.array(
        z.object({
            waveform: z.union([z.number(), z.string()]).optional().nullable(),
            message: z.string().optional().nullable(),
        })
    ).min(1),
});

function isUniqueViolation(err) {
    return err && (err.code === "23505" || err?.message?.includes("duplicate key value"));
}

function waveFilename(id) {
    return `wave${String(id).padStart(2, "0")}.svg`;
}

async function loadWaveSvgFromPublic(waveformId) {
    // Resolve repo-relative path for serverless
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // api/setup.js -> repoRoot/api/setup.js
    // repoRoot/public/assets/waves/wave01.svg
    const p = path.join(__dirname, "..", "public", "assets", "waves", waveFilename(waveformId));
    return fs.readFile(p, "utf8");
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        const parsed = SetupSchema.safeParse(body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
        }

        const payload = parsed.data;
        if (payload.cards.length > MAX_CARDS_PER_ORDER) {
            return res.status(400).json({ error: `Too many cards. Max is ${MAX_CARDS_PER_ORDER}.` });
        }

        const supabase = getSupabaseAdmin();

        // 1) Insert Order
        const { data: orderRow, error: orderErr } = await supabase
            .from("orders")
            .insert({
                source: payload.source,
                buyer_name: payload.buyer.name,
                email: payload.buyer.email,
                phone: payload.buyer.phone ?? null,
                address_line1: payload.buyer.address.line1,
                address_line2: payload.buyer.address.line2 ?? null,
                city: payload.buyer.address.city,
                state: payload.buyer.address.state,
                zip: payload.buyer.address.zip,
                country: payload.buyer.address.country ?? "US",
                etsy_order_number: payload.buyer.etsyOrderNumber ?? null,
            })
            .select("id")
            .single();

        if (orderErr) return res.status(500).json({ error: "Failed to create order", details: orderErr });

        const orderId = orderRow.id;

        // 2) Insert Cards + capture plaintext setup codes FOR EMAIL ONLY
        const createdCardsForEmail = []; // includes setup_code plaintext for the production email

        for (let i = 0; i < payload.cards.length; i++) {
            const cardInput = payload.cards[i];
            const waveformId = resolveWaveformTemplateId(cardInput.waveform);

            const setupCodePlaintext = generateSetupCode();
            const setupCodeHash = await hashSetupCode(setupCodePlaintext);

            let inserted = null;
            let lastErr = null;

            for (let attempt = 0; attempt < TOKEN_RETRY_LIMIT; attempt++) {
                const token = generateToken(9);

                const { data: cardRow, error: cardErr } = await supabase
                    .from("cards")
                    .insert({
                        order_id: orderId,
                        token,
                        setup_code_hash: setupCodeHash,
                        waveform_template_id: waveformId,
                        message: cardInput.message ?? null,
                        link_type: null,
                        youtube_id: null,
                        destination_url: null,
                        claimed_at: null,
                    })
                    .select("id, token, waveform_template_id, message")
                    .single();

                if (!cardErr) {
                    inserted = cardRow;
                    break;
                }
                if (isUniqueViolation(cardErr)) {
                    lastErr = cardErr;
                    continue;
                }
                lastErr = cardErr;
                break;
            }

            if (!inserted) {
                return res.status(500).json({ error: "Failed to create card", details: lastErr });
            }

            createdCardsForEmail.push({
                idx: i + 1,
                token: inserted.token,
                waveform_template_id: inserted.waveform_template_id,
                message: inserted.message ?? "",
                setup_code: setupCodePlaintext,
            });
        }

        // 3) Build ZIP in memory
        const zipBuffer = await buildZipBuffer(async (archive) => {
            // optional order summary file
            const summary = {
                order_id: orderId,
                buyer: payload.buyer,
                cards: createdCardsForEmail.map((c) => ({
                    token: c.token,
                    waveform_template_id: c.waveform_template_id,
                    setup_code: c.setup_code,
                    message: c.message,
                })),
            };
            archive.append(JSON.stringify(summary, null, 2), { name: "order-summary.json" });

            for (const c of createdCardsForEmail) {
                const cardFolder = `card-${String(c.idx).padStart(2, "0")}`;

                const tokenUrl = `${BASE_URL.replace(/\/$/, "")}/v/${c.token}`;

                const qrPng = await makeQrPngBuffer(tokenUrl);
                const qrSvg = await makeQrSvgString(tokenUrl);
                const waveSvg = await loadWaveSvgFromPublic(c.waveform_template_id);

                archive.append(qrPng, { name: `${cardFolder}/qr.png` });
                archive.append(qrSvg, { name: `${cardFolder}/qr.svg` });
                archive.append(waveSvg, { name: `${cardFolder}/wave.svg` });

                // helpful internal files (optional)
                archive.append(c.token, { name: `${cardFolder}/token.txt` });
                archive.append(c.setup_code, { name: `${cardFolder}/setup-code.txt` });
            }
        });

        // 4) Upload ZIP to Supabase Storage
        const objectPath = `orders/${orderId}/production-pack.zip`;

        const { error: uploadErr } = await supabase.storage
            .from(PACKS_BUCKET)
            .upload(objectPath, zipBuffer, {
                contentType: "application/zip",
                upsert: true,
            });

        if (uploadErr) {
            return res.status(500).json({ error: "Failed to upload production pack", details: uploadErr });
        }

        // 5) Create signed URL (30 days)
        const { data: signed, error: signedErr } = await supabase.storage
            .from(PACKS_BUCKET)
            .createSignedUrl(objectPath, 60 * 60 * 24 * 30);

        if (signedErr) {
            return res.status(500).json({ error: "Failed to create download link", details: signedErr });
        }

        const packUrl = signed.signedUrl;

        // 6) Email production pack to you/Bill
        const addressLines = [
            payload.buyer.address.line1,
            payload.buyer.address.line2 ? payload.buyer.address.line2 : null,
            `${payload.buyer.address.city}, ${payload.buyer.address.state} ${payload.buyer.address.zip}`,
            payload.buyer.address.country,
        ].filter(Boolean);

        const cardsHtml = createdCardsForEmail
            .map(
                (c) => `
          <li>
            <strong>Card ${c.idx}</strong><br/>
            Token: <code>${c.token}</code><br/>
            Setup code: <code>${c.setup_code}</code><br/>
            Wave template: ${c.waveform_template_id}<br/>
            ${c.message ? `Message: ${escapeHtml(c.message)}<br/>` : ""}
            Token URL: ${BASE_URL.replace(/\/$/, "")}/v/${c.token}
          </li>
        `
            )
            .join("");

        const html = `
      <h2>New Order - Production Pack Ready</h2>
      <p><strong>Order ID:</strong> <code>${orderId}</code></p>
      <p><strong>Buyer:</strong> ${escapeHtml(payload.buyer.name)} (${escapeHtml(payload.buyer.email)})</p>
      ${payload.buyer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.buyer.phone)}</p>` : ""}
      <p><strong>Ship to:</strong><br/>${addressLines.map(escapeHtml).join("<br/>")}</p>
      ${payload.buyer.etsyOrderNumber ? `<p><strong>Etsy Order #:</strong> ${escapeHtml(payload.buyer.etsyOrderNumber)}</p>` : ""}

      <p><strong>Download production pack (ZIP):</strong><br/>
        <a href="${packUrl}">${packUrl}</a>
      </p>

      <h3>Cards</h3>
      <ol>${cardsHtml}</ol>
    `;

        // console.log("PRODUCTION_EMAIL_TO runtime =", JSON.stringify(PRODUCTION_EMAIL_TO));

        await sendProductionEmail({
            to: ["samuelteigland@websiteartificers.com", "bill@exact3design.com"],
            subject: `Production Pack Ready — Order ${orderId}`,
            html,
        });

        // console.log("Production email sent to:", PRODUCTION_EMAIL_TO);

        // 7) Store pack path + sent timestamp on order
        await supabase
            .from("orders")
            .update({
                production_pack_url: objectPath, // store path, not signed URL
                production_email_sent_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        // 8) Return SAFE response to browser (no setup codes)
        return res.status(200).json({
            ok: true,
            order_id: orderId,
            card_count: createdCardsForEmail.length,
        });
    } catch (err) {
        return res.status(500).json({
            error: "Unexpected server error",
            details: err?.message ?? String(err),
        });
    }
}

// Simple HTML escape for email safety
function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}