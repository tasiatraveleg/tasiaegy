"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import emailjs from "@emailjs/browser";

const fieldClass =
  "mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-navy";

export default function ContactForm() {
  const t = useTranslations("ContactPage");
  // Falls back to English if a translation key doesn't exist yet
  const label = (key, fallback) => (t.has(key) ? t(key) : fallback);

  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Honeypot: real visitors never fill this in
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
          message: data.message,
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY }
      );
      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error("EmailJS failed:", error?.status, error?.text || error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="contact-name" className="text-xs text-charcoal/60">
          {t("nameLabel")}
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          autoComplete="name"
          className={fieldClass}
          placeholder={t("namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-xs text-charcoal/60">
          {t("emailLabel")}
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          className={fieldClass}
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs text-charcoal/60">
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className={fieldClass}
          placeholder={t("messagePlaceholder")}
        />
      </div>

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
        className="mt-2 self-start rounded-full bg-navy px-8 py-3 text-sm font-medium text-warm-ivory transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? label("sending", "Sending...") : t("submit")}
      </button>

      <div aria-live="polite" className="min-h-5 text-sm">
        {status === "sent" && (
          <p className="text-navy">
            {label("success", "Thank you! We'll get back to you soon.")}
          </p>
        )}
        {status === "error" && (
          <p className="text-charcoal/70">
            {label(
              "error",
              "Something went wrong. Please email us directly at"
            )}{" "}
            
              href="mailto:tasiatraveleg@gmail.com"
              className="underline hover:text-navy"
            <a>
              tasiatraveleg@gmail.com
            </a>
          </p>
        )}
      </div>
    </form>
  );
}