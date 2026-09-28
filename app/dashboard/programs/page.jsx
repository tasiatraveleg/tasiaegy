"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Plus, Trash2, Pencil, Upload, X, GripVertical } from "lucide-react";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/programs";
import { uploadToCloudinary, withTransform } from "@/lib/cloudinary";
import {
  LOCALES,
  LOCALE_LABELS,
  DEFAULT_LOCALE,
  PROGRAM_TEXT_FIELDS,
  DAY_TEXT_FIELDS,
  INCLUDED_TEXT_FIELDS,
  localizeProgram,
} from "@/lib/localize";
import { INCLUDED_ICONS, getIncludedIcon } from "@/lib/includedIcons";

// Small Cloudinary-side thumbnail so the browser downloads a few KB
// instead of the full-size original.
const THUMB = "c_fill,w_192,h_128,q_auto,f_auto";
const thumb = (url) => withTransform(url, THUMB);

// ---------------------------------------------------------------------------
// Form shape. Text is stored per language; images, icons and the tag are shared.
// ---------------------------------------------------------------------------

const blankTexts = (fields) => Object.fromEntries(fields.map((f) => [f, ""]));

const perLocale = (fields) =>
  Object.fromEntries(LOCALES.map((loc) => [loc, blankTexts(fields)]));

const emptyDay = () => ({
  image: "",
  imagePublicId: "",
  translations: perLocale(DAY_TEXT_FIELDS),
});

const emptyIncluded = () => ({
  icon: "star",
  translations: perLocale(INCLUDED_TEXT_FIELDS),
});

const emptyForm = () => ({
  tag: "Signature",
  coverImageUrl: "",
  coverImagePublicId: "",
  translations: perLocale(PROGRAM_TEXT_FIELDS),
  days: [],
  included: [],
});

// Reads one language's text. Programs saved before translations existed kept
// their (English) text at the top level, so English falls back to that.
// Unknown keys already in `saved` are kept so a save doesn't erase them.
function readTexts(saved, legacy, fields, locale) {
  const fallback = locale === DEFAULT_LOCALE ? legacy : {};
  const out = { ...saved };
  for (const field of fields) out[field] = saved?.[field] ?? fallback?.[field] ?? "";
  return out;
}

function readAllLocales(item, fields) {
  return Object.fromEntries(
    LOCALES.map((loc) => [loc, readTexts(item.translations?.[loc], item, fields, loc)])
  );
}

function programToForm(program) {
  const form = emptyForm();
  form.tag = program.tag ?? form.tag;
  form.coverImageUrl = program.coverImageUrl ?? "";
  form.coverImagePublicId = program.coverImagePublicId ?? "";
  form.translations = readAllLocales(program, PROGRAM_TEXT_FIELDS);

  form.days = (program.days ?? []).map((day) => ({
    image: day.image ?? "",
    imagePublicId: day.imagePublicId ?? "",
    translations: readAllLocales(day, DAY_TEXT_FIELDS),
  }));

  form.included = (program.included ?? []).map((raw) => {
    const item = typeof raw === "string" ? { text: raw } : raw;
    return {
      icon: item.icon ?? "star",
      translations: readAllLocales(item, INCLUDED_TEXT_FIELDS),
    };
  });

  return form;
}

function formToPayload(form) {
  const en = form.translations[DEFAULT_LOCALE];
  return {
    tag: form.tag,
    coverImageUrl: form.coverImageUrl,
    coverImagePublicId: form.coverImagePublicId,
    // English is mirrored at the top level so anything that hasn't been
    // switched to localizeProgram() yet keeps showing the English text.
    title: en.title,
    duration: en.duration,
    route: en.route,
    summary: en.summary,
    translations: form.translations,
    days: form.days,
    included: form.included,
  };
}

const isBlank = (value) => !value || !value.trim();

// What's still empty in one language, as human-readable names.
function missingFor(form, loc) {
  const missing = [];
  const texts = form.translations[loc];
  for (const field of PROGRAM_TEXT_FIELDS) {
    if (isBlank(texts[field])) missing.push(field);
  }
  form.days.forEach((day, i) => {
    const d = day.translations[loc];
    if (isBlank(d.title)) missing.push(`day ${i + 1} title`);
    if (isBlank(d.description)) missing.push(`day ${i + 1} description`);
  });
  form.included.forEach((item, i) => {
    if (isBlank(item.translations[loc].text)) missing.push(`included item ${i + 1}`);
  });
  return missing;
}

// Defined at module level (not inside the page component) so inputs keep
// focus while typing.
function TextField({ label, value, onChange, placeholder, required, multiline }) {
  const Control = multiline ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-xs text-charcoal/60">{label}</span>
      <Control
        required={required}
        rows={multiline ? 3 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}

export default function DashboardProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [uploading, setUploading] = useState(false);
  const [uploadingDayIndex, setUploadingDayIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEnglish = locale === DEFAULT_LOCALE;
  const texts = form.translations[locale];
  const english = form.translations[DEFAULT_LOCALE];

  const missing = useMemo(
    () => Object.fromEntries(LOCALES.map((loc) => [loc, missingFor(form, loc)])),
    [form]
  );

  // In other languages, show the English text as the placeholder so it's
  // easy to see what needs translating.
  const hint = (englishValue, example) =>
    isEnglish ? example : englishValue?.trim() || example;

  async function loadPrograms() {
    setLoading(true);
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch {
      setError(
        "Couldn't load programs. Check your Firebase configuration in .env.local."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  function openForm(nextForm, id) {
    setForm(nextForm);
    setEditingId(id);
    setLocale(DEFAULT_LOCALE);
    setError(null);
    setShowForm(true);
  }

  function startCreate() {
    openForm(emptyForm(), null);
  }

  function startEdit(program) {
    openForm(programToForm(program), program.id);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  // ---- text edits (always for the language tab that's open) ----

  function setProgramText(field, value) {
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [locale]: { ...f.translations[locale], [field]: value },
      },
    }));
  }

  function setDayText(index, field, value) {
    setForm((f) => ({
      ...f,
      days: f.days.map((day, i) =>
        i === index
          ? {
              ...day,
              translations: {
                ...day.translations,
                [locale]: { ...day.translations[locale], [field]: value },
              },
            }
          : day
      ),
    }));
  }

  function setIncludedText(index, value) {
    setForm((f) => ({
      ...f,
      included: f.included.map((item, i) =>
        i === index
          ? {
              ...item,
              translations: {
                ...item.translations,
                [locale]: { ...item.translations[locale], text: value },
              },
            }
          : item
      ),
    }));
  }

  function setIncludedIcon(index, icon) {
    setForm((f) => ({
      ...f,
      included: f.included.map((item, i) =>
        i === index ? { ...item, icon } : item
      ),
    }));
  }

  // ---- structure edits (shared by every language) ----

  function addDay() {
    setForm((f) => ({ ...f, days: [...f.days, emptyDay()] }));
  }

  function removeDay(index) {
    setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== index) }));
  }

  function addIncluded() {
    setForm((f) => ({ ...f, included: [...f.included, emptyIncluded()] }));
  }

  function removeIncluded(index) {
    setForm((f) => ({
      ...f,
      included: f.included.filter((_, i) => i !== index),
    }));
  }

  // ---- uploads ----

  async function handleImageUpload(file) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToCloudinary(file, "programs");
      setForm((f) => ({
        ...f,
        coverImageUrl: result.secure_url,
        coverImagePublicId: result.public_id,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDayImageUpload(index, file) {
    setUploadingDayIndex(index);
    setError(null);
    try {
      const result = await uploadToCloudinary(file, "programs/days");
      setForm((f) => ({
        ...f,
        days: f.days.map((day, i) =>
          i === index
            ? { ...day, image: result.secure_url, imagePublicId: result.public_id }
            : day
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingDayIndex(null);
    }
  }

  // ---- save / delete ----

  async function handleSave(e) {
    e.preventDefault();

    // The other languages fall back to English, so English must be complete.
    // (Its inputs aren't on screen while another tab is open, so the browser's
    // own "required" check can't catch this.)
    if (missing[DEFAULT_LOCALE].length > 0) {
      setLocale(DEFAULT_LOCALE);
      setError(
        `Finish the English version first — the other languages fall back to it. Missing: ${missing[
          DEFAULT_LOCALE
        ].join(", ")}.`
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await updateProgram(editingId, payload);
      } else {
        await createProgram({ ...payload, order: programs.length });
      }
      setShowForm(false);
      await loadPrograms();
    } catch (err) {
      console.error("Failed to save program:", err);
      const message =
        err?.code === "permission-denied"
          ? "Firestore blocked this write — check your security rules allow signed-in users to write, and that you're still signed in."
          : `Couldn't save this program: ${err?.message ?? "unknown error"}`;
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this program? This can't be undone.")) return;
    await deleteProgram(id);
    await loadPrograms();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl italic text-charcoal">
            Programs
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Manage the journeys shown on the public site.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-warm-ivory hover:bg-navy-dark"
        >
          <Plus size={16} />
          New program
        </button>
      </div>

      {error && !showForm && (
        <p className="mb-6 rounded-xl bg-navy/10 px-4 py-3 text-sm text-navy">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-charcoal/60">Loading…</p>
      ) : programs.length === 0 ? (
        <p className="text-sm text-charcoal/60">
          No programs yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {programs.map((program) => {
            const en = localizeProgram(program, DEFAULT_LOCALE);
            return (
              <div
                key={program.id}
                className="flex items-center gap-4 rounded-2xl border border-charcoal/10 bg-white/40 p-4"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-warm-beige">
                  {program.coverImageUrl && (
                    <Image
                      src={thumb(program.coverImageUrl)}
                      alt={en.title ?? ""}
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal">{en.title}</p>
                  <p className="mt-0.5 text-xs text-charcoal/60">
                    {program.tag} · {en.duration} · {en.route}
                    {en.days.length
                      ? ` · ${en.days.length} day${en.days.length === 1 ? "" : "s"}`
                      : ""}
                  </p>
                  <div className="mt-1.5 flex gap-1">
                    {LOCALES.map((loc) => {
                      const translated =
                        loc === DEFAULT_LOCALE
                          ? Boolean(en.title)
                          : Boolean(program.translations?.[loc]?.title?.trim());
                      return (
                        <span
                          key={loc}
                          title={`${LOCALE_LABELS[loc]}: ${
                            translated ? "has a title" : "not translated yet"
                          }`}
                          className={clsx(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            translated
                              ? "bg-navy/10 text-navy"
                              : "bg-charcoal/5 text-charcoal/30"
                          )}
                        >
                          {loc.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(program)}
                  className="rounded-full p-2 text-charcoal/60 hover:bg-warm-beige/60"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
                  className="rounded-full p-2 text-charcoal/60 hover:bg-navy/10 hover:text-navy"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-6">
          <form
            onSubmit={handleSave}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-warm-ivory"
          >
            <div className="flex items-center justify-between px-8 pt-8">
              <h2 className="font-display text-xl italic text-charcoal">
                {editingId ? "Edit program" : "New program"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-charcoal/50 hover:text-charcoal"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Language tabs stay put while the fields below scroll */}
            <div className="px-8 pt-5">
              <div role="tablist" aria-label="Language" className="flex flex-wrap gap-2">
                {LOCALES.map((loc) => {
                  const complete = missing[loc].length === 0;
                  const active = loc === locale;
                  return (
                    <button
                      key={loc}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setLocale(loc)}
                      className={clsx(
                        "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-navy text-warm-ivory"
                          : "border border-charcoal/20 text-charcoal/70 hover:bg-warm-beige/60"
                      )}
                    >
                      {LOCALE_LABELS[loc]}
                      <span
                        title={
                          complete
                            ? "Everything is filled in"
                            : `Missing: ${missing[loc].join(", ")}`
                        }
                        className={clsx(
                          "h-1.5 w-1.5 rounded-full",
                          complete
                            ? "bg-soft-sand"
                            : "border border-current bg-transparent"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-charcoal/50">
                {isEnglish
                  ? "English is required — the other languages fall back to it wherever they're left blank. The tag, images and icons are the same in every language."
                  : `Editing ${LOCALE_LABELS[locale]}. Anything left blank shows the English text on the public site.`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="flex flex-col gap-5">
                {/* Shared */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs text-charcoal/60">Tag</span>
                    <select
                      value={form.tag}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tag: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-navy"
                    >
                      <option>Signature</option>
                      <option>New</option>
                      <option>Classic</option>
                      <option>Limited</option>
                      <option>Spiritual</option>
                    </select>
                  </label>

                  <div>
                    <span className="text-xs text-charcoal/60">Cover image</span>
                    <div className="mt-1 flex items-center gap-3">
                      {form.coverImageUrl && (
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-warm-beige">
                          <Image
                            src={thumb(form.coverImageUrl)}
                            alt="Cover preview"
                            fill
                            sizes="64px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}
                      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/70 hover:bg-warm-beige/60">
                        <Upload size={14} />
                        {uploading ? "Uploading…" : "Upload image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Text for the open language */}
                <TextField
                  label="Title"
                  required={isEnglish}
                  value={texts.title}
                  onChange={(v) => setProgramText("title", v)}
                  placeholder={hint(english.title, "The Long Exodus")}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    label="Duration"
                    required={isEnglish}
                    value={texts.duration}
                    onChange={(v) => setProgramText("duration", v)}
                    placeholder={hint(english.duration, "14 days")}
                  />
                  <TextField
                    label="Route"
                    required={isEnglish}
                    value={texts.route}
                    onChange={(v) => setProgramText("route", v)}
                    placeholder={hint(english.route, "Cairo to Aswan")}
                  />
                </div>

                <TextField
                  label="Summary"
                  multiline
                  required={isEnglish}
                  value={texts.summary}
                  onChange={(v) => setProgramText("summary", v)}
                  placeholder={hint(english.summary, "")}
                />

                {/* Itinerary days */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/60">
                      Itinerary days
                    </span>
                    <button
                      type="button"
                      onClick={addDay}
                      className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                    >
                      <Plus size={12} />
                      Add day
                    </button>
                  </div>

                  {form.days.length === 0 ? (
                    <p className="mt-2 text-xs text-charcoal/50">
                      No days added yet.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-3">
                      {form.days.map((day, index) => {
                        const dayText = day.translations[locale];
                        const dayEnglish = day.translations[DEFAULT_LOCALE];
                        return (
                          <div
                            key={index}
                            className="rounded-xl border border-charcoal/15 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-medium text-charcoal/60">
                                <GripVertical
                                  size={14}
                                  className="text-charcoal/30"
                                />
                                Day {index + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDay(index)}
                                className="text-charcoal/40 hover:text-navy"
                                aria-label={`Remove day ${index + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="mb-2 flex items-center gap-3">
                              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-warm-beige">
                                {day.image && (
                                  <Image
                                    src={thumb(day.image)}
                                    alt={dayEnglish.title || `Day ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    unoptimized
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal/70 hover:bg-warm-beige/60">
                                <Upload size={12} />
                                {uploadingDayIndex === index
                                  ? "Uploading…"
                                  : day.image
                                  ? "Replace image"
                                  : "Upload image"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDayImageUpload(index, file);
                                  }}
                                />
                              </label>
                            </div>

                            <input
                              required={isEnglish}
                              aria-label={`Day ${index + 1} title`}
                              value={dayText.title}
                              onChange={(e) =>
                                setDayText(index, "title", e.target.value)
                              }
                              className="mb-2 w-full rounded-lg border border-charcoal/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-navy"
                              placeholder={hint(dayEnglish.title, "Arrival in Cairo")}
                            />
                            <textarea
                              required={isEnglish}
                              aria-label={`Day ${index + 1} description`}
                              rows={2}
                              value={dayText.description}
                              onChange={(e) =>
                                setDayText(index, "description", e.target.value)
                              }
                              className="w-full rounded-lg border border-charcoal/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-navy"
                              placeholder={hint(
                                dayEnglish.description,
                                "Land in Cairo, transfer to your hotel, and settle in ahead of tomorrow's journey."
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* What's included */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/60">
                      What&apos;s included
                    </span>
                    <button
                      type="button"
                      onClick={addIncluded}
                      className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                    >
                      <Plus size={12} />
                      Add item
                    </button>
                  </div>

                  {form.included.length === 0 ? (
                    <p className="mt-2 text-xs text-charcoal/50">
                      Nothing added — the public page shows its default list
                      until you add items here.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-3">
                      {form.included.map((item, index) => {
                        const Icon = getIncludedIcon(item.icon);
                        const itemEnglish = item.translations[DEFAULT_LOCALE];
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-xl border border-charcoal/15 p-3"
                          >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-beige">
                              <Icon size={16} className="text-navy" />
                            </span>
                            <div className="flex-1 space-y-2">
                              <select
                                value={item.icon}
                                onChange={(e) =>
                                  setIncludedIcon(index, e.target.value)
                                }
                                aria-label={`Icon for included item ${index + 1}`}
                                className="w-full rounded-lg border border-charcoal/15 bg-transparent px-3 py-1.5 text-xs outline-none focus:border-navy"
                              >
                                {Object.entries(INCLUDED_ICONS).map(
                                  ([key, { label }]) => (
                                    <option key={key} value={key}>
                                      {label}
                                    </option>
                                  )
                                )}
                              </select>
                              <input
                                required={isEnglish}
                                aria-label={`Included item ${index + 1} text`}
                                value={item.translations[locale].text}
                                onChange={(e) =>
                                  setIncludedText(index, e.target.value)
                                }
                                className="w-full rounded-lg border border-charcoal/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-navy"
                                placeholder={hint(
                                  itemEnglish.text,
                                  "Daily breakfast and curated dinners"
                                )}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeIncluded(index)}
                              className="mt-2 text-charcoal/40 hover:text-navy"
                              aria-label={`Remove included item ${index + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-charcoal/10 px-8 py-4">
              {error && (
                <p className="mb-3 rounded-xl bg-navy/10 px-4 py-3 text-sm text-navy">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={saving || uploading || uploadingDayIndex !== null}
                className="w-full rounded-full bg-navy px-6 py-3 text-sm font-medium text-warm-ivory hover:bg-navy-dark disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingId
                  ? "Save changes"
                  : "Create program"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}