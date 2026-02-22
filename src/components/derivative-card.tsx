"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DerivativeImages } from "@/components/derivative-images";
import { CopyButton } from "@/components/copy-button";
import { GhlPublishButton } from "@/components/ghl-publish-button";
import type { PlatformMeta } from "@/lib/platform-meta";

type DerivativeData = {
  id: string;
  status: string;
  ghlPostId?: string | null;
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

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  draft: {
    label: "Draft",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-amber-200/60",
  },
  completed: {
    label: "Ready",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  },
  published: {
    label: "Published",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-blue-200/60",
  },
  scheduled: {
    label: "Scheduled",
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 ring-teal-200/60",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 ring-red-200/60",
  },
};

export function DerivativeCard({
  d,
  platformName,
  meta,
  showSource = false,
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

  const fullText = buildCopyText(d);
  const hashtagStr = d.content.hashtags?.length ? d.content.hashtags.join(" ") : "";
  const hasImages =
    d.content.imageUrls?.length ||
    d.content.imageGenerationStatus === "generating" ||
    d.content.imageGenerationStatus === "failed";

  const templateName = d.template?.name || d.template?.slug?.replace(/_/g, " ") || "Unknown";
  const slides = (d.content.slides as Array<{ title: string; body: string }>) || [];
  const status = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.draft;

  const isContentFailed =
    d.content.primaryContent?.startsWith("[Generation failed") ||
    !!(d.content as Record<string, unknown>).error;
  const isContentRegenerating = d.content.primaryContent?.startsWith("[Regenerating");

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (retryingContent && !isContentFailed && !isContentRegenerating) {
      if (pollRef.current) clearInterval(pollRef.current);
      setRetryingContent(false);
    }
  }, [retryingContent, isContentFailed, isContentRegenerating]);

  const handleRetryContent = useCallback(async () => {
    setRetryingContent(true);
    try {
      await fetch(`/api/derivatives/${d.id}/retry-content`, { method: "POST" });
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
    <div className="group overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* ── Header bar ── */}
      <div className="relative flex items-center gap-3 px-5 py-3">
        {/* Platform accent line */}
        <div
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: meta.color }}
        />

        {/* Platform icon badge */}
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${meta.gradient} text-[9px] font-bold text-white shadow-sm`}
        >
          {meta.icon}
        </div>

        {/* Template name */}
        <h4 className="min-w-0 flex-1 truncate text-[13px] font-semibold capitalize text-foreground">
          {templateName}
        </h4>

        {/* Status + actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isContentFailed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Failed
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          )}
          <CopyButton text={fullText} />
        </div>
      </div>

      {/* ── Source link ── */}
      {showSource && d.source && (
        <div className="border-t border-border/30 bg-muted/20 px-5 py-1.5">
          <span className="text-[11px] text-muted-foreground">
            from{" "}
            <a
              href={`/sources/${d.source.id}`}
              className="font-medium text-foreground/70 underline decoration-border underline-offset-2 transition-colors hover:text-primary"
            >
              {d.source.title}
            </a>
          </span>
        </div>
      )}

      {/* ── Content body ── */}
      <div className="border-t border-border/30 px-5 py-4">
        {retryingContent || isContentRegenerating ? (
          <div className="flex items-center gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-4 py-3">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-primary border-t-transparent" />
            <span className="text-[12px] font-medium text-primary">Regenerating content...</span>
          </div>
        ) : isContentFailed ? (
          <div className="flex items-center justify-between rounded-lg border border-red-200/50 bg-red-50/50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-[12px] text-red-600/80">
                {d.content.primaryContent?.replace("[Generation failed: ", "").replace("]", "") || "Generation failed"}
              </p>
            </div>
            <button
              onClick={handleRetryContent}
              className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-medium text-red-600 shadow-sm ring-1 ring-red-200 transition-colors hover:bg-red-50"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retry
            </button>
          </div>
        ) : slides.length > 0 ? (
          /* Carousel slides preview */
          <div className="space-y-2.5">
            {slides.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight text-foreground">{s.title}</p>
                  {s.body && (
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{s.body}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Text content */
          <p className="whitespace-pre-wrap text-[13px] leading-[1.7] text-foreground/85">
            {d.content.primaryContent}
          </p>
        )}
      </div>

      {/* ── CTA ── */}
      {d.content.cta && !isContentFailed && (
        <div className="border-t border-border/30 px-5 py-3">
          <div className="flex items-start gap-2.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-muted-foreground/50">
              <path d="M22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: meta.color }}>
              {d.content.cta}
            </p>
          </div>
        </div>
      )}

      {/* ── Hashtags ── */}
      {hashtagStr && !isContentFailed && (
        <div className="border-t border-border/30 px-5 py-3">
          <div className="flex flex-wrap gap-1">
            {d.content.hashtags!.slice(0, 12).map((tag, i) => (
              <span
                key={i}
                className="inline-block rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
            {d.content.hashtags!.length > 12 && (
              <span className="inline-block rounded-full bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground/60">
                +{d.content.hashtags!.length - 12}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Visuals ── */}
      {hasImages && (
        <div className="border-t border-border/30">
          <div className="px-5 pb-4 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Visual Assets
            </p>
            <DerivativeImages
              derivativeId={d.id}
              imageUrls={d.content.imageUrls}
              templateSlug={d.template?.slug}
              imageGenerationStatus={d.content.imageGenerationStatus}
              imageGenerationError={d.content.imageGenerationError}
              slides={d.content.slides as Array<{ title: string; body: string }>}
            />
          </div>
        </div>
      )}

      {/* ── Footer: GHL Publish ── */}
      {!isContentFailed && (
        <div className="flex items-center justify-between border-t border-border/30 bg-muted/15 px-5 py-2.5">
          <span className="text-[11px] text-muted-foreground/50">{platformName}</span>
          <GhlPublishButton
            derivativeId={d.id}
            currentStatus={d.status}
            ghlPostId={d.ghlPostId}
          />
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
