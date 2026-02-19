"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DerivativeImages } from "@/components/derivative-images";
import { CopyButton } from "@/components/copy-button";
import type { PlatformMeta } from "@/lib/platform-meta";

type DerivativeData = {
  id: string;
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

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  published: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800",
};

export function DerivativeCard({
  d,
  platformName,
  meta,
  showSource = false,
  index = 0,
}: {
  d: DerivativeData;
  platformName: string;
  meta: PlatformMeta;
  showSource?: boolean;
  index?: number;
}) {
  const router = useRouter();
  const [retryingContent, setRetryingContent] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOdd = index % 2 === 1;
  const fullText = buildCopyText(d);
  const hashtagStr = d.content.hashtags?.length
    ? d.content.hashtags.join(" ")
    : "";
  const hasImages =
    d.content.imageUrls?.length ||
    d.content.imageGenerationStatus === "generating" ||
    d.content.imageGenerationStatus === "failed";

  const templateName =
    d.template?.name || d.template?.slug?.replace(/_/g, " ") || "Unknown";
  const slides = (d.content.slides as Array<{ title: string; body: string }>) || [];

  const isContentFailed =
    d.content.primaryContent?.startsWith("[Generation failed") ||
    !!(d.content as Record<string, unknown>).error;
  const isContentRegenerating =
    d.content.primaryContent?.startsWith("[Regenerating");

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Stop polling when content is no longer failed/regenerating
  useEffect(() => {
    if (retryingContent && !isContentFailed && !isContentRegenerating) {
      if (pollRef.current) clearInterval(pollRef.current);
      setRetryingContent(false);
    }
  }, [retryingContent, isContentFailed, isContentRegenerating]);

  const handleRetryContent = useCallback(async () => {
    setRetryingContent(true);
    try {
      await fetch(`/api/derivatives/${d.id}/retry-content`, {
        method: "POST",
      });
      let polls = 0;
      pollRef.current = setInterval(async () => {
        polls++;
        try {
          const res = await fetch(`/api/derivatives/${d.id}/status`);
          const data = await res.json();
          if ((!data.regenerating && !data.contentError) || polls >= 30) {
            if (pollRef.current) clearInterval(pollRef.current);
            router.refresh();
          }
        } catch {
          // keep polling
        }
      }, 2000);
    } catch {
      setRetryingContent(false);
    }
  }, [d.id, router]);

  return (
    <div
      className={`rounded-lg border-l-4 shadow-sm ring-1 ring-neutral-200 ${
        isOdd ? "bg-neutral-50" : "bg-white"
      }`}
      style={{ borderLeftColor: meta.color }}
    >
      {/* ── Item header ── */}
      <div className="flex items-center gap-3 border-b-2 border-blue-200 bg-blue-50 px-5 py-3">
        <h4 className="min-w-0 flex-1 text-lg font-extrabold capitalize text-blue-700">
          {templateName}
        </h4>
        <span className="shrink-0 text-xs text-neutral-500">{platformName}</span>
        {isContentFailed && (
          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
            FAILED
          </span>
        )}
        {!isContentFailed && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[d.status] || STATUS_STYLES.draft}`}
          >
            {d.status}
          </span>
        )}
        <CopyButton text={fullText} />
      </div>

      {/* ── Source link ── */}
      {showSource && d.source && (
        <div className="border-b border-neutral-100 px-5 py-1.5 text-xs text-neutral-500">
          Source:{" "}
          <a
            href={`/sources/${d.source.id}`}
            className="underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-700"
          >
            {d.source.title}
          </a>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-5 py-4 text-[13px] leading-relaxed text-neutral-800">
        {retryingContent || isContentRegenerating ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5 px-4 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-medium text-primary">
              Regenerating content...
            </span>
          </div>
        ) : isContentFailed ? (
          <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-red-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-xs text-red-600">
                {d.content.primaryContent?.replace("[Generation failed: ", "").replace("]", "") || "Content generation failed"}
              </p>
            </div>
            <button
              onClick={handleRetryContent}
              className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retry Content
            </button>
          </div>
        ) : slides.length > 0 ? (
          <div className="space-y-3">
            {slides.map((s, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-neutral-500">
                  Slide {i + 1}
                </p>
                <p className="font-semibold">{s.title}</p>
                {s.body && (
                  <p className="mt-0.5 text-neutral-600">
                    {s.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{d.content.primaryContent}</p>
        )}
      </div>

      {/* ── CTA ── */}
      {d.content.cta && (
        <div className="border-t border-dashed border-neutral-100 px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Call to Action
          </p>
          <p
            className="mt-1 text-[13px] font-medium"
            style={{ color: meta.color }}
          >
            {d.content.cta}
          </p>
        </div>
      )}

      {/* ── Hashtags ── */}
      {hashtagStr && (
        <div className="border-t border-dashed border-neutral-100 px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Hashtags
          </p>
          <p className="mt-1 text-[13px] text-neutral-600">
            {hashtagStr}
          </p>
        </div>
      )}

      {/* ── Visuals ── */}
      {hasImages && (
        <div className="border-t border-neutral-100">
          <div className="px-5 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Visual Assets
            </p>
          </div>
          <div className="px-5 pb-4">
            <DerivativeImages
              derivativeId={d.id}
              imageUrls={d.content.imageUrls}
              templateSlug={d.template?.slug}
              imageGenerationStatus={d.content.imageGenerationStatus}
              imageGenerationError={d.content.imageGenerationError}
              slides={
                d.content.slides as Array<{ title: string; body: string }>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function buildCopyText(d: DerivativeData): string {
  let text = d.content.primaryContent;
  if (d.content.cta) text += `\n\n${d.content.cta}`;
  if (d.content.hashtags?.length) text += `\n\n${d.content.hashtags.join(" ")}`;
  return text;
}
