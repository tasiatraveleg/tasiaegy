"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, Upload, X } from "lucide-react";
import clsx from "clsx";
import {
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  slugify,
} from "@/lib/gallery";
import {
  getCountryRecords,
  saveCountry,
  deleteCountry,
} from "@/lib/countries";
import { uploadToCloudinary, withTransform } from "@/lib/cloudinary";

const NEW_COUNTRY = "__new__";

const EMPTY_PT = { name: "", description: "" };

const EMPTY_FORM = {
  name: "",
  country: "Egypt",
  description: "",
  mediaType: "image",
  url: "",
  publicId: "",
  translations: { pt: EMPTY_PT },
};

const EMPTY_COUNTRY = {
  name: "",
  ptName: "",
  coverImageUrl: "",
  coverImagePublicId: "",
};

const LANG_TABS = [
  { key: "en", label: "English" },
  { key: "pt", label: "Português" },
];

// Small Cloudinary-side thumbnails so the browser downloads a few KB
// instead of the full-size original.
const THUMB = "c_fill,w_192,h_128,q_auto,f_auto";
const COVER_THUMB = "c_pad,ar_3:4,w_240,b_rgb:f9f2e9,q_auto,f_auto";

const inputClass =
  "mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-navy";

const slugOf = (name) => slugify(name || "Egypt");

export default function DashboardGalleryPage() {
  // Places
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [lang, setLang] = useState("en");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Countries
  const [countryRecords, setCountryRecords] = useState([]);
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [countryForm, setCountryForm] = useState(EMPTY_COUNTRY);
  const [countryNameLocked, setCountryNameLocked] = useState(false);
  const [countryFromPlace, setCountryFromPlace] = useState(false);
  const [countryUploading, setCountryUploading] = useState(false);
  const [countrySaving, setCountrySaving] = useState(false);
  const [countryError, setCountryError] = useState(null);

  async function loadItems() {
    setLoading(true);
    try {
      const [data, records] = await Promise.all([
        getGalleryItems(),
        getCountryRecords().catch(() => []),
      ]);
      setItems(data);
      setCountryRecords(records);
    } catch {
      setError(
        "Couldn't load the gallery. Check your Firebase configuration in .env.local."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // ---- Derived country data -------------------------------------------
  const placeCountryNames = items.map((i) => i.country || "Egypt");

  // One entry per country slug: names from places first, then any country
  // that only exists as a record (no places yet).
  const nameBySlug = new Map();
  placeCountryNames.forEach((n) => {
    if (!nameBySlug.has(slugOf(n))) nameBySlug.set(slugOf(n), n);
  });
  countryRecords.forEach((r) => {
    if (!nameBySlug.has(r.id)) nameBySlug.set(r.id, r.name);
  });
  const countryNames = [...nameBySlug.values()];

  const recordFor = (name) =>
    countryRecords.find((r) => r.id === slugOf(name)) ?? null;

  const countryCards = countryNames.map((name) => ({
    name,
    record: recordFor(name),
    count: placeCountryNames.filter((n) => slugOf(n) === slugOf(name)).length,
  }));

  // ---- Country form -----------------------------------------------------
  function openCountryForm({ name = "", fromPlace = false } = {}) {
    const rec = name ? recordFor(name) : null;
    setCountryForm({
      name,
      ptName: rec?.translations?.pt?.name ?? "",
      coverImageUrl: rec?.coverImageUrl ?? "",
      coverImagePublicId: rec?.coverImagePublicId ?? "",
    });
    setCountryNameLocked(Boolean(name));
    setCountryFromPlace(fromPlace);
    setCountryError(null);
    setShowCountryForm(true);
  }

  async function handleCoverUpload(file) {
    setCountryUploading(true);
    setCountryError(null);
    try {
      const result = await uploadToCloudinary(file, "countries");
      setCountryForm((f) => ({
        ...f,
        coverImageUrl: result.secure_url,
        coverImagePublicId: result.public_id,
      }));
    } catch (err) {
      setCountryError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setCountryUploading(false);
    }
  }

  async function handleCountrySave(e) {
    e.preventDefault();
    setCountryError(null);

    const name = countryForm.name.trim();
    if (!name) {
      setCountryError("Please enter the country name.");
      return;
    }
    if (!countryNameLocked && recordFor(name)) {
      setCountryError(
        "This country already exists — edit it from the Countries section."
      );
      return;
    }

    const ptName = countryForm.ptName.trim();

    setCountrySaving(true);
    try {
      await saveCountry(name, {
        coverImageUrl: countryForm.coverImageUrl,
        coverImagePublicId: countryForm.coverImagePublicId,
        translations: ptName ? { pt: { name: ptName } } : {},
      });
      setShowCountryForm(false);
      if (countryFromPlace) {
        setForm((f) => ({ ...f, country: name }));
      }
      await loadItems();
    } catch (err) {
      console.error("Failed to save country:", err);
      const message =
        err?.code === "permission-denied"
          ? "Firestore blocked this write — check your security rules allow signed-in users to write to the 'countries' collection."
          : `Couldn't save this country: ${err?.message ?? "unknown error"}`;
      setCountryError(message);
    } finally {
      setCountrySaving(false);
    }
  }

  async function handleCountryDelete(record) {
    if (
      !confirm(
        "Remove this country's cover photo and Portuguese name? Its places stay in the gallery."
      )
    )
      return;
    try {
      await deleteCountry(record.id);
      await loadItems();
    } catch (err) {
      setError(`Couldn't remove this country: ${err?.message ?? "unknown error"}`);
    }
  }

  // ---- Place form -------------------------------------------------------
  function setPt(field, value) {
    setForm((f) => ({
      ...f,
      translations: { pt: { ...f.translations.pt, [field]: value } },
    }));
  }

  function startCreate() {
    setForm({
      ...EMPTY_FORM,
      country: countryNames[0] ?? "Egypt",
      translations: { pt: { ...EMPTY_PT } },
    });
    setEditingId(null);
    setLang("en");
    setError(null);
    setShowForm(true);
  }

  function startEdit(item) {
    const pt = item.translations?.pt ?? {};
    setForm({
      name: item.name ?? "",
      country: item.country ?? "Egypt",
      description: item.description ?? "",
      mediaType: item.mediaType ?? "image",
      url: item.url ?? "",
      publicId: item.publicId ?? "",
      translations: {
        pt: {
          name: pt.name ?? "",
          description: pt.description ?? "",
        },
      },
    });
    setEditingId(item.id);
    setLang("en");
    setError(null);
    setShowForm(true);
  }

  function handleCountrySelect(value) {
    if (value === NEW_COUNTRY) {
      openCountryForm({ fromPlace: true });
      return;
    }
    setForm((f) => ({ ...f, country: value }));
  }

  async function handleMediaUpload(file) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToCloudinary(file, "gallery");
      setForm((f) => ({
        ...f,
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: result.resource_type === "video" ? "video" : "image",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);

    // English fields are required. They may be on the hidden tab, so the
    // browser can't check them for us — validate here instead.
    if (
      !form.name.trim() ||
      !form.country.trim() ||
      !form.description.trim()
    ) {
      setLang("en");
      setError("Please fill in the name, country and description in English.");
      return;
    }

    // Only keep Portuguese fields that were actually filled in, so anything
    // left empty falls back to the English text on the public site.
    const pt = Object.fromEntries(
      Object.entries(form.translations.pt)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value)
    );

    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      description: form.description.trim(),
      mediaType: form.mediaType,
      url: form.url,
      publicId: form.publicId,
      translations: Object.keys(pt).length > 0 ? { pt } : {},
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateGalleryItem(editingId, payload);
      } else {
        await addGalleryItem({ ...payload, order: items.length });
      }
      setShowForm(false);
      await loadItems();
    } catch (err) {
      console.error("Failed to save place:", err);
      const message =
        err?.code === "permission-denied"
          ? "Firestore blocked this write — check your security rules allow signed-in users to write, and that you're still signed in."
          : `Couldn't save this place: ${err?.message ?? "unknown error"}`;
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this place from the gallery?")) return;
    await deleteGalleryItem(id);
    await loadItems();
  }

  const countryGroups = countryNames
    .map((country) => ({
      country,
      items: items.filter((i) => slugOf(i.country) === slugOf(country)),
    }))
    .filter((g) => g.items.length > 0);

  // Keep the current country selectable even if it isn't in the list yet.
  const selectOptions =
    !form.country || countryNames.includes(form.country)
      ? countryNames
      : [...countryNames, form.country];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl italic text-charcoal">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Countries and places shown on the public Gallery page.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-warm-ivory hover:bg-navy-dark"
        >
          <Plus size={16} />
          New place
        </button>
      </div>

      {error && !showForm && (
        <p className="mb-6 rounded-xl bg-navy/10 px-4 py-3 text-sm text-navy">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-charcoal/60">Loading…</p>
      ) : (
        <>
          {/* Countries */}
          <section className="mb-14">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl italic text-charcoal">
                Countries
              </h2>
              <button
                onClick={() => openCountryForm()}
                className="flex items-center gap-1.5 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 hover:bg-warm-beige/60"
              >
                <Plus size={14} />
                New country
              </button>
            </div>

            {countryCards.length === 0 ? (
              <p className="text-sm text-charcoal/60">
                No countries yet. Add one, or add a place and it will appear
                here.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {countryCards.map(({ name, record, count }) => (
                  <div
                    key={name}
                    className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white/40"
                  >
                    <div className="relative aspect-[3/4] w-full bg-warm-beige">
                      {record?.coverImageUrl ? (
                        <Image
                          src={withTransform(record.coverImageUrl, COVER_THUMB)}
                          alt={name}
                          fill
                          sizes="240px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-3 text-center text-xs text-charcoal/50">
                          No cover photo yet
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-charcoal">
                          {name}
                        </p>
                        {record?.translations?.pt?.name && (
                          <p className="truncate text-xs text-charcoal/50">
                            {record.translations.pt.name}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-charcoal/60">
                          {count} {count === 1 ? "place" : "places"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <button
                          onClick={() => openCountryForm({ name })}
                          className="rounded-full p-1.5 text-charcoal/60 hover:bg-warm-beige/60"
                          aria-label={`Edit ${name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        {record && (
                          <button
                            onClick={() => handleCountryDelete(record)}
                            className="rounded-full p-1.5 text-charcoal/60 hover:bg-navy/10 hover:text-navy"
                            aria-label={`Remove ${name} details`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Places */}
          <section>
            <h2 className="mb-6 font-display text-xl italic text-charcoal">
              Places
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-charcoal/60">
                No places yet. Add your first one.
              </p>
            ) : (
              <div className="flex flex-col gap-12">
                {countryGroups.map(({ country, items: countryItems }) => (
                  <div key={country}>
                    <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-charcoal/60">
                      {country}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {countryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-2xl border border-charcoal/10 bg-white/40 p-4"
                        >
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-warm-beige">
                            {item.url &&
                              (item.mediaType === "video" ? (
                                <video
                                  src={item.url}
                                  preload="metadata"
                                  muted
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={withTransform(item.url, THUMB)}
                                  alt={item.name}
                                  fill
                                  sizes="96px"
                                  unoptimized
                                  className="object-cover"
                                />
                              ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-sm font-medium text-charcoal">
                              {item.name}
                              {item.translations?.pt?.name && (
                                <span className="rounded-full bg-warm-beige px-2 py-0.5 text-[10px] font-medium text-charcoal/70">
                                  PT
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-charcoal/60">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded-full p-2 text-charcoal/60 hover:bg-warm-beige/60"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-full p-2 text-charcoal/60 hover:bg-navy/10 hover:text-navy"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Place form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-6">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-warm-ivory p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl italic text-charcoal">
                {editingId ? "Edit place" : "New place"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-charcoal/50 hover:text-charcoal"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Language toggle */}
            <div className="mb-6 flex rounded-full bg-warm-beige p-1">
              {LANG_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLang(tab.key)}
                  className={clsx(
                    "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    lang === tab.key
                      ? "bg-navy text-warm-ivory"
                      : "text-charcoal/70 hover:text-charcoal"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-4 rounded-xl bg-navy/10 px-4 py-3 text-sm text-navy">
                {error}
              </p>
            )}

            {lang === "en" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-charcoal/60">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="The Temple of Karnak"
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60">Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    className={inputClass}
                  >
                    {selectOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value={NEW_COUNTRY}>＋ Add new country…</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-charcoal/60">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60">
                    Image or video
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    {form.url && (
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-warm-beige">
                        {form.mediaType === "video" ? (
                          <video
                            src={form.url}
                            preload="metadata"
                            muted
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={withTransform(form.url, THUMB)}
                            alt="Preview"
                            fill
                            sizes="96px"
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/70 hover:bg-warm-beige/60">
                      <Upload size={14} />
                      {uploading ? "Uploading…" : "Upload media"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-xs leading-relaxed text-charcoal/60">
                  Optional. Anything left empty shows the English text on the
                  Portuguese site. The image is shared between both languages,
                  and the country's Portuguese name is set in the Countries
                  section.
                </p>

                <div>
                  <label className="text-xs text-charcoal/60">
                    Name (Português)
                  </label>
                  <input
                    value={form.translations.pt.name}
                    onChange={(e) => setPt("name", e.target.value)}
                    className={inputClass}
                    placeholder={form.name || "Templo de Carnaque"}
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60">
                    Description (Português)
                  </label>
                  <textarea
                    rows={4}
                    value={form.translations.pt.description}
                    onChange={(e) => setPt("description", e.target.value)}
                    className={inputClass}
                    placeholder={form.description}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading || !form.url}
              className="mt-6 w-full rounded-full bg-navy px-6 py-3 text-sm font-medium text-warm-ivory hover:bg-navy-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add place"}
            </button>
          </form>
        </div>
      )}

      {/* Country form (stacks on top of the place form when opened from it) */}
      {showCountryForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/40 p-6">
          <form
            onSubmit={handleCountrySave}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-warm-ivory p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl italic text-charcoal">
                {countryNameLocked ? "Edit country" : "New country"}
              </h2>
              <button
                type="button"
                onClick={() => setShowCountryForm(false)}
                className="text-charcoal/50 hover:text-charcoal"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {countryError && (
              <p className="mb-4 rounded-xl bg-navy/10 px-4 py-3 text-sm text-navy">
                {countryError}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-charcoal/60">
                  Name (English)
                </label>
                <input
                  value={countryForm.name}
                  readOnly={countryNameLocked}
                  onChange={(e) =>
                    setCountryForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={clsx(
                    inputClass,
                    countryNameLocked && "cursor-not-allowed opacity-60"
                  )}
                  placeholder="Jordan"
                />
                {countryNameLocked && (
                  <p className="mt-1 text-[11px] text-charcoal/50">
                    The English name can't be changed, because places and page
                    links use it.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-charcoal/60">
                  Name (Português)
                </label>
                <input
                  value={countryForm.ptName}
                  onChange={(e) =>
                    setCountryForm((f) => ({ ...f, ptName: e.target.value }))
                  }
                  className={inputClass}
                  placeholder={countryForm.name || "Jordânia"}
                />
              </div>

              <div>
                <label className="text-xs text-charcoal/60">Cover photo</label>
                <div className="mt-1 flex items-center gap-4">
                  {countryForm.coverImageUrl && (
                    <div className="relative h-24 w-[72px] overflow-hidden rounded-lg bg-warm-beige">
                      <Image
                        src={withTransform(
                          countryForm.coverImageUrl,
                          COVER_THUMB
                        )}
                        alt="Cover preview"
                        fill
                        sizes="72px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/70 hover:bg-warm-beige/60">
                    <Upload size={14} />
                    {countryUploading
                      ? "Uploading…"
                      : countryForm.coverImageUrl
                      ? "Replace photo"
                      : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCoverUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  countrySaving ||
                  countryUploading ||
                  !countryForm.coverImageUrl
                }
                className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-warm-ivory hover:bg-navy-dark disabled:opacity-60"
              >
                {countrySaving
                  ? "Saving…"
                  : countryNameLocked
                  ? "Save changes"
                  : "Add country"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}