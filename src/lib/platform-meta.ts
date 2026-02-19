/**
 * Platform visual identity — icons, colors, and gradients for each social platform.
 */

export type PlatformMeta = {
  icon: string;
  color: string;
  gradient: string;
  bgLight: string;
  border: string;
  text: string;
};

const PLATFORM_META: Record<string, PlatformMeta> = {
  LinkedIn: {
    icon: "in",
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#004182]",
    bgLight: "bg-blue-50/60 dark:bg-blue-950/20",
    border: "border-l-[#0A66C2]",
    text: "text-[#0A66C2]",
  },
  X: {
    icon: "X",
    color: "#000000",
    gradient: "from-neutral-800 to-neutral-950",
    bgLight: "bg-neutral-50/60 dark:bg-neutral-900/20",
    border: "border-l-neutral-800",
    text: "text-neutral-800 dark:text-neutral-200",
  },
  Twitter: {
    icon: "X",
    color: "#000000",
    gradient: "from-neutral-800 to-neutral-950",
    bgLight: "bg-neutral-50/60 dark:bg-neutral-900/20",
    border: "border-l-neutral-800",
    text: "text-neutral-800 dark:text-neutral-200",
  },
  Instagram: {
    icon: "IG",
    color: "#E4405F",
    gradient: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]",
    bgLight: "bg-pink-50/60 dark:bg-pink-950/20",
    border: "border-l-[#E4405F]",
    text: "text-[#E4405F]",
  },
  Facebook: {
    icon: "f",
    color: "#1877F2",
    gradient: "from-[#1877F2] to-[#0C5DC7]",
    bgLight: "bg-blue-50/60 dark:bg-blue-950/20",
    border: "border-l-[#1877F2]",
    text: "text-[#1877F2]",
  },
  TikTok: {
    icon: "TT",
    color: "#000000",
    gradient: "from-[#00F2EA] via-[#FF0050] to-[#000000]",
    bgLight: "bg-cyan-50/60 dark:bg-cyan-950/20",
    border: "border-l-[#00F2EA]",
    text: "text-[#00F2EA]",
  },
  YouTube: {
    icon: "YT",
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#CC0000]",
    bgLight: "bg-red-50/60 dark:bg-red-950/20",
    border: "border-l-[#FF0000]",
    text: "text-[#FF0000]",
  },
  Memes: {
    icon: "ME",
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    bgLight: "bg-violet-50/60 dark:bg-violet-950/20",
    border: "border-l-[#8B5CF6]",
    text: "text-[#8B5CF6]",
  },
};

const FALLBACK: PlatformMeta = {
  icon: "?",
  color: "#6B7280",
  gradient: "from-gray-500 to-gray-700",
  bgLight: "bg-gray-50/60 dark:bg-gray-900/20",
  border: "border-l-gray-500",
  text: "text-gray-500",
};

export function getPlatformMeta(name: string): PlatformMeta {
  return PLATFORM_META[name] || FALLBACK;
}
