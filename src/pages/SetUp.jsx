import './styles/setUp.css'
import { useMemo, useState } from "react";

const MAX_CARDS = 10;

function emptyCard() {
    return { waveform: "random" }; // message intentionally omitted per your current spec
}

function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

export default function SetUp() {
    const [source] = useState("etsy");

    const [buyer, setBuyer] = useState({
        name: "",
        email: "",
        phone: "",
        etsyOrderNumber: "",
        address: {
            line1: "",
            line2: "",
            city: "",
            state: "",
            zip: "",
            country: "US",
        },
    });

    const [cards, setCards] = useState([emptyCard()]);

    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState(null); // { order_id, card_count, tokens: [] }

    const canAddMore = cards.length < MAX_CARDS;

    const validationError = useMemo(() => {
        if (!buyer.name.trim()) return "Buyer name is required.";
        if (!buyer.email.trim() || !isEmail(buyer.email)) return "A valid email is required.";
        if (!buyer.address.line1.trim()) return "Address line 1 is required.";
        if (!buyer.address.city.trim()) return "City is required.";
        if (!buyer.address.state.trim()) return "State is required.";
        if (!buyer.address.zip.trim()) return "ZIP is required.";
        if (!buyer.address.country.trim()) return "Country is required.";
        if (!cards.length) return "Please add at least one card.";
        if (cards.length > MAX_CARDS) return `Max ${MAX_CARDS} cards per order.`;
        return "";
    }, [buyer, cards]);

    function updateBuyer(field, value) {
        setBuyer((prev) => ({ ...prev, [field]: value }));
    }

    function updateAddress(field, value) {
        setBuyer((prev) => ({
            ...prev,
            address: { ...prev.address, [field]: value },
        }));
    }

    function updateCard(idx, patch) {
        setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    }

    function addCard() {
        if (!canAddMore) return;
        setCards((prev) => [...prev, emptyCard()]);
    }

    function removeCard(idx) {
        setCards((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setSuccess(null);

        const vErr = validationError;
        if (vErr) {
            setErr(vErr);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                source,
                buyer: {
                    name: buyer.name.trim(),
                    email: buyer.email.trim(),
                    phone: buyer.phone.trim() || null,
                    etsyOrderNumber: buyer.etsyOrderNumber.trim() || null,
                    address: {
                        line1: buyer.address.line1.trim(),
                        line2: buyer.address.line2.trim() || null,
                        city: buyer.address.city.trim(),
                        state: buyer.address.state.trim(),
                        zip: buyer.address.zip.trim(),
                        country: buyer.address.country.trim() || "US",
                    },
                },
                cards: cards.map((c) => ({
                    waveform: c.waveform,
                })),
            };

            const resp = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await resp.json().catch(() => null);

            if (!resp.ok) {
                setErr(data?.error || "Failed to submit. Please try again.");
                setSubmitting(false);
                return;
            }

            // For dev/testing, your backend returns tokens + setup_code.
            // Do NOT show setup codes to customers in production.
            const tokens = Array.isArray(data?.cards) ? data.cards.map((c) => c.token) : [];

            setSuccess({
                order_id: data.order_id,
                card_count: data.card_count,
                tokens,
            });

            setSubmitting(false);
        } catch (e2) {
            setErr("Network error. Please try again.");
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h1 style={styles.h1}>Submitted</h1>
                    <p style={styles.p}>
                        Thanks — your setup info has been received. We’ll use it to produce your plaque/card.
                    </p>

                    <div style={styles.hr} />

                    <div style={styles.kvGrid}>
                        <div>
                            <div style={styles.k}>Order ID</div>
                            <div style={styles.v}><code>{success.order_id}</code></div>
                        </div>
                        <div>
                            <div style={styles.k}>Cards</div>
                            <div style={styles.v}>{success.card_count}</div>
                        </div>
                    </div>

                    {success.tokens.length > 0 && (
                        <>
                            <div style={styles.hr} />
                            <div style={styles.smallNote}>
                                Dev note: tokens are shown for testing. Don’t show these to customers unless you intend to.
                            </div>
                            <ul style={styles.tokenList}>
                                {success.tokens.map((t) => (
                                    <li key={t}>
                                        <code>{t}</code> — <a href={`/v/${t}`}>open page</a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div style={styles.actionsRow}>
                        <button
                            type="button"
                            style={styles.secondaryBtn}
                            onClick={() => {
                                setSuccess(null);
                                setErr("");
                                setCards([emptyCard()]);
                                setBuyer({
                                    name: "",
                                    email: "",
                                    phone: "",
                                    etsyOrderNumber: "",
                                    address: {
                                        line1: "",
                                        line2: "",
                                        city: "",
                                        state: "",
                                        zip: "",
                                        country: "US",
                                    },
                                });
                            }}
                        >
                            Create another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.h1}>Setup</h1>
                <p style={styles.p}>
                    Enter your details and create one or more cards. You can add up to {MAX_CARDS}.
                </p>

                {err && <div style={styles.errorBox}>{err}</div>}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
                    <section>
                        <h2 style={styles.h2}>Buyer info</h2>

                        <div style={styles.grid2}>
                            <Field
                                label="Buyer name"
                                value={buyer.name}
                                onChange={(v) => updateBuyer("name", v)}
                                placeholder="John Doe"
                                required
                            />
                            <Field
                                label="Email"
                                value={buyer.email}
                                onChange={(v) => updateBuyer("email", v)}
                                placeholder="john@example.com"
                                required
                            />
                            <Field
                                label="Phone (optional)"
                                value={buyer.phone}
                                onChange={(v) => updateBuyer("phone", v)}
                                placeholder="555-555-5555"
                            />
                            <Field
                                label="Etsy order # (optional)"
                                value={buyer.etsyOrderNumber}
                                onChange={(v) => updateBuyer("etsyOrderNumber", v)}
                                placeholder="1234567890"
                            />
                        </div>
                    </section>

                    <section>
                        <h2 style={styles.h2}>Shipping address</h2>

                        <div style={styles.grid2}>
                            <Field
                                label="Address line 1"
                                value={buyer.address.line1}
                                onChange={(v) => updateAddress("line1", v)}
                                placeholder="123 Main St"
                                required
                            />
                            <Field
                                label="Address line 2 (optional)"
                                value={buyer.address.line2}
                                onChange={(v) => updateAddress("line2", v)}
                                placeholder="Apt 4B"
                            />
                            <Field
                                label="City"
                                value={buyer.address.city}
                                onChange={(v) => updateAddress("city", v)}
                                placeholder="Nashville"
                                required
                            />
                            <Field
                                label="State"
                                value={buyer.address.state}
                                onChange={(v) => updateAddress("state", v)}
                                placeholder="TN"
                                required
                            />
                            <Field
                                label="ZIP"
                                value={buyer.address.zip}
                                onChange={(v) => updateAddress("zip", v)}
                                placeholder="37201"
                                required
                            />
                            <Field
                                label="Country"
                                value={buyer.address.country}
                                onChange={(v) => updateAddress("country", v)}
                                placeholder="US"
                                required
                            />
                        </div>
                    </section>

                    <section>
                        <div style={styles.sectionHeaderRow}>
                            <h2 style={styles.h2}>Cards</h2>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={addCard}
                                    disabled={!canAddMore}
                                    style={{
                                        ...styles.secondaryBtn,
                                        opacity: canAddMore ? 1 : 0.5,
                                        cursor: canAddMore ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Add another
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: 12 }}>
                            {cards.map((card, idx) => (
                                <div key={idx} style={styles.cardItem}>
                                    <div style={styles.cardItemTopRow}>
                                        <div style={{ fontWeight: 600 }}>Card {idx + 1}</div>
                                        {cards.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCard(idx)}
                                                style={styles.linkBtn}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <label style={styles.label}>
                                        <span style={styles.labelText}>Waveform template</span>
                                        <select
                                            value={card.waveform}
                                            onChange={(e) => updateCard(idx, { waveform: e.target.value })}
                                            style={styles.select}
                                        >
                                            <option value="random">Random / Surprise me</option>
                                            {Array.from({ length: 10 }).map((_, i) => {
                                                const n = i + 1;
                                                return (
                                                    <option key={n} value={String(n)}>
                                                        Template {n}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div style={styles.smallNote}>
                            Max {MAX_CARDS} cards per order. If someone needs more, handle as a bulk order manually later.
                        </div>
                    </section>

                    <div style={styles.actionsRow}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                ...styles.primaryBtn,
                                opacity: submitting ? 0.7 : 1,
                                cursor: submitting ? "not-allowed" : "pointer",
                            }}
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, required = false }) {
    return (
        <label style={styles.label}>
            <span style={styles.labelText}>
                {label} {required ? <span style={{ color: "#b00020" }}>*</span> : null}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={styles.input}
            />
        </label>
    );
}

const styles = {
    page: {
        maxWidth: 820,
        margin: "40px auto",
        padding: 16,
    },
    card: {
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 20,
        background: "#fff",
    },
    h1: { margin: 0, fontSize: 28 },
    h2: { margin: "0 0 12px 0", fontSize: 18 },
    p: { marginTop: 8, color: "#555", lineHeight: 1.5 },

    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
    },

    label: { display: "grid", gap: 6 },
    labelText: { fontSize: 14, color: "#333" },

    input: {
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ccc",
        fontSize: 15,
        outline: "none",
    },

    select: {
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ccc",
        fontSize: 15,
        background: "#fff",
    },

    sectionHeaderRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    cardItem: {
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 14,
        background: "#fafafa",
    },
    cardItemTopRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    actionsRow: { marginTop: 6, display: "flex", gap: 10, justifyContent: "flex-end" },

    primaryBtn: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "none",
        fontSize: 15,
    },
    secondaryBtn: {
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "#fff",
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
        marginTop: 14,
        marginBottom: 14,
        color: "#b00020",
        background: "#fff1f2",
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ffd6db",
    },

    smallNote: {
        marginTop: 10,
        color: "#666",
        fontSize: 13,
        lineHeight: 1.4,
    },

    hr: {
        height: 1,
        background: "#eee",
        margin: "16px 0",
    },

    kvGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
    },
    k: { fontSize: 12, color: "#666" },
    v: { fontSize: 14 },

    tokenList: {
        marginTop: 10,
        marginBottom: 0,
        paddingLeft: 18,
        lineHeight: 1.7,
    },
};