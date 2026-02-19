"use client";

import { useState, useEffect, useCallback } from "react";

type PreviewProps = {
  platform: string;
  content: string;
  hashtags?: string[];
  cta?: string;
  imageUrls?: string[];
  slides?: Array<{ title: string; body: string }>;
  templateSlug?: string;
};

export function PlatformPreviewButton(props: PreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Preview on platform"
        className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      {open && <PreviewModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

function PreviewModal({
  platform,
  content,
  hashtags,
  cta,
  imageUrls,
  slides,
  templateSlug,
  onClose,
}: PreviewProps & { onClose: () => void }) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [handleEsc]);

  const isCarousel = templateSlug?.includes("carousel");
  const hasImages = imageUrls && imageUrls.length > 0;
  const firstImage = hasImages ? imageUrls[0] : null;
  const hashtagStr = hashtags?.length ? hashtags.join(" ") : "";
  const fullText = cta ? `${content}\n\n${cta}` : content;

  const norm = platform.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Label */}
      <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {platform} Preview
      </div>

      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {norm === "linkedin" && (
          <LinkedInPreview
            content={fullText}
            hashtagStr={hashtagStr}
            imageUrls={imageUrls}
            slides={slides}
            isCarousel={!!isCarousel}
            carouselIndex={carouselIndex}
            setCarouselIndex={setCarouselIndex}
          />
        )}
        {(norm === "x" || norm === "twitter") && (
          <XPreview
            content={fullText}
            hashtagStr={hashtagStr}
            imageUrl={firstImage}
          />
        )}
        {norm === "instagram" && (
          <InstagramPreview
            content={fullText}
            hashtagStr={hashtagStr}
            imageUrls={imageUrls}
            isCarousel={!!isCarousel}
            carouselIndex={carouselIndex}
            setCarouselIndex={setCarouselIndex}
          />
        )}
        {norm === "facebook" && (
          <FacebookPreview
            content={fullText}
            hashtagStr={hashtagStr}
            imageUrl={firstImage}
          />
        )}
        {norm === "tiktok" && (
          <TikTokPreview content={fullText} hashtagStr={hashtagStr} />
        )}
        {norm === "youtube" && (
          <YouTubePreview
            content={fullText}
            imageUrl={firstImage}
            slides={slides}
          />
        )}
        {norm === "memes" && (
          <MemePreview imageUrl={firstImage} content={fullText} />
        )}
        {/* Fallback for unknown platforms */}
        {!["linkedin", "x", "twitter", "instagram", "facebook", "tiktok", "youtube", "memes"].includes(norm) && (
          <div className="rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <p className="whitespace-pre-wrap text-sm">{fullText}</p>
            {hashtagStr && (
              <p className="mt-2 text-sm text-blue-500">{hashtagStr}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile avatar placeholder ─── */
function Avatar({ bg, initials }: { bg: string; initials: string }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} text-xs font-bold text-white`}
    >
      {initials}
    </div>
  );
}

/* ─── Carousel arrows inside preview ─── */
function CarouselNav({
  index,
  total,
  setIndex,
}: {
  index: number;
  total: number;
  setIndex: (fn: (i: number) => number) => void;
}) {
  if (total <= 1) return null;
  return (
    <>
      {index > 0 && (
        <button
          onClick={() => setIndex((i) => i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={() => setIndex((i) => i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </>
  );
}

/* ─── LinkedIn ─── */
function LinkedInPreview({
  content,
  hashtagStr,
  imageUrls,
  slides,
  isCarousel,
  carouselIndex,
  setCarouselIndex,
}: {
  content: string;
  hashtagStr: string;
  imageUrls?: string[];
  slides?: Array<{ title: string; body: string }>;
  isCarousel: boolean;
  carouselIndex: number;
  setCarouselIndex: (fn: (i: number) => number) => void;
}) {
  const hasImages = imageUrls && imageUrls.length > 0;
  return (
    <div className="rounded-2xl bg-white text-sm text-neutral-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar bg="bg-[#0A66C2]" initials="CC" />
        <div className="leading-tight">
          <p className="font-semibold">Content Cascade</p>
          <p className="text-xs text-neutral-500">AI Content Studio &middot; 1h</p>
        </div>
      </div>
      {/* Text */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {hashtagStr && <p className="mt-1.5 text-[#0A66C2]">{hashtagStr}</p>}
      </div>
      {/* Image / carousel */}
      {hasImages && (
        <div className="relative border-t border-neutral-100">
          {isCarousel && imageUrls.length > 1 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrls[carouselIndex]} alt="" className="w-full" />
              <CarouselNav index={carouselIndex} total={imageUrls.length} setIndex={setCarouselIndex} />
              {slides?.[carouselIndex]?.title && (
                <div className="bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-600">
                  {carouselIndex + 1}/{imageUrls.length} &middot; {slides[carouselIndex].title}
                </div>
              )}
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrls[0]} alt="" className="w-full" />
          )}
        </div>
      )}
      {/* Engagement bar */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5 text-xs font-medium text-neutral-500">
        <span className="flex items-center gap-1"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0A66C2] text-[8px] text-white">👍</span> 42</span>
        <span>8 comments &middot; 3 reposts</span>
      </div>
      <div className="flex border-t border-neutral-100">
        {["Like", "Comment", "Repost", "Send"].map((a) => (
          <div key={a} className="flex-1 py-2.5 text-center text-xs font-semibold text-neutral-500">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── X / Twitter ─── */
function XPreview({
  content,
  hashtagStr,
  imageUrl,
}: {
  content: string;
  hashtagStr: string;
  imageUrl: string | null;
}) {
  return (
    <div className="rounded-2xl bg-black p-4 text-[15px] text-white shadow-xl">
      <div className="flex gap-3">
        <Avatar bg="bg-neutral-700" initials="CC" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold">Content Cascade</span>
            <svg width="16" height="16" viewBox="0 0 22 22" fill="#1D9BF0"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.691-.13.635-.08 1.293.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.604-.274 1.26-.144 1.896.13.636.433 1.221.878 1.69.47.447 1.055.749 1.69.879.635.13 1.294.084 1.902-.139.272.588.706 1.09 1.246 1.444.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.22 1.261.269 1.893.14.634-.131 1.217-.434 1.686-.878.447-.47.749-1.055.879-1.691.13-.635.084-1.295-.138-1.9.588-.273 1.09-.706 1.444-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
            <span className="text-neutral-500">@cascade &middot; 1h</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap leading-snug">
            {content}
          </p>
          {hashtagStr && <p className="mt-1 text-[#1D9BF0]">{hashtagStr}</p>}
          {imageUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="w-full" />
            </div>
          )}
          {/* Engagement */}
          <div className="mt-3 flex justify-between pr-8 text-[13px] text-neutral-500">
            <span>12</span>
            <span>5</span>
            <span>42</span>
            <span>1.2K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Instagram ─── */
function InstagramPreview({
  content,
  hashtagStr,
  imageUrls,
  isCarousel,
  carouselIndex,
  setCarouselIndex,
}: {
  content: string;
  hashtagStr: string;
  imageUrls?: string[];
  isCarousel: boolean;
  carouselIndex: number;
  setCarouselIndex: (fn: (i: number) => number) => void;
}) {
  const hasImages = imageUrls && imageUrls.length > 0;
  return (
    <div className="rounded-2xl bg-white text-sm text-neutral-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold">CC</div>
        </div>
        <span className="font-semibold">contentcascade</span>
      </div>
      {/* Image */}
      {hasImages && (
        <div className="relative aspect-square bg-neutral-100">
          {isCarousel && imageUrls.length > 1 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrls[carouselIndex]} alt="" className="h-full w-full object-cover" />
              <CarouselNav index={carouselIndex} total={imageUrls.length} setIndex={setCarouselIndex} />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrls[0]} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex gap-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </div>
      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-xs font-semibold">128 likes</p>
        <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">
          <span className="font-semibold">contentcascade</span>{" "}
          {content}
        </p>
        {hashtagStr && <p className="mt-1 text-xs text-[#00376B]">{hashtagStr}</p>}
      </div>
    </div>
  );
}

/* ─── Facebook ─── */
function FacebookPreview({
  content,
  hashtagStr,
  imageUrl,
}: {
  content: string;
  hashtagStr: string;
  imageUrl: string | null;
}) {
  return (
    <div className="rounded-2xl bg-white text-sm text-neutral-900 shadow-xl">
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar bg="bg-[#1877F2]" initials="CC" />
        <div className="leading-tight">
          <p className="font-semibold">Content Cascade</p>
          <p className="text-xs text-neutral-500">1h &middot; 🌐</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {hashtagStr && <p className="mt-1.5 text-[#1877F2]">{hashtagStr}</p>}
      </div>
      {imageUrl && (
        <div className="border-t border-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full" />
        </div>
      )}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2 text-xs text-neutral-500">
        <span>👍❤️ 67</span>
        <span>12 comments &middot; 5 shares</span>
      </div>
      <div className="flex border-t border-neutral-100">
        {["Like", "Comment", "Share"].map((a) => (
          <div key={a} className="flex-1 py-2.5 text-center text-xs font-semibold text-neutral-500">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TikTok ─── */
function TikTokPreview({
  content,
  hashtagStr,
}: {
  content: string;
  hashtagStr: string;
}) {
  return (
    <div className="mx-auto w-72 overflow-hidden rounded-[2rem] bg-black shadow-xl ring-4 ring-neutral-800">
      <div className="relative flex aspect-[9/16] flex-col justify-end p-4">
        {/* Simulated dark video bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-transparent to-black/80" />
        {/* Side icons */}
        <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
          {[
            { icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", count: "4.2K" },
            { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", count: "89" },
            { icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13", count: "Share" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><path d={item.icon}/></svg>
              <span className="text-[10px] text-white">{item.count}</span>
            </div>
          ))}
        </div>
        {/* Text overlay */}
        <div className="relative z-10 pr-12">
          <p className="mb-1 text-sm font-semibold text-white">@contentcascade</p>
          <p className="text-xs leading-relaxed text-white/90">
            {content}
          </p>
          {hashtagStr && <p className="mt-1 text-xs text-white/70">{hashtagStr}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── YouTube ─── */
function YouTubePreview({
  content,
  imageUrl,
  slides,
}: {
  content: string;
  imageUrl: string | null;
  slides?: Array<{ title: string; body: string }>;
}) {
  const title = slides?.[0]?.title || content.split("\n")[0]?.slice(0, 80) || "Untitled";
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-200">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#FF0000"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
          12:34
        </div>
      </div>
      {/* Info */}
      <div className="mt-3 flex gap-3">
        <Avatar bg="bg-[#FF0000]" initials="CC" />
        <div>
          <p className="text-sm font-semibold leading-snug text-neutral-900">{title}</p>
          <p className="mt-0.5 text-xs text-neutral-500">Content Cascade &middot; 2.1K views &middot; 1 hour ago</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Memes ─── */
function MemePreview({
  imageUrl,
  content,
}: {
  imageUrl: string | null;
  content: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-xl">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="w-full rounded-2xl" />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-100 p-8">
          <p className="whitespace-pre-wrap text-center text-lg font-bold text-neutral-800">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
