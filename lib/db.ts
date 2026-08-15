import postgres from "postgres";

let sqlClient: postgres.Sql | undefined;
let schemaReady: Promise<void> | undefined;

function getSql() {
  if (!sqlClient) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
    }
    sqlClient = postgres(databaseUrl, { ssl: "require", prepare: false });
  }
  return sqlClient;
}

export async function db() {
  const sql = getSql();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          message TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TEXT NOT NULL DEFAULT now()::text,
          updated_at TEXT NOT NULL DEFAULT now()::text
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS lead_notes (
          id SERIAL PRIMARY KEY,
          lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT now()::text
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes (lead_id)
      `;
    })();
  }
  await schemaReady;
  return sql;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  content: string;
  created_at: string;
}
