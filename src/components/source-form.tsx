"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Content Source</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {brands.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="brandId" className="text-sm font-medium">
                Brand
              </label>
              <Select
                id="brandId"
                name="brandId"
                value={brandId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBrandId(e.target.value)}
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Article title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pillar" className="text-sm font-medium">
              Pillar
            </label>
            <Select id="pillar" name="pillar" required>
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Article Content
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Paste your full article text here..."
              rows={15}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="canonicalUrl" className="text-sm font-medium">
                Canonical URL (optional)
              </label>
              <Input
                id="canonicalUrl"
                name="canonicalUrl"
                type="url"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="primaryHandle" className="text-sm font-medium">
                Primary Handle (optional)
              </label>
              <Input
                id="primaryHandle"
                name="primaryHandle"
                placeholder="@yourhandle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="variationsCount" className="text-sm font-medium">
              Variations per template
            </label>
            <div className="flex items-center gap-4">
              <input
                id="variationsCount"
                type="range"
                min={1}
                max={10}
                value={variationsCount}
                onChange={handleVariationsChange}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary dark:bg-neutral-700"
              />
              <span className="w-16 rounded-md bg-primary/10 px-3 py-1.5 text-center text-sm font-bold text-primary">
                {variationsCount}x
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate {variationsCount} unique variations for each of the 56
              templates ({variationsCount * 56} total derivatives). Each gets
              its own unique visual.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Source"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
