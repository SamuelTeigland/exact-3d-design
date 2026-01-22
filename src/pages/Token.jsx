import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./token.css";

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

    function resetFormMessages() {
        setSubmitErr("");
        setSubmitOk("");
    }

    function resetChangeUi() {
        resetFormMessages();
        setSetupCode("");
        setLink("");
        setShowChange(false);
    }

    async function handleClaim(e) {
        e.preventDefault();
        resetFormMessages();

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
                const msg = data?.message || data?.error || "Could not claim this card. Please try again.";
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
            resetChangeUi();
            await fetchCard();
        } catch {
            setSubmitErr("Network error. Please try again.");
            setSubmitLoading(false);
        }
    }

    async function handleChangeLink(e) {
        e.preventDefault();
        resetFormMessages();

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
                const msg = data?.message || data?.error || "Could not update the link. Please try again.";
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
            resetChangeUi();
            await fetchCard();
        } catch {
            setSubmitErr("Network error. Please try again.");
            setSubmitLoading(false);
        }
    }

    const waveformId = card?.waveform_template_id;
    const waveSrc = waveformId
        ? `/assets/waves/wave${String(waveformId).padStart(2, "0")}.svg`
        : null;

    const claimed = !!card?.claimed;

    if (loading) {
        return (
            <div className="tokenPage">
                <div className="tokenCard">
                    <h1 className="tokenH1">Loading…</h1>
                </div>
            </div>
        );
    }

    if (fetchErr) {
        return (
            <div className="tokenPage">
                <div className="tokenCard">
                    <header className="tokenHeader">
                        <h1 className="tokenH1">Something went wrong</h1>
                        <p className="tokenP">{fetchErr}</p>
                    </header>
                </div>
            </div>
        );
    }

    return (
        <div className="tokenPage">
            <div className="tokenCard">
                <header className="tokenHeader">
                    <h1 className="tokenBrand">Exact 3D Design</h1>
                    <p className="tokenSub">{claimed ? "Player Page" : "Activate your card"}</p>
                </header>

                {waveSrc && (
                    <div className="wavePanel" aria-hidden="true">
                        <img
                            src={waveSrc}
                            alt={`Wave template ${waveformId}`}
                            className="waveImg"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </div>
                )}

                {!claimed ? (
                    <>
                        <section className="tokenSection">
                            <h2 className="tokenH2">Claim this page</h2>
                            <p className="tokenP">
                                Enter your 6-digit setup code and paste your link (unlisted YouTube recommended).
                            </p>
                        </section>

                        <form onSubmit={handleClaim} className="tokenForm">
                            <label className="field">
                                <span className="fieldLabel">Setup code</span>
                                <input
                                    value={setupCode}
                                    onChange={(e) => setSetupCode(e.target.value)}
                                    inputMode="numeric"
                                    placeholder="123456"
                                    maxLength={6}
                                    className="input"
                                    autoComplete="one-time-code"
                                />
                            </label>

                            <label className="field">
                                <span className="fieldLabel">Link (YouTube or direct audio)</span>
                                <input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://youtu.be/VIDEOID or https://example.com/audio.mp3"
                                    className="input"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </label>

                            {submitErr && (
                                <div className="notice noticeError" role="alert" aria-live="polite">
                                    {submitErr}
                                </div>
                            )}
                            {submitOk && (
                                <div className="notice noticeOk" role="status" aria-live="polite">
                                    {submitOk}
                                </div>
                            )}

                            <div className="actions">
                                <button type="submit" className="btn btnPrimary" disabled={submitLoading}>
                                    {submitLoading ? "Claiming…" : "Claim"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <section className="tokenSection">
                            <h2 className="tokenH2">Now playing</h2>
                        </section>

                        {card?.link?.type === "youtube" && card?.link?.youtube_id ? (
                            <div className="playerFrame">
                                <iframe
                                    src={youtubeEmbedUrl(card.link.youtube_id)}
                                    title="YouTube player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="iframe"
                                />
                            </div>
                        ) : card?.link?.type === "audio" && card?.link?.url ? (
                            <audio controls src={card.link.url} className="audio" />
                        ) : (
                            <div className="notice noticeError">
                                This page is claimed, but the stored link is missing or invalid.
                            </div>
                        )}

                        <div className="changeWrap">
                            {!showChange ? (
                                <button
                                    type="button"
                                    className="btn btnSecondary"
                                    onClick={() => {
                                        resetFormMessages();
                                        setSetupCode("");
                                        setLink("");
                                        setShowChange(true);
                                    }}
                                >
                                    Change link
                                </button>
                            ) : (
                                <div className="changePanel">
                                    <div className="changeHeader">
                                        <h3 className="tokenH3">Change link</h3>
                                        <button type="button" className="linkBtn" onClick={resetChangeUi}>
                                            Cancel
                                        </button>
                                    </div>

                                    <form onSubmit={handleChangeLink} className="tokenForm">
                                        <label className="field">
                                            <span className="fieldLabel">Setup code</span>
                                            <input
                                                value={setupCode}
                                                onChange={(e) => setSetupCode(e.target.value)}
                                                inputMode="numeric"
                                                placeholder="123456"
                                                maxLength={6}
                                                className="input"
                                                autoComplete="one-time-code"
                                            />
                                        </label>

                                        <label className="field">
                                            <span className="fieldLabel">New link</span>
                                            <input
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                                placeholder="https://youtu.be/VIDEOID or https://example.com/audio.mp3"
                                                className="input"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                            />
                                        </label>

                                        {submitErr && (
                                            <div className="notice noticeError" role="alert" aria-live="polite">
                                                {submitErr}
                                            </div>
                                        )}
                                        {submitOk && (
                                            <div className="notice noticeOk" role="status" aria-live="polite">
                                                {submitOk}
                                            </div>
                                        )}

                                        <div className="actions actionsSplit">
                                            <button type="submit" className="btn btnPrimary" disabled={submitLoading}>
                                                {submitLoading ? "Updating…" : "Update link"}
                                            </button>
                                            <button type="button" className="btn btnSecondary" onClick={resetChangeUi}>
                                                Close
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}