"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type DerivativeImagesProps = {
  derivativeId?: string;
  imageUrls?: string[];
  templateSlug?: string;
  imageGenerationStatus?: string;
  imageGenerationError?: string;
  slides?: Array<{ title: string; body: string }>;
};

export function DerivativeImages({
  derivativeId,
  imageUrls,
  templateSlug,
  imageGenerationStatus,
  imageGenerationError,
  slides,
}: DerivativeImagesProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [retryKeys, setRetryKeys] = useState<Record<number, number>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Stop polling when images arrive or status resolves after retry
  useEffect(() => {
    if (!retrying) return;
    if (
      imageGenerationStatus === "completed" ||
      (imageUrls && imageUrls.length > 0)
    ) {
      if (pollRef.current) clearInterval(pollRef.current);
      setRetrying(false);
    }
  }, [retrying, imageGenerationStatus, imageUrls]);

  const handleRetryGeneration = useCallback(async () => {
    if (!derivativeId) return;
    setRetrying(true);
    try {
      await fetch(`/api/derivatives/${derivativeId}/retry-images`, {
        method: "POST",
      });
      // Poll status endpoint and refresh when done
      let polls = 0;
      pollRef.current = setInterval(async () => {
        polls++;
        try {
          const res = await fetch(`/api/derivatives/${derivativeId}/status`);
          const data = await res.json();
          if (
            data.imageGenerationStatus !== "generating" ||
            polls >= 30
          ) {
            if (pollRef.current) clearInterval(pollRef.current);
            router.refresh();
            // retrying state will be cleared by the useEffect above
          }
        } catch {
          // keep polling
        }
      }, 2000);
    } catch {
      setRetrying(false);
    }
  }, [derivativeId, router]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // ESC to close lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft" && lightboxIndex > 0)
        setLightboxIndex((i) => i - 1);
      if (e.key === "ArrowRight" && imageUrls && lightboxIndex < imageUrls.length - 1)
        setLightboxIndex((i) => i + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lightboxIndex, imageUrls, closeLightbox]);

  const retryImage = useCallback((index: number) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    setRetryKeys((prev) => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
  }, []);

  const imgSrc = useCallback(
    (url: string, index: number) => {
      const key = retryKeys[index];
      return key ? `${url}?retry=${key}` : url;
    },
    [retryKeys]
  );

  // --- Empty / loading / error states ---
  if (!imageUrls || imageUrls.length === 0) {
    if (imageGenerationStatus === "failed" && !retrying) {
      return (
        <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-xs text-red-600">
              {imageGenerationError || "Image generation failed"}
            </p>
          </div>
          {derivativeId && (
            <button
              onClick={handleRetryGeneration}
              className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retry
            </button>
          )}
        </div>
      );
    }
    if (retrying || imageGenerationStatus === "generating") {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-teal-400/5 px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium text-primary">
            Generating visuals...
          </span>
        </div>
      );
    }
    return null;
  }

  const isCarousel = templateSlug?.includes("carousel");
  const isThumbnail = templateSlug === "thumbnail_concepts";
  const totalImages = imageUrls.length;

  // Map template slug → aspect ratio + compact max-width to mimic social feeds
  const sizeMap: Record<string, { aspect: string; maxW: string }> = {
    carousel_outline:      { aspect: "aspect-[4/3]",  maxW: "max-w-[320px]" },
    carousel_educational:  { aspect: "aspect-square",  maxW: "max-w-[280px]" },
    carousel_storytelling: { aspect: "aspect-square",  maxW: "max-w-[280px]" },
    drake_format:          { aspect: "aspect-square",  maxW: "max-w-[260px]" },
    distracted_boyfriend:  { aspect: "aspect-[4/3]",   maxW: "max-w-[280px]" },
    expanding_brain:       { aspect: "aspect-[4/5]",   maxW: "max-w-[240px]" },
    this_is_fine:          { aspect: "aspect-[4/3]",   maxW: "max-w-[280px]" },
    change_my_mind:        { aspect: "aspect-[4/3]",   maxW: "max-w-[280px]" },
    is_this_a:             { aspect: "aspect-[4/3]",   maxW: "max-w-[280px]" },
    two_buttons:           { aspect: "aspect-square",  maxW: "max-w-[260px]" },
    custom_concept:        { aspect: "aspect-square",  maxW: "max-w-[260px]" },
    thumbnail_concepts:    { aspect: "aspect-video",   maxW: "max-w-full" },
    single_image:          { aspect: "aspect-square",  maxW: "max-w-[260px]" },
  };
  const sizing = sizeMap[templateSlug || ""] || { aspect: "aspect-[4/3]", maxW: "max-w-[300px]" };

  // --- Lightbox overlay ---
  const lightbox = lightboxOpen && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={closeLightbox}
    >
      {/* Close button */}
      <button
        onClick={closeLightbox}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      {totalImages > 1 && (
        <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          {lightboxIndex + 1} / {totalImages}
        </div>
      )}

      {/* Image */}
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc(imageUrls[lightboxIndex], lightboxIndex)}
          alt={slides?.[lightboxIndex]?.title || `Image ${lightboxIndex + 1}`}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
      </div>

      {/* Prev/Next arrows */}
      {totalImages > 1 && lightboxIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {totalImages > 1 && lightboxIndex < totalImages - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );

  // Helper: failed overlay with retry
  const failedOverlay = (index: number) =>
    failedImages.has(index) && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900/80 backdrop-blur-sm">
        <p className="text-sm text-neutral-400">Failed to load</p>
        <button
          onClick={(e) => { e.stopPropagation(); retryImage(index); }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
        >
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry
          </span>
        </button>
      </div>
    );

  // --- Carousel view ---
  if (isCarousel && totalImages > 1) {
    return (
      <>
        {lightbox}
        <div className={`mx-auto ${sizing.maxW} space-y-2`}>
          <div className="relative overflow-hidden rounded-lg">
            <div
              className={`relative ${sizing.aspect} w-full cursor-pointer bg-neutral-100`}
              onClick={() => openLightbox(currentSlide)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc(imageUrls[currentSlide], currentSlide)}
                alt={slides?.[currentSlide]?.title || `Slide ${currentSlide + 1}`}
                className="h-full w-full object-contain transition-opacity duration-300"
                onError={() =>
                  setFailedImages((prev) => new Set(prev).add(currentSlide))
                }
              />
              {failedOverlay(currentSlide)}

              {/* Expand icon hint */}
              <div className="absolute bottom-2 right-2 rounded bg-black/50 p-1 text-white/70 backdrop-blur-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </div>
            </div>

            {/* Nav arrows */}
            {currentSlide > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((s) => s - 1); }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 text-neutral-700 shadow ring-1 ring-black/10 transition-all hover:bg-neutral-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {currentSlide < totalImages - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentSlide((s) => s + 1); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 text-neutral-700 shadow ring-1 ring-black/10 transition-all hover:bg-neutral-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Slide counter pill */}
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {currentSlide + 1} / {totalImages}
            </div>
          </div>

          {/* Dot indicators + slide title */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            {slides?.[currentSlide]?.title && (
              <span className="text-[10px] font-medium text-muted-foreground truncate ml-2">
                {slides[currentSlide].title}
              </span>
            )}
          </div>
        </div>
      </>
    );
  }

  // --- Thumbnail view (3 variants) ---
  if (isThumbnail) {
    return (
      <>
        {lightbox}
        <div className="mx-auto max-w-sm grid grid-cols-3 gap-1.5">
          {imageUrls.map((url, i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden rounded bg-neutral-100 transition-transform hover:scale-[1.02]"
              onClick={() => openLightbox(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc(url, i)}
                alt={slides?.[i]?.title || `Variant ${i + 1}`}
                className="aspect-video w-full object-cover"
                onError={() =>
                  setFailedImages((prev) => new Set(prev).add(i))
                }
              />
              {failedOverlay(i)}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-1">
                <p className="text-center text-[9px] font-semibold text-white">
                  {slides?.[i]?.title || `Variant ${String.fromCharCode(65 + i)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // --- Single image (memes, social graphics) ---
  return (
    <>
      {lightbox}
      <div className={`mx-auto ${sizing.maxW}`}>
        <div
          className={`relative ${sizing.aspect} cursor-pointer overflow-hidden rounded-lg bg-neutral-100`}
          onClick={() => openLightbox(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc(imageUrls[0], 0)}
            alt="Generated visual"
            className="h-full w-full object-contain"
            onError={() => setFailedImages((prev) => new Set(prev).add(0))}
          />
          {failedOverlay(0)}

          {/* Expand hint */}
          <div className="absolute bottom-2 right-2 rounded bg-black/50 p-1 text-white/70 backdrop-blur-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
