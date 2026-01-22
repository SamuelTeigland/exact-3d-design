import { useMemo, useState } from "react";
import "./setup.css";

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
                cards: cards.map((c) => ({ waveform: c.waveform })),
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

            const tokens = Array.isArray(data?.cards) ? data.cards.map((c) => c.token) : [];

            setSuccess({
                order_id: data.order_id,
                card_count: data.card_count,
                tokens,
            });

            setSubmitting(false);
        } catch {
            setErr("Network error. Please try again.");
            setSubmitting(false);
        }
    }

    function resetForm() {
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
    }

    if (success) {
        return (
            <div className="setupPage">
                <div className="setupCard">
                    <h1 className="setupH1">Submitted</h1>
                    <p className="setupP">
                        Thanks — your setup info has been received. We’ll use it to produce your plaque/card.
                    </p>

                    <div className="setupHr" />

                    <div className="setupKvGrid">
                        <div className="setupKv">
                            <div className="setupK">Order ID</div>
                            <div className="setupV">
                                <code>{success.order_id}</code>
                            </div>
                        </div>
                        <div className="setupKv">
                            <div className="setupK">Cards</div>
                            <div className="setupV">{success.card_count}</div>
                        </div>
                    </div>

                    {success.tokens.length > 0 && (
                        <>
                            <div className="setupHr" />
                            <div className="setupSmallNote">
                                Dev note: tokens are shown for testing. Don’t show these to customers unless you intend
                                to.
                            </div>
                            <ul className="setupTokenList">
                                {success.tokens.map((t) => (
                                    <li key={t}>
                                        <code>{t}</code> — <a href={`/v/${t}`}>open page</a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="setupActions">
                        <button type="button" className="btn btnSecondary" onClick={resetForm}>
                            Create another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="setupPage">
            <div className="setupCard">
                <h1 className="setupH1">Setup</h1>
                <p className="setupP">
                    Enter your details and create one or more cards. You can add up to {MAX_CARDS}.
                </p>

                {err && (
                    <div className="setupError" role="alert" aria-live="polite">
                        {err}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="setupForm">
                    <section className="setupSection">
                        <h2 className="setupH2">Buyer info</h2>

                        <div className="grid2">
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
                                inputMode="tel"
                            />
                            <Field
                                label="Etsy order # (optional)"
                                value={buyer.etsyOrderNumber}
                                onChange={(v) => updateBuyer("etsyOrderNumber", v)}
                                placeholder="1234567890"
                            />
                        </div>
                    </section>

                    <section className="setupSection">
                        <h2 className="setupH2">Shipping address</h2>

                        <div className="grid2">
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
                                placeholder="New York"
                                required
                            />
                            <Field
                                label="State"
                                value={buyer.address.state}
                                onChange={(v) => updateAddress("state", v)}
                                placeholder="NY"
                                required
                            />
                            <Field
                                label="ZIP"
                                value={buyer.address.zip}
                                onChange={(v) => updateAddress("zip", v)}
                                placeholder="12345"
                                required
                                inputMode="numeric"
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

                    <section className="setupSection">
                        <div className="sectionHeaderRow">
                            <h2 className="setupH2">Cards</h2>
                            <div className="headerActions">
                                <button
                                    type="button"
                                    className="btn btnSecondary"
                                    onClick={addCard}
                                    disabled={!canAddMore}
                                >
                                    Add another
                                </button>
                            </div>
                        </div>

                        <div className="cardsList">
                            {cards.map((card, idx) => (
                                <div key={idx} className="cardItem">
                                    <div className="cardItemTopRow">
                                        <div className="cardItemTitle">Card {idx + 1}</div>
                                        {cards.length > 1 && (
                                            <button type="button" className="linkBtn" onClick={() => removeCard(idx)}>
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <label className="field">
                                        <span className="fieldLabel">Waveform template</span>
                                        <select
                                            value={card.waveform}
                                            onChange={(e) => updateCard(idx, { waveform: e.target.value })}
                                            className="select"
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

                        <div className="setupSmallNote">
                            Max {MAX_CARDS} cards per order. If someone needs more, handle as a bulk order manually
                            later.
                        </div>
                    </section>

                    <div className="setupActions">
                        <button type="submit" className="btn btnPrimary" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    inputMode,
}) {
    return (
        <label className="field">
            <span className="fieldLabel">
                {label} {required ? <span className="req">*</span> : null}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode={inputMode}
            />
        </label>
    );
}