import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import clsx from "clsx";

export default function ProgramCard({
  id,
  tag,
  duration,
  route,
  title,
  summary,
  imageUrl,
}) {
  const t = useTranslations("ProgramCard");

  // Show the translated tag if we have one, otherwise the raw value.
  const tagLabel = t.has(`tags.${tag}`) ? t(`tags.${tag}`) : tag;

  return (
    // No overflow-hidden here: the card's height is driven by its text, so it
    // can't clip on narrow screens or with longer translations. The 16:8.5
    // ratio only applies from `sm` up, with a min-height as a floor.
    <Link
      href={`/programs/${id}`}
      className="group relative flex min-h-[24rem] w-full flex-col justify-end rounded-[1.75rem] sm:aspect-[16/8.5] sm:min-h-[18rem]"
    >
      {/* Image + gradient are clipped to the rounded corners in here instead */}
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 900px, 100vw"
        />
        {/* Stronger on mobile, where the text covers more of the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/50 to-transparent sm:from-charcoal/85 sm:via-charcoal/10" />
      </div>

      {/* pt-32 keeps a band of the photo visible above the text on mobile */}
      <div className="relative flex flex-col gap-4 p-6 pt-32 sm:flex-row sm:items-end sm:justify-between sm:pt-6 lg:p-8">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-warm-ivory/85">
            <span
              className={clsx(
                "rounded-full px-3 py-1 font-medium",
                tag === "Signature" && "bg-navy text-warm-ivory",
                tag === "New" && "bg-soft-sand text-charcoal"
              )}
            >
              {tagLabel}
            </span>
            <span>{duration}</span>
            <span className="opacity-60">·</span>
            <span>{route}</span>
          </div>
          <h3 className="font-display text-2xl italic text-warm-ivory sm:text-3xl">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-warm-ivory/80">
            {summary}
          </p>
        </div>

        {/* self-start: in the stacked mobile layout this would otherwise
            stretch to the full card width */}
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-warm-ivory px-5 py-2.5 text-sm font-medium text-charcoal transition-colors group-hover:bg-navy group-hover:text-warm-ivory sm:self-auto">
          {t("explore")}
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}