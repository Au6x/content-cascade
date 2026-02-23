"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBrand } from "@/contexts/brand-context";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1.5" />
        <rect width="7" height="5" x="14" y="3" rx="1.5" />
        <rect width="7" height="9" x="14" y="12" rx="1.5" />
        <rect width="7" height="5" x="3" y="16" rx="1.5" />
      </svg>
    ),
  },
  {
    name: "Sources",
    href: "/sources",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
      </svg>
    ),
  },
  {
    name: "Derivatives",
    href: "/derivatives",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22.54 12.43-1.42-.65-8.58 3.91a2 2 0 0 1-1.66 0L2.3 11.78l-1.42.65a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22.54 16.43-1.42-.65-8.58 3.91a2 2 0 0 1-1.66 0L2.3 15.78l-1.42.65a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { brandId, brandName, brands, brandColors, setBrandId } = useBrand();

  const activeBrand = brandId ? brands.find((b) => b.id === brandId) : null;
  const brandInitials = activeBrand
    ? activeBrand.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo / Brand identity */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        {activeBrand && brandColors ? (
          <>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              {brandInitials}
            </div>
            <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
              {activeBrand.name}
            </span>
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-teal-400 shadow-sm shadow-sidebar-primary/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22.54 12.43-1.42-.65-8.58 3.91a2 2 0 0 1-1.66 0L2.3 11.78l-1.42.65a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-sidebar-foreground">
              Content Cascade
            </span>
          </>
        )}
      </div>

      {/* Brand selector */}
      {brands.length > 0 && (
        <div className="border-b border-sidebar-border px-3 py-3">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Workspace
          </label>
          <select
            value={brandId ?? ""}
            onChange={(e) => setBrandId(e.target.value || null)}
            className="w-full rounded-lg border border-sidebar-border bg-sidebar-accent px-2.5 py-1.5 text-[12px] font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/80 focus:ring-1 focus:ring-sidebar-ring"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                  )}
                >
                  {item.icon}
                </span>
                {item.name}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* New Source CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/sources/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-[13px] font-semibold text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20 transition-all hover:bg-sidebar-primary/90 hover:shadow-sidebar-primary/30"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          New Source
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <p className="text-[11px] font-medium text-sidebar-foreground/40">
            System online · v0.2.0
          </p>
        </div>
      </div>
    </aside>
  );
}
