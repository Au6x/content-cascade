"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  derivativeId: string;
  currentStatus: string;
  ghlPostId?: string | null;
};

export function GhlPublishButton({ derivativeId, currentStatus, ghlPostId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);

  const isPublished = currentStatus === "published" || !!ghlPostId;
  const isScheduled = currentStatus === "scheduled";

  async function publish(scheduleTime?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ghl/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          derivativeId,
          scheduledAt: scheduleTime || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      setShowScheduler(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  if (isPublished) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Published to GHL
      </span>
    );
  }

  if (isScheduled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Scheduled in GHL
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => publish()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#00c97e]/10 px-3 py-1.5 text-[11px] font-semibold text-[#00c97e] transition-colors hover:bg-[#00c97e]/20 disabled:opacity-50"
        >
          {loading && !showScheduler ? (
            <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2 11 13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          Post Now
        </button>
        <button
          onClick={() => setShowScheduler(!showScheduler)}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Schedule
        </button>
      </div>

      {showScheduler && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00c97e]/30"
            min={new Date().toISOString().slice(0, 16)}
          />
          <button
            onClick={() => scheduledAt && publish(new Date(scheduledAt).toISOString())}
            disabled={!scheduledAt || loading}
            className="rounded-lg bg-[#00c97e]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00c97e] transition-colors hover:bg-[#00c97e]/20 disabled:opacity-40"
          >
            {loading ? "..." : "Confirm"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}
