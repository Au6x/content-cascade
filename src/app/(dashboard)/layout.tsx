import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { BrandProvider } from "@/contexts/brand-context";
import { BrandUrlSync } from "@/components/brand-url-sync";
import { listBrands } from "@/server/sources";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let brands: { id: string; name: string; slug: string }[] = [];
  try {
    brands = await listBrands();
  } catch {
    // DB not connected yet
  }

  return (
    <BrandProvider initialBrands={brands}>
      <Suspense fallback={null}>
        <BrandUrlSync />
      </Suspense>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </BrandProvider>
  );
}
