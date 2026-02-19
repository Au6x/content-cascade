"use client";

import { useState } from "react";
import { DerivativeCard } from "@/components/derivative-card";
import type { PlatformMeta } from "@/lib/platform-meta";

type DerivativeData = {
  id: string;
  variationIndex: number;
  status: string;
  content: {
    primaryContent: string;
    hashtags?: string[];
    cta?: string;
    imageUrls?: string[];
    imageGenerationStatus?: string;
    imageGenerationError?: string;
    slides?: unknown;
    [key: string]: unknown;
  };
  template?: { name?: string; slug?: string } | null;
  source?: { id: string; title: string } | null;
  platform?: { name: string } | null;
};

export function VariationScroller({
  templateName,
  variations,
  platformName,
  meta,
}: {
  templateName: string;
  variations: DerivativeData[];
  platformName: string;
  meta: PlatformMeta;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sorted = [...variations].sort(
    (a, b) => (a.variationIndex ?? 0) - (b.variationIndex ?? 0)
  );

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < sorted.length - 1;

  const goPrev = () => {
    if (canPrev) setActiveIndex(activeIndex - 1);
  };

  const goNext = () => {
    if (canNext) setActiveIndex(activeIndex + 1);
  };

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Template header with variation counter */}
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-bold capitalize text-neutral-800">
          {templateName}
        </h5>
        <div className="flex items-center gap-2">
          {/* Dot indicators */}
          <div className="flex items-center gap-1">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all ${
                  i === activeIndex
                    ? "h-2.5 w-2.5"
                    : "h-2 w-2 hover:bg-neutral-400"
                }`}
                style={{
                  backgroundColor:
                    i === activeIndex ? meta.color : "#d4d4d4",
                }}
                aria-label={`Variation ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {activeIndex + 1} / {sorted.length}
          </span>
        </div>
      </div>

      {/* Carousel: Arrow – Card – Arrow */}
      <div className="flex items-center gap-3">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-neutral-200 text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-lg disabled:opacity-20 disabled:shadow-none disabled:hover:bg-white"
          aria-label="Previous variation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Active card */}
        <div className="min-w-0 flex-1">
          <DerivativeCard
            d={sorted[activeIndex]}
            platformName={platformName}
            meta={meta}
            index={activeIndex}
          />
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          disabled={!canNext}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-neutral-200 text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-lg disabled:opacity-20 disabled:shadow-none disabled:hover:bg-white"
          aria-label="Next variation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
