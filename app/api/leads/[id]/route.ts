import { NextRequest, NextResponse } from "next/server";
import db, { Lead } from "@/lib/db";

function getLead(id: string) {
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as unknown as
    | Lead
    | undefined;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead = getLead(params.id);
  if (!lead) {
    return NextResponse.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = getLead(params.id);
  if (!existing) {
    return NextResponse.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const { name, email, phone, message, status } = body as Partial<Lead>;

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "name은 비워둘 수 없습니다." }, { status: 400 });
  }
  if (email !== undefined && !email.trim()) {
    return NextResponse.json({ error: "email은 비워둘 수 없습니다." }, { status: 400 });
  }

  db.prepare(
    `UPDATE leads SET
      name = ?,
      email = ?,
      phone = ?,
      message = ?,
      status = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    name !== undefined ? name.trim() : existing.name,
    email !== undefined ? email.trim() : existing.email,
    phone !== undefined ? phone?.trim() || null : existing.phone,
    message !== undefined ? message?.trim() || null : existing.message,
    status !== undefined ? status : existing.status,
    params.id
  );

  const lead = getLead(params.id);
  return NextResponse.json({ lead });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = getLead(params.id);
  if (!existing) {
    return NextResponse.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
  }

  db.prepare("DELETE FROM leads WHERE id = ?").run(params.id);
  return NextResponse.json({ ok: true });
}
