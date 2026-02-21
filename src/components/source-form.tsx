"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSource } from "@/server/sources";

type Brand = { id: string; name: string; slug: string };
type Props = { brands?: Brand[] };

const PILLARS = [
  "general",
  "leadership",
  "culture",
  "technology",
  "investment",
  "operations",
  "senior_living",
  "proptech",
  "ai_automation",
  "marketing",
];

export function SourceForm({ brands = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variationsCount, setVariationsCount] = useState(5);
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");

  const handleVariationsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVariationsCount(Number(e.target.value));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const source = await createSource({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        pillar: formData.get("pillar") as string,
        brandId: brandId || undefined,
        canonicalUrl: (formData.get("canonicalUrl") as string) || undefined,
        primaryHandle: (formData.get("primaryHandle") as string) || undefined,
        variationsCount,
      });
      router.push(`/sources/${source.id}`);
    } catch (err) {
      console.error("Failed to create source:", err);
      setError(err instanceof Error ? err.message : "Failed to create source");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Brand + Pillar row */}
      <div className={`grid gap-4 ${brands.length > 0 ? "sm:grid-cols-2" : ""}`}>
        {brands.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="brandId" className="block text-[13px] font-medium text-foreground">
              Brand Voice
            </label>
            <select
              id="brandId"
              name="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="pillar" className="block text-[13px] font-medium text-foreground">
            Content Pillar
          </label>
          <select
            id="pillar"
            name="pillar"
            required
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PILLARS.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-[13px] font-medium text-foreground">
          Article Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Why AI is Reshaping Senior Living Operations"
          required
          className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="content" className="block text-[13px] font-medium text-foreground">
            Article Content
          </label>
          <span className="text-[11px] text-muted-foreground">Paste full article text</span>
        </div>
        <textarea
          id="content"
          name="content"
          placeholder="Paste your full article here. The more content you provide, the better the derivatives will be..."
          rows={14}
          required
          className="w-full resize-none rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Optional metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="canonicalUrl" className="block text-[13px] font-medium text-foreground">
            Canonical URL
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="canonicalUrl"
            name="canonicalUrl"
            type="url"
            placeholder="https://yourblog.com/article-slug"
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="primaryHandle" className="block text-[13px] font-medium text-foreground">
            Primary Handle
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="primaryHandle"
            name="primaryHandle"
            placeholder="@yourhandle"
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Variations slider */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-foreground">Variations per template</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {variationsCount * 61} total pieces · 61 templates · 7 platforms
            </p>
          </div>
          <span className="flex h-9 w-12 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {variationsCount}x
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={variationsCount}
          onChange={handleVariationsChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        />
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>1 variation</span>
          <span>10 variations</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
              Create Source
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
