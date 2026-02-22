import "dotenv/config";
import { db } from "../src/lib/db";
import { contentSources, cascadeJobs, derivatives } from "../src/lib/db/schema";
import { getBoss } from "../src/lib/queue/boss";
import { QUEUE_CASCADE, CASCADE_JOB_OPTIONS } from "../src/lib/queue/cascade";
import { eq, desc } from "drizzle-orm";

async function main() {
  console.log("=== Image Quality Test ===\n");

  const [source] = await db
    .insert(contentSources)
    .values({
      title: "How Smart Sensors Are Preventing Falls in Senior Living Communities",
      content: `Smart sensor technology is transforming fall prevention in senior living. AI-powered motion sensors installed in resident rooms can detect subtle changes in gait patterns weeks before a fall occurs. The system learns each resident's normal movement patterns and alerts staff when anomalies appear. Communities using these systems report a 47% reduction in fall-related injuries. The technology works 24/7 without cameras, preserving resident dignity while keeping them safe. One community in Texas reduced emergency room visits by 35% in the first year. The sensors also track sleep quality and bathroom frequency, giving care teams a holistic view of resident wellness. Implementation costs average $200 per room with ROI achieved within 8 months through reduced insurance claims and hospital readmissions.`,
      pillar: "ai_automation",
      variationsCount: 1,
      status: "pending",
    })
    .returning();

  const [job] = await db
    .insert(cascadeJobs)
    .values({ sourceId: source.id, status: "queued" })
    .returning();

  const boss = await getBoss();
  await boss.send(QUEUE_CASCADE, { sourceId: source.id, jobId: job.id }, CASCADE_JOB_OPTIONS);
  console.log(`Source: ${source.id} | Job: ${job.id}`);
  console.log("Monitoring...\n");

  const start = Date.now();
  let lastLog = "";
  const poll = setInterval(async () => {
    const cur = await db.query.cascadeJobs.findFirst({ where: eq(cascadeJobs.id, job.id) });
    if (!cur) return;
    const el = ((Date.now() - start) / 1000).toFixed(0);
    const line = `[${el}s] ${cur.status} ${cur.progress}% | text ${cur.completedDerivatives}/${cur.totalDerivatives} | img ${cur.completedImages}/${cur.totalImages}`;
    if (line !== lastLog) { console.log(line); lastLog = line; }

    if (cur.status === "completed" || cur.status === "failed") {
      clearInterval(poll);
      console.log(`\n=== ${cur.status.toUpperCase()} in ${el}s ===\n`);

      // Show image URLs for sampling
      const derivs = await db.query.derivatives.findMany({
        where: eq(derivatives.sourceId, source.id),
        with: { template: true, platform: true },
      });
      let withImg = 0, total = 0;
      for (const d of derivs) {
        total++;
        const c = d.content as any;
        if (c.imageUrls?.length > 0) {
          withImg++;
          if (withImg <= 6) {
            console.log(`${d.platform?.name}/${d.template?.slug}: ${c.imageUrls[0]}`);
          }
        }
      }
      console.log(`\n${withImg}/${total} derivatives have images`);
      await boss.stop();
      process.exit(0);
    }
  }, 3000);
}

main().catch((e) => { console.error(e); process.exit(1); });
