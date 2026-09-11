"use client";

import { useState, type FormEvent } from "react";
import { env } from "@/lib/env";
import { ALMOND_VARIETIES, KERNEL_SIZES } from "@/config/products";

/** Các form public nối API backend: báo giá B2B, liên hệ, newsletter. */

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${env.publicApiUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new Error("You are sending too fast — please wait a minute and try again.");
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message)
      ? payload?.message.join(", ")
      : payload?.message;
    throw new Error(message || "Could not send — please try again.");
  }
  return response.json().catch(() => null);
}

function SuccessPanel({
  title,
  body,
  onReset,
  resetLabel,
}: {
  title: string;
  body: string;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <div className="quote-success">
      <span className="quote-success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m7.5 12.5 3 3 6-6.5" />
        </svg>
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <button type="button" className="btn btn-ghost-dark" onClick={onReset}>
        {resetLabel}
      </button>
    </div>
  );
}

/* ============ QUOTE FORM ============ */

export function QuoteForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setSending(true);
    setError(null);
    try {
      await postJson("client/quote-requests", {
        company: data.company,
        contactName: data.contactName || undefined,
        email: data.email,
        phone: data.phone || undefined,
        variety: data.variety,
        sizeGrade: data.sizeGrade || undefined,
        volume: data.volume,
        packaging: data.packaging || undefined,
        destination: data.destination,
        incoterm: data.incoterm || undefined,
        message: data.message || undefined,
      });
      setSuccess(
        `We received your request for ${data.variety}${data.volume ? ` — ${data.volume}` : ""}${
          data.destination ? `, destined for ${data.destination}` : ""
        }. Our team will review your requirements and prepare a commercial quotation based on current availability and market conditions.`,
      );
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="quote-form-wrap reveal is-visible">
        <SuccessPanel
          title="Thank you — request received"
          body={success}
          onReset={() => setSuccess(null)}
          resetLabel="Submit another request"
        />
      </div>
    );
  }

  return (
    <div className="quote-form-wrap reveal">
      <form className="quote-form" onSubmit={onSubmit}>
        <h3 className="quote-form-title">Request a B2B Quote</h3>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="qf-company">Company <span className="req" aria-hidden="true">*</span></label>
            <input type="text" id="qf-company" name="company" autoComplete="organization" required />
          </div>
          <div className="form-field">
            <label htmlFor="qf-email">Business Email <span className="req" aria-hidden="true">*</span></label>
            <input type="email" id="qf-email" name="email" autoComplete="email" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="qf-name">Contact Name</label>
            <input type="text" id="qf-name" name="contactName" autoComplete="name" />
          </div>
          <div className="form-field">
            <label htmlFor="qf-phone">Phone / WhatsApp</label>
            <input type="tel" id="qf-phone" name="phone" autoComplete="tel" placeholder="Include country code" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="qf-variety">Almond Variety <span className="req" aria-hidden="true">*</span></label>
            <select id="qf-variety" name="variety" required defaultValue="">
              <option value="" disabled>Select a variety</option>
              {ALMOND_VARIETIES.map((v) => (
                <option key={v}>{v}</option>
              ))}
              <option>Mixed / To be discussed</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="qf-size">Size &amp; Grade</label>
            <select id="qf-size" name="sizeGrade" defaultValue="">
              <option value="" disabled>Select a size</option>
              {KERNEL_SIZES.map((size) => (
                <option key={size}>{size}</option>
              ))}
              <option>Other / Custom</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="qf-volume">Required Volume <span className="req" aria-hidden="true">*</span></label>
            <input type="text" id="qf-volume" name="volume" placeholder="e.g. 1 × 40′ FCL / 20 MT" required />
          </div>
          <div className="form-field">
            <label htmlFor="qf-packaging">Packaging</label>
            <select id="qf-packaging" name="packaging" defaultValue="">
              <option value="" disabled>Select packaging</option>
              <option>50 lb cartons</option>
              <option>Palletized shipment</option>
              <option>Bulk packaging</option>
              <option>Custom packaging</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="qf-destination">Destination Country &amp; Port <span className="req" aria-hidden="true">*</span></label>
            <input type="text" id="qf-destination" name="destination" placeholder="e.g. Vietnam — Cat Lai Port" required />
          </div>
          <div className="form-field">
            <label htmlFor="qf-incoterm">Preferred Incoterm</label>
            <select id="qf-incoterm" name="incoterm" defaultValue="">
              <option value="" disabled>Select Incoterm</option>
              <option>FOB</option><option>CFR</option><option>CIF</option><option>Other</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="qf-message">Additional Requirements</label>
          <textarea id="qf-message" name="message" rows={4} placeholder="Certifications, target shipment window, other specifications…" />
        </div>

        {error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : null}

        <button type="submit" className="btn btn-gold btn-block" disabled={sending}>
          {sending ? "Sending…" : "Submit Quote Request"}
        </button>
        <p className="form-privacy">
          Fields marked <span className="req">*</span> are required. Your information is only
          used to prepare your quotation.
        </p>
      </form>
    </div>
  );
}

/* ============ CONTACT FORM ============ */

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setSending(true);
    setError(null);
    try {
      await postJson("client/contact", {
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        subject: data.company ? `${data.subject} — ${data.company}` : data.subject,
        message: data.country ? `[Country: ${data.country}]\n${data.message}` : data.message,
      });
      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="contact-form-wrap reveal is-visible">
        <SuccessPanel
          title="Thank you — inquiry received"
          body="Our team will review your message and respond within 1–2 business days with current availability and next steps."
          onReset={() => setSuccess(false)}
          resetLabel="Send another inquiry"
        />
      </div>
    );
  }

  return (
    <div className="contact-form-wrap reveal">
      <form className="quote-form" onSubmit={onSubmit}>
        <h3 className="quote-form-title">Send Us an Inquiry</h3>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="cf-name">Full Name <span className="req" aria-hidden="true">*</span></label>
            <input type="text" id="cf-name" name="fullname" autoComplete="name" required />
          </div>
          <div className="form-field">
            <label htmlFor="cf-company">Company <span className="req" aria-hidden="true">*</span></label>
            <input type="text" id="cf-company" name="company" autoComplete="organization" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="cf-email">Business Email <span className="req" aria-hidden="true">*</span></label>
            <input type="email" id="cf-email" name="email" autoComplete="email" required />
          </div>
          <div className="form-field">
            <label htmlFor="cf-phone">Phone / WhatsApp <span className="req" aria-hidden="true">*</span></label>
            <input type="tel" id="cf-phone" name="phone" autoComplete="tel" placeholder="Include country code" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="cf-country">Country</label>
            <input type="text" id="cf-country" name="country" autoComplete="country-name" placeholder="e.g. Vietnam" />
          </div>
          <div className="form-field">
            <label htmlFor="cf-subject">Inquiry Type <span className="req" aria-hidden="true">*</span></label>
            <select id="cf-subject" name="subject" required defaultValue="">
              <option value="" disabled>Select a topic</option>
              <option>Request a quotation</option>
              <option>Distribution partnership</option>
              <option>Logistics &amp; documentation</option>
              <option>Product specifications</option>
              <option>General inquiry</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="cf-message">Message <span className="req" aria-hidden="true">*</span></label>
          <textarea
            id="cf-message"
            name="message"
            rows={6}
            minLength={10}
            required
            placeholder="Variety, size & grade, required volume, packaging, destination country & port, preferred Incoterm…"
          />
        </div>

        {error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : null}

        <button type="submit" className="btn btn-gold btn-block" disabled={sending}>
          {sending ? "Sending…" : "Send Inquiry"}
        </button>
        <p className="form-privacy">
          Fields marked <span className="req">*</span> are required. Your information is only
          used to respond to your inquiry.
        </p>
      </form>
    </div>
  );
}

/* ============ NEWSLETTER (demo) ============ */

export function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="newsletter-success">
        <span className="doc-check" aria-hidden="true">✓</span>
        <span>Thank you — you&rsquo;re on the list.</span>
      </div>
    );
  }

  return (
    <form
      className="newsletter-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (event.currentTarget.checkValidity()) setDone(true);
        else event.currentTarget.reportValidity();
      }}
    >
      <label className="sr-only" htmlFor="nl-email">Business email</label>
      <input type="email" id="nl-email" name="email" placeholder="Your business email" required />
      <button type="submit" className="btn btn-primary">Subscribe</button>
    </form>
  );
}
