import bcrypt from "bcryptjs";

const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateToken(len = 9) {
    // 8–10 chars; default 9
    const n = Math.max(8, Math.min(10, len));
    let out = "";
    for (let i = 0; i < n; i++) {
        out += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
    }
    return out;
}

export function generateSetupCode() {
    // 6 digits, allow leading zeros
    const code = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    return code;
}

export async function hashSetupCode(plaintext) {
    // bcryptjs is pure JS and works well in serverless
    const saltRounds = 10;
    return bcrypt.hash(plaintext, saltRounds);
}

export function resolveWaveformTemplateId(waveformSelection) {
    // Accept: 1..10, "random", "surprise", null/undefined => random
    const randomPick = () => Math.floor(Math.random() * 10) + 1;

    if (waveformSelection == null) return randomPick();

    if (typeof waveformSelection === "string") {
        const v = waveformSelection.trim().toLowerCase();
        if (v === "random" || v === "surprise" || v === "surpriseme") return randomPick();
        const maybeNum = Number(v);
        if (Number.isInteger(maybeNum) && maybeNum >= 1 && maybeNum <= 10) return maybeNum;
        return randomPick();
    }

    if (typeof waveformSelection === "number") {
        if (Number.isInteger(waveformSelection) && waveformSelection >= 1 && waveformSelection <= 10) {
            return waveformSelection;
        }
        return randomPick();
    }

    return randomPick();
}
