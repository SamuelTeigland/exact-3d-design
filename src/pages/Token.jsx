import './styles/token.css'
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function isValidToken(t) {
    return /^[A-Z0-9]{8,10}$/.test(t);
}

function normalizeToken(t) {
    return String(t || "").trim().toUpperCase();
}

function youtubeEmbedUrl(youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
}

export default function Token() {
    const params = useParams();
    const token = useMemo(() => normalizeToken(params.token), [params.token]);

    const [loading, setLoading] = useState(true);
    const [fetchErr, setFetchErr] = useState("");
    const [card, setCard] = useState(null);

    const [setupCode, setSetupCode] = useState("");
    const [link, setLink] = useState("");

    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [submitOk, setSubmitOk] = useState("");

    // NEW: change-link UI state
    const [showChange, setShowChange] = useState(false);

    async function fetchCard() {
        setLoading(true);
        setFetchErr("");
        setCard(null);

        if (!isValidToken(token)) {
            setLoading(false);
            setFetchErr("Invalid token. Please double-check the QR code and try again.");
            return;
        }

        try {
            const resp = await fetch(`/api/cards/${token}`, { method: "GET" });
            const data = await resp.json().catch(() => null);

            if (!resp.ok) {
                setFetchErr(data?.message || data?.error || "Could not load this page.");
                setLoading(false);
                return;
            }

            setCard(data);
            setLoading(false);
        } catch {
            setFetchErr("Network error. Please try again.");
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function postJson(url, body) {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await resp.json().catch(() => null);
        return { resp, data };
    }

    async function handleClaim(e) {
        e.preventDefault();
        setSubmitErr("");
        setSubmitOk("");

        const code = setupCode.trim();
        if (!/^\d{6}$/.test(code)) {
            setSubmitErr("Please enter the 6-digit setup code.");
            return;
        }

        const url = link.trim();
        if (!url) {
            setSubmitErr("Please paste a YouTube link or direct audio link.");
            return;
        }

        setSubmitLoading(true);
        try {
            const { resp, data } = await postJson(`/api/cards/${token}/claim`, {
                setup_code: code,
                link: url,
            });

            if (!resp.ok) {
                const msg =
                    data?.message ||
                    data?.error ||
                    "Could not claim this card. Please try again.";

                if (data?.locked_until) {
                    setSubmitErr(`${msg} Locked until: ${new Date(data.locked_until).toLocaleString()}`);
                } else {
                    setSubmitErr(msg);
                }

                setSubmitLoading(false);
                return;
            }

            setSubmitOk("Claimed successfully.");
            setSubmitLoading(false);

            setSetupCode("");
            setLink("");
            setShowChange(false);

            await fetchCard();
        } catch {
            setSubmitErr("Network error. Please try again.");
            setSubmitLoading(false);
        }
    }

    // NEW: Change link submit handler
    async function handleChangeLink(e) {
        e.preventDefault();
        setSubmitErr("");
        setSubmitOk("");

        const code = setupCode.trim();
        if (!/^\d{6}$/.test(code)) {
            setSubmitErr("Please enter the 6-digit setup code.");
            return;
        }

        const url = link.trim();
        if (!url) {
            setSubmitErr("Please paste a YouTube link or direct audio link.");
            return;
        }

        setSubmitLoading(true);
        try {
            const { resp, data } = await postJson(`/api/cards/${token}/change-link`, {
                setup_code: code,
                link: url,
            });

            if (!resp.ok) {
                const msg =
                    data?.message ||
                    data?.error ||
                    "Could not update the link. Please try again.";

                if (data?.locked_until) {
                    setSubmitErr(`${msg} Locked until: ${new Date(data.locked_until).toLocaleString()}`);
                } else {
                    setSubmitErr(msg);
                }

                setSubmitLoading(false);
                return;
            }

            setSubmitOk("Link updated.");
            setSubmitLoading(false);

            setSetupCode("");
            setLink("");
            setShowChange(false);

            await fetchCard();
        } catch {
            setSubmitErr("Network error. Please try again.");
            setSubmitLoading(false);
        }
    }

    // UI helpers
    const waveformId = card?.waveform_template_id;
    const waveSrc = waveformId
        ? `/assets/waves/wave${String(waveformId).padStart(2, "0")}.svg`
        : null;

    if (loading) {
        return (
            <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (fetchErr) {
        return (
            <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
                <h1>Something went wrong</h1>
                <p>{fetchErr}</p>
            </div>
        );
    }

    const claimed = !!card?.claimed;

    return (
        <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
            <header style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0 }}>Exact 3D Design</h1>
                <p style={{ marginTop: 6, color: "#555" }}>
                    {claimed ? "Player Page" : "Activate your card"}
                </p>
            </header>

            {/* Decorative Wave */}
            {waveSrc && (
                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 20,
                        background: "#fafafa",
                    }}
                >
                    <img
                        src={waveSrc}
                        alt={`Wave template ${waveformId}`}
                        style={{ width: "100%", height: "auto", display: "block" }}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            )}

            {!claimed ? (
                <>
                    <section style={{ marginBottom: 12 }}>
                        <h2 style={{ margin: "0 0 8px 0" }}>Claim this page</h2>
                        <p style={{ margin: "0 0 16px 0", color: "#555" }}>
                            Enter your 6-digit setup code and paste your link (unlisted YouTube recommended).
                        </p>
                    </section>

                    <form onSubmit={handleClaim} style={{ display: "grid", gap: 12 }}>
                        <label style={styles.label}>
                            <span>Setup code</span>
                            <input
                                value={setupCode}
                                onChange={(e) => setSetupCode(e.target.value)}
                                inputMode="numeric"
                                placeholder="123456"
                                maxLength={6}
                                style={styles.input}
                            />
                        </label>

                        <label style={styles.label}>
                            <span>Link (YouTube or direct audio)</span>
                            <input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://youtu.be/VIDEOID or https://example.com/audio.mp3"
                                style={styles.input}
                            />
                        </label>

                        {submitErr && <div style={styles.errorBox}>{submitErr}</div>}
                        {submitOk && <div style={styles.okBox}>{submitOk}</div>}

                        <button type="submit" disabled={submitLoading} style={styles.primaryBtn}>
                            {submitLoading ? "Claiming..." : "Claim"}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <section style={{ marginBottom: 12 }}>
                        <h2 style={{ margin: "0 0 8px 0" }}>Now playing</h2>
                    </section>

                    {card?.link?.type === "youtube" && card?.link?.youtube_id ? (
                        <div
                            style={{
                                position: "relative",
                                paddingTop: "56.25%",
                                borderRadius: 12,
                                overflow: "hidden",
                            }}
                        >
                            <iframe
                                src={youtubeEmbedUrl(card.link.youtube_id)}
                                title="YouTube player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    border: 0,
                                }}
                            />
                        </div>
                    ) : card?.link?.type === "audio" && card?.link?.url ? (
                        <audio controls src={card.link.url} style={{ width: "100%" }} />
                    ) : (
                        <div style={styles.errorBox}>
                            This page is claimed, but the stored link is missing or invalid.
                        </div>
                    )}

                    {/* NEW: Change link UI */}
                    <div style={{ marginTop: 16 }}>
                        {!showChange ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSubmitErr("");
                                    setSubmitOk("");
                                    setSetupCode("");
                                    setLink("");
                                    setShowChange(true);
                                }}
                                style={styles.secondaryBtn}
                            >
                                Change link
                            </button>
                        ) : (
                            <div style={{ marginTop: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ margin: "0 0 10px 0" }}>Change link</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChange(false);
                                            setSubmitErr("");
                                            setSubmitOk("");
                                            setSetupCode("");
                                            setLink("");
                                        }}
                                        style={styles.linkBtn}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <form onSubmit={handleChangeLink} style={{ display: "grid", gap: 12 }}>
                                    <label style={styles.label}>
                                        <span>Setup code</span>
                                        <input
                                            value={setupCode}
                                            onChange={(e) => setSetupCode(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="123456"
                                            maxLength={6}
                                            style={styles.input}
                                        />
                                    </label>

                                    <label style={styles.label}>
                                        <span>New link</span>
                                        <input
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://youtu.be/VIDEOID or https://example.com/audio.mp3"
                                            style={styles.input}
                                        />
                                    </label>

                                    {submitErr && <div style={styles.errorBox}>{submitErr}</div>}
                                    {submitOk && <div style={styles.okBox}>{submitOk}</div>}

                                    <button type="submit" disabled={submitLoading} style={styles.primaryBtn}>
                                        {submitLoading ? "Updating..." : "Update link"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    label: { display: "grid", gap: 6 },
    input: {
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ccc",
        fontSize: 16,
    },
    primaryBtn: {
        padding: 12,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontSize: 16,
    },
    secondaryBtn: {
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
    },
    linkBtn: {
        border: "none",
        background: "transparent",
        color: "#555",
        textDecoration: "underline",
        cursor: "pointer",
        fontSize: 13,
        padding: 0,
    },
    errorBox: {
        color: "#b00020",
        background: "#fff1f2",
        padding: 12,
        borderRadius: 10,
    },
    okBox: {
        color: "#0a7a2f",
        background: "#ecfdf3",
        padding: 12,
        borderRadius: 10,
    },
};