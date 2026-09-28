"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import emailjs from "@emailjs/browser";

const fieldClass =
  "w-full rounded-xl border border-warm-ivory/25 bg-warm-ivory/5 px-4 py-3 text-base text-warm-ivory placeholder:text-warm-ivory/40 transition-colors focus:border-soft-sand focus:outline-none md:text-sm";

export default function FooterContactForm({ email }) {
  const t = useTranslations("Footer");
  // Use the translation if the key exists, otherwise the English default,
  // so a missing key never breaks the footer.
  const label = (key, fallback) => (t.has(key) ? t(key) : fallback);

  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Honeypot: real visitors never fill this in.
    if (data.website_url) return;

    setStatus("sending");
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          // Must match {{name}}, {{email}}, {{message}} in your template
          name: data.name,
          email: data.email,
          message:
            "Sent from the footer form: please get in touch with me.",
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY }
      );
      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error(
        "[footer form] EmailJS failed:",
        error?.status,
        error?.text || error
      );
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 text-left"
    >
      <label className="sr-only" htmlFor="footer-name">
        {label("formName", "Your name")}
      </label>
      <input
        id="footer-name"
        name="name"
        type="text"
        required
        autoComplete="name"
        placeholder={label("formName", "Your name")}
        className={fieldClass}
      />

      <label className="sr-only" htmlFor="footer-email">
        {label("formEmail", "Your email")}
      </label>
      <input
        id="footer-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={label("formEmail", "Your email")}
        className={fieldClass}
      />

      {/* Honeypot field, hidden from people and screen readers */}
      <input
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-warm-ivory px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-soft-sand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending"
          ? label("formSending", "Sending...")
          : label("formSend", "Send message")}
        <ArrowRight size={15} />
      </button>

      <div aria-live="polite" className="min-h-5 text-xs leading-relaxed">
        {status === "sent" && (
          <p className="text-soft-sand">
            {label("formSuccess", "Thank you! We'll get back to you soon.")}
          </p>
        )}
        {status === "error" && (
          <p className="text-warm-ivory/70">
            {label("formError", "Something went wrong. Please email us at")}{" "}
            
              href={`mailto:${email}`}
              className="underline [overflow-wrap:anywhere] hover:text-soft-sand"
            <a>
              {email}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}