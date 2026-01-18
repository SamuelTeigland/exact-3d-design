import { Resend } from "resend";

export async function sendProductionEmail({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
        from: "Exact3 Design <onboarding@resend.dev>",
        to,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    return data;
}