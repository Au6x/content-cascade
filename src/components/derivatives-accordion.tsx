"use client";

import { useState } from "react";
import { VariationScroller } from "@/components/variation-scroller";
import type { PlatformMeta } from "@/lib/platform-meta";

type DerivativeItem = {
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

type PlatformGroup = {
  name: string;
  meta: PlatformMeta;
  items: DerivativeItem[];
};

type ArticleGroup = {
  sourceId: string;
  title: string;
  platforms: PlatformGroup[];
  totalCount: number;
};

type TemplateGroup = {
  templateName: string;
  templateSlug: string;
  variations: DerivativeItem[];
};

function groupByTemplate(items: DerivativeItem[]): TemplateGroup[] {
  const groups: TemplateGroup[] = [];
  for (const d of items) {
    const slug = d.template?.slug || "unknown";
    let group = groups.find((g) => g.templateSlug === slug);
    if (!group) {
      group = {
        templateName:
          d.template?.name ||
          slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        templateSlug: slug,
        variations: [],
      };
      groups.push(group);
    }
    group.variations.push(d);
  }
  return groups;
}

export function DerivativesAccordion({
  articles,
}: {
  articles: ArticleGroup[];
}) {
  const [openArticle, setOpenArticle] = useState<string | null>(
    articles.length === 1 ? articles[0].sourceId : null
  );
  const [openPlatform, setOpenPlatform] = useState<string | null>(null);

  const toggleArticle = (id: string) => {
    if (openArticle === id) {
      setOpenArticle(null);
      setOpenPlatform(null);
    } else {
      setOpenArticle(id);
      setOpenPlatform(null);
    }
  };

  const togglePlatform = (key: string) => {
    setOpenPlatform(openPlatform === key ? null : key);
  };

  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const isArticleOpen = openArticle === article.sourceId;

        return (
          <div
            key={article.sourceId}
            className="rounded-xl ring-1 ring-neutral-200"
          >
            {/* ── Article button ── */}
            <button
              onClick={() => toggleArticle(article.sourceId)}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
                isArticleOpen
                  ? "bg-white text-neutral-900"
                  : "bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {/* Expand/collapse arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform ${
                  isArticleOpen ? "rotate-90" : ""
                }`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-extrabold text-blue-700">
                  {article.title}
                </h3>
                <p className="text-xs text-neutral-500">
                  {article.totalCount} pieces &middot;{" "}
                  {article.platforms.length} platforms
                </p>
              </div>

              <a
                href={`/sources/${article.sourceId}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 rounded-md bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
              >
                View Source
              </a>
            </button>

            {/* ── Platform buttons grid ── */}
            {isArticleOpen && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap gap-3">
                  {article.platforms.map((pg) => {
                    const platformKey = `${article.sourceId}:${pg.name}`;
                    const isPlatformOpen = openPlatform === platformKey;
                    const templateGroups = groupByTemplate(pg.items);
                    const uniqueTemplates = templateGroups.length;
                    const maxVariations = Math.max(
                      ...templateGroups.map((g) => g.variations.length),
                      1
                    );
                    const failedCount = pg.items.filter(
                      (d) =>
                        d.content.primaryContent?.startsWith("[Generation failed") ||
                        d.content.imageGenerationStatus === "failed"
                    ).length;

                    return (
                      <div
                        key={pg.name}
                        onClick={() => togglePlatform(platformKey)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                          isPlatformOpen
                            ? "ring-2 shadow-md"
                            : "ring-1 ring-neutral-200 hover:ring-neutral-300"
                        }`}
                        style={
                          isPlatformOpen
                            ? {
                                backgroundColor: pg.meta.color + "15",
                                boxShadow: `0 0 0 2px ${pg.meta.color}`,
                              }
                            : { backgroundColor: "white" }
                        }
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: pg.meta.color }}
                        >
                          {pg.meta.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-neutral-900">
                            {pg.name}
                          </span>
                          <span className="block text-[11px] text-neutral-500">
                            {uniqueTemplates} templates
                            {maxVariations > 1 &&
                              ` · ${maxVariations} variations`}
                            {failedCount > 0 && (
                              <span className="ml-1 text-red-500">
                                · {failedCount} failed
                              </span>
                            )}
                          </span>
                        </div>
                        <span
                          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition-colors ${
                            isPlatformOpen
                              ? "bg-white/80"
                              : "bg-neutral-100 hover:bg-neutral-200"
                          }`}
                          style={isPlatformOpen ? { color: pg.meta.color } : undefined}
                        >
                          {isPlatformOpen ? "Viewing" : "View"}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${isPlatformOpen ? "rotate-90" : ""}`}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* ── Expanded platform content ── */}
                {openPlatform &&
                  article.platforms.map((pg) => {
                    const platformKey = `${article.sourceId}:${pg.name}`;
                    if (openPlatform !== platformKey) return null;

                    const templateGroups = groupByTemplate(pg.items);

                    return (
                      <div key={platformKey} className="mt-4 space-y-6">
                        {/* Platform header */}
                        <div
                          className="flex items-center gap-3 border-l-4 pl-3"
                          style={{ borderColor: pg.meta.color }}
                        >
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: pg.meta.color }}
                          >
                            {pg.meta.icon}
                          </span>
                          <h4 className="text-base font-extrabold text-blue-700">
                            {pg.name}
                          </h4>
                          <span className="text-xs text-neutral-500">
                            {templateGroups.length}{" "}
                            {templateGroups.length === 1
                              ? "template"
                              : "templates"}
                            {templateGroups[0]?.variations.length > 1 &&
                              ` · ${templateGroups[0].variations.length} variations each`}
                          </span>
                        </div>

                        {/* All templates with carousel arrows */}
                        {templateGroups.map((group) => (
                          <VariationScroller
                            key={group.templateSlug}
                            templateName={group.templateName}
                            variations={group.variations}
                            platformName={pg.name}
                            meta={pg.meta}
                          />
                        ))}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
