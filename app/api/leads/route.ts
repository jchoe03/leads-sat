import { NextRequest, NextResponse } from "next/server";
import db, { Lead } from "@/lib/db";
import { sendNewLeadNotification } from "@/lib/notify";

export async function GET() {
  const leads = db
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as unknown as Lead[];
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

  const stmt = db.prepare(
    `INSERT INTO leads (name, email, phone, message) VALUES (?, ?, ?, ?)`
  );
  const result = stmt.run(
    name.trim(),
    email.trim(),
    phone?.trim() || null,
    message?.trim() || null
  );

  const lead = db
    .prepare("SELECT * FROM leads WHERE id = ?")
    .get(result.lastInsertRowid) as unknown as Lead;

  await sendNewLeadNotification(lead);

  return NextResponse.json({ lead }, { status: 201 });
}
