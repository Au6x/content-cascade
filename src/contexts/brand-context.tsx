"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type BrandColors = {
  primary: string;
  secondary: string;
  tertiary?: string;
  dark: string;
  light: string;
  accent?: string;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
  colors: BrandColors | null;
};

type BrandContextValue = {
  brandId: string | null;
  brandName: string;
  brands: Brand[];
  brandColors: BrandColors | null;
  setBrandId: (id: string | null) => void;
  isLoading: boolean;
};

const BrandContext = createContext<BrandContextValue>({
  brandId: null,
  brandName: "All Brands",
  brands: [],
  brandColors: null,
  setBrandId: () => {},
  isLoading: true,
});

const STORAGE_KEY = "cc-selected-brand";

/** Convert hex (#RRGGBB) to oklch-ish CSS string via inline conversion */
function hexToOklchApprox(hex: string): string {
  // We use the raw hex in CSS — modern browsers support color-mix and hex natively.
  // For the sidebar-primary we just inject the hex directly; Tailwind/CSS handles it.
  return hex;
}

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

  const activeBrand = brandId ? brands.find((b) => b.id === brandId) : null;
  const brandName = activeBrand?.name ?? "All Brands";
  const brandColors = activeBrand?.colors ?? null;

  // Inject brand colors as CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    if (brandColors) {
      root.style.setProperty("--sidebar-primary", brandColors.primary);
      root.style.setProperty("--sidebar-ring", brandColors.primary);
      root.style.setProperty("--primary", brandColors.primary);
      root.style.setProperty("--ring", brandColors.primary);
      root.style.setProperty("--accent", `${brandColors.primary}18`);
      root.style.setProperty("--accent-foreground", brandColors.dark);
    } else {
      // Restore defaults
      root.style.removeProperty("--sidebar-primary");
      root.style.removeProperty("--sidebar-ring");
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
    }
  }, [brandColors]);

  return (
    <BrandContext.Provider
      value={{ brandId, brandName, brands, brandColors, setBrandId, isLoading }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
