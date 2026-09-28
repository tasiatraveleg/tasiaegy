"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

/**
 * Stacked "day by day" carousel.
 * Expects `days` as an array of { title, description, image? }.
 * Falls back to a generic placeholder image if a day has none.
 */
const FALLBACK_IMAGE =
  "https://res.cloudinary.com/demo/image/upload/w_1000,q_auto,f_auto/samples/landscapes/beach-boat.jpg";

export default function DayCarousel({ days }) {
  const [index, setIndex] = useState(0);

  if (!days || days.length === 0) return null;

  const goTo = (i) => setIndex(((i % days.length) + days.length) % days.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const prevDay = days[(index - 1 + days.length) % days.length];
  const activeDay = days[index];
  const nextDay = days[(index + 1) % days.length];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative flex h-[420px] items-center justify-center sm:h-[460px]">
        {/* Previous card peek */}
        {days.length > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous day"
            className="absolute left-0 z-10 hidden h-[260px] w-[220px] -translate-x-1/3 overflow-hidden rounded-[1.5rem] opacity-60 transition-opacity hover:opacity-80 sm:block sm:h-[300px] sm:w-[260px]"
          >
            <DayCardVisual day={prevDay} compact />
          </button>
        )}

        {/* Active card */}
        <div className="relative z-20 h-full w-full max-w-lg overflow-hidden rounded-[1.75rem] bg-charcoal shadow-xl sm:w-[520px]">
          <DayCardVisual day={activeDay} index={index} fadeKey={activeDay.image} />
        </div>

        {/* Next card peek */}
        {days.length > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next day"
            className="absolute right-0 z-10 hidden h-[260px] w-[220px] translate-x-1/3 overflow-hidden rounded-[1.5rem] opacity-60 transition-opacity hover:opacity-80 sm:block sm:h-[300px] sm:w-[260px]"
          >
            <DayCardVisual day={nextDay} compact />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous day"
          className="text-navy transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {days.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to day ${i + 1}`}
              className={clsx(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-navy" : "w-2 bg-charcoal/20"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next day"
          className="text-navy transition-opacity hover:opacity-70"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

function DayCardVisual({ day, index, compact = false, fadeKey }) {
  // Only the active (non-compact) card fades content in — the small
  // peek cards to either side can render immediately.
  const [loaded, setLoaded] = useState(compact);

  // Reset to "not loaded" whenever the active day's image changes, so the
  // text waits for the new picture instead of jumping ahead of it.
  useEffect(() => {
    if (!compact) setLoaded(false);
  }, [fadeKey, compact]);

  return (
    <div className="relative h-full w-full">
      <Image
        src={day.image || FALLBACK_IMAGE}
        alt={day.title}
        fill
        className="object-cover"
        sizes={compact ? "260px" : "520px"}
        onLoad={() => setLoaded(true)}
      />

      {/* Flat tint over the WHOLE image, not just a bottom strip, so any
          length of text stays legible wherever it sits. A bit of gradient
          on top of that keeps the very bottom edge extra dark. */}
      <div
        className={clsx(
          "absolute inset-0 bg-charcoal/55 transition-opacity duration-500",
          !compact && (loaded ? "opacity-100" : "opacity-0")
        )}
      />
      <div
        className={clsx(
          "absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent transition-opacity duration-500",
          !compact && (loaded ? "opacity-100" : "opacity-0")
        )}
      />

      <div
        className={clsx(
          "absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-500 sm:p-6",
          compact && "pointer-events-none",
          !compact && (loaded ? "opacity-100" : "opacity-0")
        )}
      >
        {typeof index === "number" && (
          <p className="shrink-0 text-[11px] font-medium tracking-[0.2em] text-warm-ivory/70">
            DAY {index + 1}
          </p>
        )}
        <p
          className={clsx(
            "mt-1.5 shrink-0 font-medium uppercase leading-snug tracking-wide text-warm-ivory",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {day.title}
        </p>
        {!compact && day.description && (
          // Full text is kept — if it's taller than the card, this area
          // scrolls internally instead of overflowing or getting cut off.
          <div className="mt-2 max-h-40 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_transparent] sm:max-h-48">
            <p className="max-w-sm text-sm leading-relaxed text-warm-ivory/85">
              {day.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}