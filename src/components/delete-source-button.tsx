"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteSource } from "@/server/sources";

export function DeleteSourceButton({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteSource(sourceId);
      router.push("/sources");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading
          ? "Deleting..."
          : confirming
            ? "Confirm Delete"
            : "Delete Article"}
      </Button>
      {confirming && !loading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
