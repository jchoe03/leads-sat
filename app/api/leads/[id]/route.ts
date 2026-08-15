import { NextRequest, NextResponse } from "next/server";
import { db, Lead } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getLead(id: string) {
  const sql = await db();
  const rows = (await sql`
    SELECT * FROM leads WHERE id = ${id}
  `) as unknown as Lead[];
  return rows[0] as Lead | undefined;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead = await getLead(params.id);
  if (!lead) {
    return NextResponse.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await getLead(params.id);
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

  const nextName = name !== undefined ? name.trim() : existing.name;
  const nextEmail = email !== undefined ? email.trim() : existing.email;
  const nextPhone = phone !== undefined ? phone?.trim() || null : existing.phone;
  const nextMessage =
    message !== undefined ? message?.trim() || null : existing.message;
  const nextStatus = status !== undefined ? status : existing.status;

  const sql = await db();
  await sql`
    UPDATE leads SET
      name = ${nextName},
      email = ${nextEmail},
      phone = ${nextPhone},
      message = ${nextMessage},
      status = ${nextStatus},
      updated_at = now()::text
    WHERE id = ${params.id}
  `;

  const lead = await getLead(params.id);
  return NextResponse.json({ lead });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await getLead(params.id);
  if (!existing) {
    return NextResponse.json({ error: "리드를 찾을 수 없습니다." }, { status: 404 });
  }

  const sql = await db();
  await sql`DELETE FROM leads WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
