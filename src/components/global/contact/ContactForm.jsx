import './contactForm.css';
import { useForm, ValidationError } from '@formspree/react';

export default function ContactForm() {
  const [state, handleSubmit] = useForm("xjkrrqnd");

  if (state.succeeded) {
    return (
      <div className="contact-container">
        <h2>Contact Exact 3D Design</h2>
        <p className="success-message">Thanks for reaching out! We’ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <h2>Contact Exact 3D Design</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" name="name" required />
        <ValidationError prefix="Name" field="name" errors={state.errors} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" required />
        <ValidationError prefix="Email" field="email" errors={state.errors} />

        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" required />
        <ValidationError prefix="Message" field="message" errors={state.errors} />

        <button type="submit" disabled={state.submitting}>
          {state.submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}