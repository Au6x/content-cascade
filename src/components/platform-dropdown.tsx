"use client";

import { useState, Children, isValidElement } from "react";

type PlatformInfo = {
  name: string;
  icon: string;
  gradient: string;
  color: string;
  count: number;
};

export function PlatformTabs({
  platforms,
  children,
}: {
  platforms: PlatformInfo[];
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const total = platforms.reduce((s, p) => s + p.count, 0);

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelected(null)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            selected === null
              ? "bg-foreground text-background shadow-lg"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold dark:bg-white/10">
            {total}
          </span>
        </button>
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={() => setSelected(selected === p.name ? null : p.name)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              selected === p.name
                ? "text-white shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={
              selected === p.name
                ? { backgroundColor: p.color }
                : undefined
            }
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${p.gradient} text-[9px] font-bold text-white`}
            >
              {p.icon}
            </span>
            {p.name}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              selected === p.name
                ? "bg-white/20"
                : "bg-black/10 dark:bg-white/10"
            }`}>
              {p.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content - show/hide based on selection */}
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return null;
        const platform = (child.props as { "data-platform"?: string })["data-platform"];
        if (selected && platform !== selected) return null;
        return child;
      })}
    </div>
  );
}

/* Keep the old name as an alias so existing imports don't break during transition */
export const PlatformDropdown = PlatformTabs;
