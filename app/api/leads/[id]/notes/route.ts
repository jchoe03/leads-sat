import { NextRequest, NextResponse } from "next/server";
import { db, LeadNote } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sql = await db();
  const notes = (await sql`
    SELECT * FROM lead_notes WHERE lead_id = ${params.id} ORDER BY created_at DESC
  `) as unknown as LeadNote[];
  return NextResponse.json({ notes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { content } = body as { content?: string };

  if (!content || !content.trim()) {
    return NextResponse.json(
      { error: "content는 필수입니다." },
      { status: 400 }
    );
  }

  const sql = await db();
  const rows = (await sql`
    INSERT INTO lead_notes (lead_id, content)
    VALUES (${params.id}, ${content.trim()})
    RETURNING *
  `) as unknown as LeadNote[];

  return NextResponse.json({ note: rows[0] }, { status: 201 });
}
