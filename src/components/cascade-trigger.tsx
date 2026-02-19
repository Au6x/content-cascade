"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CascadeProgress } from "@/components/cascade-progress";
import { triggerCascade } from "@/server/cascade";

export function CascadeTrigger({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setError(null);

    try {
      const job = await triggerCascade(sourceId);
      setJobId(job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger cascade");
    } finally {
      setLoading(false);
    }
  }

  function handleComplete() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!jobId && (
        <Button onClick={handleTrigger} disabled={loading} size="lg">
          {loading ? "Starting..." : "Run Cascade"}
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {jobId && (
        <CascadeProgress jobId={jobId} onComplete={handleComplete} />
      )}
    </div>
  );
}
