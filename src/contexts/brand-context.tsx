"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Brand = { id: string; name: string; slug: string };

type BrandContextValue = {
  brandId: string | null;
  brandName: string;
  brands: Brand[];
  setBrandId: (id: string | null) => void;
  isLoading: boolean;
};

const BrandContext = createContext<BrandContextValue>({
  brandId: null,
  brandName: "All Brands",
  brands: [],
  setBrandId: () => {},
  isLoading: true,
});

const STORAGE_KEY = "cc-selected-brand";

export function BrandProvider({
  children,
  initialBrands,
}: {
  children: ReactNode;
  initialBrands: Brand[];
}) {
  const [brands] = useState(initialBrands);
  const [brandId, setBrandIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && initialBrands.some((b) => b.id === stored)) {
      setBrandIdState(stored);
    }
    setIsLoading(false);
  }, [initialBrands]);

  const setBrandId = useCallback((id: string | null) => {
    setBrandIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const brandName =
    brandId
      ? brands.find((b) => b.id === brandId)?.name ?? "All Brands"
      : "All Brands";

  return (
    <BrandContext.Provider
      value={{ brandId, brandName, brands, setBrandId, isLoading }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
