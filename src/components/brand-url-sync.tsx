"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useBrand } from "@/contexts/brand-context";

export function BrandUrlSync() {
  const { brandId, setBrandId, isLoading } = useBrand();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // On mount: hydrate context from URL if URL has ?brand= and context doesn't
  useEffect(() => {
    if (isLoading || initialized.current) return;
    initialized.current = true;

    const urlBrand = searchParams.get("brand");
    if (urlBrand && !brandId) {
      setBrandId(urlBrand);
    }
  }, [isLoading, searchParams, brandId, setBrandId]);

  // When brandId changes in context, update the URL
  useEffect(() => {
    if (isLoading) return;

    const urlBrand = searchParams.get("brand") || null;
    if (urlBrand === brandId) return;

    const params = new URLSearchParams(searchParams.toString());
    if (brandId) {
      params.set("brand", brandId);
    } else {
      params.delete("brand");
    }

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [brandId, isLoading, pathname, router, searchParams]);

  return null;
}
