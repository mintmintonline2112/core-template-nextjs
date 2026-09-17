"use client";

import { useState, type FormEvent } from "react";
import { env } from "@/lib/env";
import { ALMOND_VARIETIES, KERNEL_SIZES } from "@/config/products";
import { cn } from "@/utils/cn";

/** Các form public nối API backend: báo giá B2B, liên hệ, newsletter. */

/* ---------- Kiểu dùng chung ---------- */

const FORM = "p-[clamp(1.8rem,4vw,2.6rem)]";
const FORM_TITLE = "mb-6 border-b border-b-line pb-4 text-3xl";
/** Hai ô một hàng; điện thoại xếp dọc. */
const ROW = "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 max-[640px]:gap-0";
const FIELD = "mb-4";
const LABEL = "mb-2 block text-base font-semibold tracking-xs text-ink";
const REQ = "text-gold-500";
/** Viền xanh + quầng mờ khi focus (thay cho outline mặc định). */
const FOCUS_RING =
  "focus:border-navy-700 focus:ring-3 focus:ring-navy-700/15 focus:[outline:none]";
const INPUT = cn(
  "w-full rounded border border-line bg-paper px-4 py-3 font-main text-base text-ink transition-[border-color,box-shadow] duration-180 ease-brand placeholder:text-ink-faint/60 placeholder:italic",
  FOCUS_RING,
);
/** Chưa chọn (option rỗng, disabled) thì chữ xám như placeholder. */
const SELECT = cn(INPUT, "invalid:text-ink-faint");
const TEXTAREA = cn(INPUT, "min-h-24 resize-y");
const FORM_ERROR = "m-0 mb-4 text-base text-danger";
const FORM_PRIVACY = "mt-4 mb-0 text-center text-sm text-ink-faint italic";
/** Khung form báo giá (trên nền navy) / form liên hệ (trên nền sáng). */
const QUOTE_WRAP =
  "overflow-hidden rounded-lg bg-cream text-ink shadow-float shadow-black/50";
const CONTACT_WRAP =
  "overflow-hidden rounded-lg border border-line bg-paper shadow-lift";
/** Dấu tick tròn nhỏ. */
const CHECK =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-xs font-bold text-navy-700";

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${env.publicApiUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new Error(
      "You are sending too fast — please wait a minute and try again.",
    );
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
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
    <div className="p-[clamp(2.5rem,5vw,3.5rem)] text-center">
      <span
        className="mb-5 inline-flex h-16 w-16 animate-[pop_500ms_var(--ease)_both] text-navy-700 motion-reduce:animate-none [&>svg]:h-full [&>svg]:w-full"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m7.5 12.5 3 3 6-6.5" />
        </svg>
      </span>
      <h3 className="text-3xl">{title}</h3>
      <p className="mb-6 text-ink-soft">{body}</p>
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
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;
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
        // Backend chưa có cột ngày giao hàng → gộp vào message.
        message:
          [
            data.shipmentDate && `Target shipment date: ${data.shipmentDate}`,
            data.message,
          ]
            .filter(Boolean)
            .join("\n\n") || undefined,
      });
      setSuccess(
        `We received your request for ${data.variety}${data.volume ? ` — ${data.volume}` : ""}${
          data.destination ? `, destined for ${data.destination}` : ""
        }. Our team will review your requirements and prepare a commercial quotation based on current availability and market conditions.`,
      );
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send — please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className={cn(QUOTE_WRAP, "reveal is-visible")}>
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
    <div className={cn(QUOTE_WRAP, "reveal")}>
      <form className={FORM} onSubmit={onSubmit}>
        <h3 className={FORM_TITLE}>Request a Quote</h3>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-company">
              Company{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="text"
              id="qf-company"
              name="company"
              autoComplete="organization"
              required
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-email">
              Business Email{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="email"
              id="qf-email"
              name="email"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-name">
              Contact Name
            </label>
            <input
              className={INPUT}
              type="text"
              id="qf-name"
              name="contactName"
              autoComplete="name"
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-phone">
              Phone / WhatsApp
            </label>
            <input
              className={INPUT}
              type="tel"
              id="qf-phone"
              name="phone"
              autoComplete="tel"
              placeholder="Include country code"
            />
          </div>
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-variety">
              Product / Variety{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <select
              className={SELECT}
              id="qf-variety"
              name="variety"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a variety
              </option>
              {ALMOND_VARIETIES.map((v) => (
                <option key={v}>{v}</option>
              ))}
              <option>Other / Custom specification</option>
            </select>
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-size">
              Size &amp; Grade
            </label>
            <select
              className={SELECT}
              id="qf-size"
              name="sizeGrade"
              defaultValue=""
            >
              <option value="" disabled>
                Select a size
              </option>
              {KERNEL_SIZES.map((size) => (
                <option key={size}>{size}</option>
              ))}
              <option>Other / Custom</option>
            </select>
          </div>
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-volume">
              Required Volume{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="text"
              id="qf-volume"
              name="volume"
              placeholder="e.g. Pallet, truckload, or 1 × 40′ container"
              required
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-packaging">
              Packaging
            </label>
            <select
              className={SELECT}
              id="qf-packaging"
              name="packaging"
              defaultValue=""
            >
              <option value="" disabled>
                Select packaging
              </option>
              <option>50 lb cartons</option>
              <option>Other commercial packaging</option>
            </select>
          </div>
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor="qf-destination">
            Destination Country &amp; Port{" "}
            <span className={REQ} aria-hidden="true">
              *
            </span>
          </label>
          <input
            className={INPUT}
            type="text"
            id="qf-destination"
            name="destination"
            placeholder="e.g. Vietnam — Cat Lai Port"
            required
          />
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-shipment">
              Target Shipment Date
            </label>
            <input
              className={INPUT}
              type="text"
              id="qf-shipment"
              name="shipmentDate"
              placeholder="e.g. November 2026"
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="qf-incoterm">
              Preferred Incoterm
            </label>
            <select
              className={SELECT}
              id="qf-incoterm"
              name="incoterm"
              defaultValue=""
            >
              <option value="" disabled>
                Select Incoterm
              </option>
              <option>FOB</option>
              <option>CFR</option>
              <option>CIF</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor="qf-message">
            Special Specifications
          </label>
          <textarea
            className={TEXTAREA}
            id="qf-message"
            name="message"
            rows={4}
            placeholder="Grade, crop year, certifications, packing or labeling requirements…"
          />
        </div>

        {error ? (
          <p className={FORM_ERROR} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn-gold btn-block"
          disabled={sending}
        >
          {sending ? "Sending…" : "Request a Quote"}
        </button>
        <p className={FORM_PRIVACY}>
          Fields marked <span className={REQ}>*</span> are required. Wholesale
          and trade inquiries only.
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
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;
    setSending(true);
    setError(null);
    try {
      await postJson("client/contact", {
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        subject: data.company
          ? `${data.subject} — ${data.company}`
          : data.subject,
        message: data.country
          ? `[Country: ${data.country}]\n${data.message}`
          : data.message,
      });
      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send — please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className={cn(CONTACT_WRAP, "reveal is-visible")}>
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
    <div className={cn(CONTACT_WRAP, "reveal")}>
      <form className={FORM} onSubmit={onSubmit}>
        <h3 className={FORM_TITLE}>Send Us an Inquiry</h3>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-name">
              Full Name{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="text"
              id="cf-name"
              name="fullname"
              autoComplete="name"
              required
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-company">
              Company{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="text"
              id="cf-company"
              name="company"
              autoComplete="organization"
              required
            />
          </div>
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-email">
              Business Email{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="email"
              id="cf-email"
              name="email"
              autoComplete="email"
              required
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-phone">
              Phone / WhatsApp{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <input
              className={INPUT}
              type="tel"
              id="cf-phone"
              name="phone"
              autoComplete="tel"
              placeholder="Include country code"
              required
            />
          </div>
        </div>

        <div className={ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-country">
              Country
            </label>
            <input
              className={INPUT}
              type="text"
              id="cf-country"
              name="country"
              autoComplete="country-name"
              placeholder="e.g. Vietnam"
            />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-subject">
              Inquiry Type{" "}
              <span className={REQ} aria-hidden="true">
                *
              </span>
            </label>
            <select
              className={SELECT}
              id="cf-subject"
              name="subject"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a topic
              </option>
              <option>Request a quotation</option>
              <option>Distribution partnership</option>
              <option>Logistics &amp; documentation</option>
              <option>Product specifications</option>
              <option>General inquiry</option>
            </select>
          </div>
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor="cf-message">
            Message{" "}
            <span className={REQ} aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            className={TEXTAREA}
            id="cf-message"
            name="message"
            rows={6}
            minLength={10}
            required
            placeholder="Variety, size & grade, required volume, packaging, destination country & port, preferred Incoterm…"
          />
        </div>

        {error ? (
          <p className={FORM_ERROR} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn-gold btn-block"
          disabled={sending}
        >
          {sending ? "Sending…" : "Send Inquiry"}
        </button>
        <p className={FORM_PRIVACY}>
          Fields marked <span className={REQ}>*</span> are required. Your
          information is only used to respond to your inquiry.
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
      <div className="flex items-center gap-3 text-lg font-semibold text-navy-700">
        <span className={cn(CHECK, "h-[30px] w-[30px]")} aria-hidden="true">
          ✓
        </span>
        <span>Thank you — you&rsquo;re on the list.</span>
      </div>
    );
  }

  return (
    <form
      className="flex gap-3 max-[640px]:flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (event.currentTarget.checkValidity()) setDone(true);
        else event.currentTarget.reportValidity();
      }}
    >
      <label className="sr-only" htmlFor="nl-email">
        Business email
      </label>
      <input
        className={cn(
          "min-w-0 flex-1 rounded border border-line bg-cream px-4 py-3 font-main text-base text-ink",
          FOCUS_RING,
        )}
        type="email"
        id="nl-email"
        name="email"
        placeholder="Your business email"
        required
      />
      <button type="submit" className="btn btn-primary">
        Subscribe
      </button>
    </form>
  );
}
