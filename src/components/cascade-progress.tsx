"use client";

import { useEffect, useState } from "react";

type ProgressData = {
  status: string;
  progress: number;
  totalDerivatives: number;
  completedDerivatives: number;
  completedImages?: number;
  totalImages?: number;
  error?: string;
};

const stageLabels: Record<string, string> = {
  queued: "Waiting in queue...",
  extracting: "Extracting key content...",
  generating: "Generating text derivatives...",
  imaging: "Generating visuals...",
  generating_images: "Generating visuals...",
  completed: "Cascade complete!",
  failed: "Cascade failed",
};

const stageIcons: Record<string, string> = {
  queued: "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4",
  extracting: "M12 3v18 M5.636 5.636 3.515 3.515 m18.364 5.636 2.121-2.121",
  generating: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
  imaging: "M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  generating_images: "M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  completed: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
  failed: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M15 9l-6 6 M9 9l6 6",
};

export function CascadeProgress({
  jobId,
  onComplete,
}: {
  jobId: string;
  onComplete?: () => void;
}) {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/jobs/${jobId}/progress`);

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as ProgressData;
      setData(parsed);

      if (parsed.status === "completed" || parsed.status === "failed") {
        eventSource.close();
        onComplete?.();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId, onComplete]);

  if (!data) {
    return (
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 to-violet-500/5 p-6 ring-1 ring-primary/10">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">
            Connecting to cascade job...
          </span>
        </div>
      </div>
    );
  }

  const isComplete = data.status === "completed";
  const isFailed = data.status === "failed";

  return (
    <div
      className={`overflow-hidden rounded-2xl p-6 ring-1 transition-all ${
        isComplete
          ? "bg-gradient-to-r from-emerald-50 to-green-50 ring-emerald-200/50 dark:from-emerald-950/20 dark:to-green-950/20 dark:ring-emerald-800/30"
          : isFailed
            ? "bg-gradient-to-r from-red-50 to-rose-50 ring-red-200/50 dark:from-red-950/20 dark:to-rose-950/20 dark:ring-red-800/30"
            : "bg-gradient-to-r from-primary/5 to-violet-500/5 ring-primary/10"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isComplete
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : isFailed
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-primary/10"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                isComplete
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isFailed
                    ? "text-red-600 dark:text-red-400"
                    : "text-primary"
              }
            >
              <path d={stageIcons[data.status] || stageIcons.generating} />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">
              {stageLabels[data.status] || data.status}
            </p>
            {data.totalDerivatives > 0 && (
              <p className="text-xs text-muted-foreground">
                {data.completedDerivatives} / {data.totalDerivatives}{" "}
                derivatives
              </p>
            )}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            isComplete
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : isFailed
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-primary/10 text-primary"
          }`}
        >
          {data.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : isFailed
                ? "bg-gradient-to-r from-red-500 to-rose-500"
                : "bg-gradient-to-r from-primary to-violet-500"
          }`}
          style={{ width: `${data.progress}%` }}
        />
      </div>

      {/* Image progress */}
      {data.totalImages != null && data.totalImages > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {data.completedImages ?? 0} / {data.totalImages} image sets generated
        </p>
      )}

      {data.error && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {data.error}
        </p>
      )}
    </div>
  );
}
