import { NextRequest, NextResponse } from "next/server";
import { db, Lead } from "@/lib/db";
import { sendNewLeadNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = await db();
  const leads = (await sql`
    SELECT * FROM leads ORDER BY created_at DESC
  `) as unknown as Lead[];
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, message } = body as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  if (!name || !name.trim() || !email || !email.trim()) {
    return NextResponse.json(
      { error: "name과 email은 필수입니다." },
      { status: 400 }
    );
  }

  const sql = await db();
  const rows = (await sql`
    INSERT INTO leads (name, email, phone, message)
    VALUES (${name.trim()}, ${email.trim()}, ${phone?.trim() || null}, ${
    message?.trim() || null
  })
    RETURNING *
  `) as unknown as Lead[];
  const lead = rows[0];

  await sendNewLeadNotification(lead);

  return NextResponse.json({ lead }, { status: 201 });
}
