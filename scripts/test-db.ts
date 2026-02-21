import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function main() {
  const r = await sql`SELECT count(*) as c FROM platforms`;
  console.log("Platforms:", r[0].c);
  const t = await sql`SELECT count(*) as c FROM content_templates`;
  console.log("Templates:", t[0].c);
  await sql.end();
}

main().catch((e) => { console.error("DB Error:", e.message || e); process.exit(1); });
