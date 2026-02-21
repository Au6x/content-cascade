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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Source</h1>
        <p className="text-muted-foreground">
          Submit an article to generate social media content
        </p>
      </div>
      <SourceForm brands={brands} />
    </div>
  );
}
