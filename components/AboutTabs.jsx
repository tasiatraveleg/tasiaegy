"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

const TAB_KEYS = ["vision", "impact", "why"];

// Only the images stay here: they don't change with the language.
const IMAGES = {
  vision:
    "https://res.cloudinary.com/dkpsmuui1/image/upload/v1790571866/vision_ckntoz.jpg",
  impact:
    "https://res.cloudinary.com/dkpsmuui1/image/upload/v1790600713/Gemini_Generated_Image_3063gx3063gx3063_vtl6aj.jpg",
  why: "https://res.cloudinary.com/dkpsmuui1/image/upload/v1790571978/why_tasia_c1gxah.jpg",
};

export default function AboutTabs() {
  const t = useTranslations("About");
  const [active, setActive] = useState("vision");

  function renderBody() {
    if (active === "vision") {
      return (
        <>
          <p>{t("vision.p1")}</p>
          <p className="mt-4">{t("vision.p2")}</p>
          <p className="mt-6 font-medium text-charcoal">
            {t("vision.philosophyTitle")}
          </p>
          <p className="mt-2">{t("vision.p3")}</p>
          <p className="mt-4">{t("vision.p4")}</p>
        </>
      );
    }

    if (active === "impact") {
      return (
        <ul className="mt-2 space-y-3">
          {t.raw("impact.items").map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <>
        <p>{t("why.intro")}</p>
        <p className="mt-4 font-medium text-charcoal">
          {t("why.combineTitle")}
        </p>
        <ul className="mt-2 space-y-2">
          {t.raw("why.combine").map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mt-6 font-medium text-charcoal">
          {t("why.serviceTitle")}
        </p>
        <ul className="mt-2 space-y-2">
          {t.raw("why.service").map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="mb-16 flex justify-center">
        <div className="flex rounded-full bg-warm-beige p-1.5">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={clsx(
                "rounded-full px-8 py-3 text-sm font-medium transition-colors",
                active === key
                  ? "bg-navy text-warm-ivory"
                  : "text-charcoal/70 hover:text-charcoal"
              )}
            >
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-4 -top-4 h-full w-full rounded-[2rem] border border-charcoal/15" />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
            <Image
              key={IMAGES[active]}
              src={IMAGES[active]}
              alt={t(`${active}.imageAlt`)}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="(min-width: 1024px) 400px, 90vw"
            />
        
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl italic leading-tight text-charcoal sm:text-4xl">
            {t(`${active}.heading`)}{" "}
            <span className="text-navy">{t(`${active}.highlight`)}</span>
          </h2>
          <div className="mt-6 max-w-lg text-sm leading-relaxed text-charcoal/75">
            {renderBody()}
          </div>
        </div>
      </div>
    </section>
  );
}
