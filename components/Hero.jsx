"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const VIDEO_SRC =
  "https://res.cloudinary.com/dkpsmuui1/video/upload/v1790344930/Tasia-Hero_gqx6c7.mp4";
const POSTER_SRC =
  "https://res.cloudinary.com/dkpsmuui1/image/upload/v1790600419/WhatsApp_Image_2026-09-28_at_3.59.46_PM_sqkmk8.jpg";

export default function Hero() {
  const t = useTranslations("Hero");
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setShowVideo(!isSmallScreen && !prefersReducedMotion);
  }, []);

  return (
    <section className="relative overflow-hidden bg-charcoal w-full aspect-[2.2/1]">
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url('${POSTER_SRC}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/10" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 pb-16 lg:px-10">
        <h1 className="max-w-md font-display text-lg italic leading-snug text-warm-ivory lg:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-md font-display text-s italic leading-snug text-warm-ivory lg:text-lg">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
