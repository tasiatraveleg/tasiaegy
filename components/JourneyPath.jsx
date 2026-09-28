"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import Image from "next/image";
import clsx from "clsx";

// Build a smooth curved path through a series of points using a
// Catmull-Rom-to-Bezier conversion, so the line "flows" through every
// marker rather than being made of straight segments.
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function JourneyPath({ stops }) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);
  const markerRefs = useRef([]);
  const itemRefs = useRef([]);
  const maskPathRef = useRef(null);

  const [path, setPath] = useState("");
  const [points, setPoints] = useState([]);
  const [pathLength, setPathLength] = useState(0);
  // Y position (in container coordinates) of the "reading line" that
  // the route is drawn up to as the user scrolls.
  const [front, setFront] = useState(0);
  const [revealed, setRevealed] = useState(() => new Set());
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect the user's reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Measure marker positions and (re)build the curve whenever layout changes.
  useEffect(() => {
    markerRefs.current.length = stops.length;
    itemRefs.current.length = stops.length;

    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const pts = markerRefs.current
        .map((el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - containerRect.left,
            y: r.top + r.height / 2 - containerRect.top,
          };
        })
        .filter(Boolean);
      setPoints(pts);
      setPath(smoothPath(pts));
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 400);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [stops]);

  // Once the curve's `d` is in the DOM, measure its real length so we can
  // drive the "drawing" animation with stroke-dasharray/offset.
  useEffect(() => {
    if (!path || !maskPathRef.current) return;
    try {
      setPathLength(maskPathRef.current.getTotalLength());
    } catch {
      setPathLength(0);
    }
  }, [path]);

  // Track a reading line at ~75% of the viewport height, in container
  // coordinates. The route is drawn up to that line.
  useEffect(() => {
    let raf = null;

    function compute() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setFront(window.innerHeight * 0.75 - rect.top);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        compute();
        raf = null;
      });
    }

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Fade each stop in the first time it scrolls into view.
  useEffect(() => {
    if (reduceMotion) return;
    const io = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          let next = null;
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const i = Number(e.target.dataset.index);
            if (!prev.has(i)) {
              next = next || new Set(prev);
              next.add(i);
            }
          });
          return next || prev;
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [stops, reduceMotion]);

  // 0–1 fraction of the route that has been "walked".
  const progress = useMemo(() => {
    if (points.length < 2) return 0;
    if (reduceMotion) return 1;
    const y0 = points[0].y;
    const yN = points[points.length - 1].y;
    const span = yN - y0 || 1;
    return Math.min(1, Math.max(0, (front - y0) / span));
  }, [points, front, reduceMotion]);

  const maskId = `journey-reveal-${uid}`;

  return (
    <div ref={containerRef} className="relative">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <mask id={maskId}>
            <rect x="-20%" y="-20%" width="140%" height="140%" fill="black" />
            {path && pathLength > 0 && (
              <path
                ref={maskPathRef}
                d={path}
                fill="none"
                stroke="white"
                strokeWidth="24"
                strokeLinecap="round"
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: pathLength * (1 - progress),
                  transition: reduceMotion
                    ? "none"
                    : "stroke-dashoffset 0.25s linear",
                }}
              />
            )}
          </mask>
        </defs>

        {/* faint full path — always visible, shows the whole route ahead */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke="var(--color-navy)"
            strokeWidth="2"
            strokeDasharray="1 12"
            strokeLinecap="round"
            opacity="0.25"
          />
        )}

        {/* animated path — only the "walked" portion shows brighter,
            revealed by the mask as the user scrolls */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke="var(--color-navy)"
            strokeWidth="2.5"
            strokeDasharray="1 12"
            strokeLinecap="round"
            mask={`url(#${maskId})`}
          />
        )}

        {points.map((p, i) => {
          const reached = reduceMotion || front >= p.y;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={reached ? 6 : 5}
              className={clsx(
                "transition-all duration-300 motion-reduce:transition-none",
                reached ? "fill-navy stroke-navy" : "fill-warm-ivory stroke-navy"
              )}
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <ol className="relative flex flex-col gap-14 sm:gap-24 lg:gap-32">
        {stops.map((stop, i) => {
          const visible = reduceMotion || revealed.has(i);
          return (
            <li
              key={stop.id ?? stop.day ?? i}
              ref={(el) => (itemRefs.current[i] = el)}
              data-index={i}
              className={clsx(
                // Mobile: single column with a left gutter for the route line.
                // Tablet and up: image and text side by side, alternating.
                "flex flex-col gap-5 pl-8 sm:flex-row sm:items-center sm:gap-10 sm:pl-0 lg:gap-16",
                i % 2 === 1 && "sm:flex-row-reverse"
              )}
            >
              {/* Outer box is never transformed, so the route marker stays put */}
              <div className="relative w-full shrink-0 sm:w-1/2 sm:max-w-md lg:max-w-lg">
                <span
                  ref={(el) => (markerRefs.current[i] = el)}
                  className="absolute -left-5 top-8 h-px w-px -translate-x-1/2 -translate-y-1/2 sm:left-1/2 sm:top-full"
                  aria-hidden="true"
                />
                <div
                  className="transition-all duration-700 ease-out motion-reduce:transition-none"
                  style={{
                    opacity: visible ? 1 : 0.35,
                    transform: visible ? "translateY(0)" : "translateY(24px)",
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden  sm:aspect-[3/2]">
                    <Image
                      src={stop.image}
                      alt={stop.title}
                      fill
                      priority={i === 0}
                      className="object-cover"
                      sizes="(min-width: 1024px) 512px, (min-width: 640px) 45vw, calc(100vw - 4rem)"
                    />
                  </div>
                </div>
              </div>

              <div
                className="min-w-0 text-left transition-all duration-700 ease-out motion-reduce:transition-none sm:w-1/2"
                style={{
                  opacity: visible ? 1 : 0.35,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                }}
              >
                {(stop.eyebrow || stop.day != null) && (
                  <p className="mb-2 text-xs font-medium text-navy sm:text-sm">
                    {stop.eyebrow ?? `Day ${stop.day}`}
                  </p>
                )}
                <h3 className="font-display text-3xl italic leading-tight text-charcoal sm:text-4xl lg:text-5xl">
                  {stop.title}
                </h3>
                <p className="mt-3 max-w-prose text-base leading-relaxed text-charcoal/70 sm:text-lg lg:text-xl">
                  {stop.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}