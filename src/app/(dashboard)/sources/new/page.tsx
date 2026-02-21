import { SourceForm } from "@/components/source-form";
import { listBrands } from "@/server/sources";

export default async function NewSourcePage() {
  let brands: Awaited<ReturnType<typeof listBrands>> = [];
  try {
    brands = await listBrands();
  } catch {
    // DB not connected
  }

  return (
    <div className="mx-auto max-w-2xl pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Source</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Submit an article to cascade across all 7 platforms and 61 templates
        </p>
      </div>

      {/* Form card */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/50 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="text-primary">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Article Details</p>
              <p className="text-[11px] text-muted-foreground">All fields except URL and handle are required</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SourceForm brands={brands} />
        </div>
      </div>
    </div>
  );
}
