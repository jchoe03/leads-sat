"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "제출 중 오류가 발생했습니다.");
      setStatus("error");
      return;
    }

    setStatus("done");
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Link href="/" className="text-xs text-gray-400 underline">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">문의하기</h1>
      <p className="mt-1 text-sm text-gray-500">
        아래 정보를 남겨주시면 확인 후 연락드리겠습니다.
      </p>

      {status === "done" ? (
        <div className="mt-8 rounded-md bg-green-50 p-4 text-green-800">
          제출이 완료되었습니다. 감사합니다!
          <button
            className="mt-3 block text-sm underline"
            onClick={() => setStatus("idle")}
          >
            다시 제출하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">이름 *</label>
            <input
              required
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">이메일 *</label>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">전화번호</label>
            <input
              type="tel"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">메시지</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {status === "submitting" ? "제출 중..." : "제출하기"}
          </button>
        </form>
      )}

      <Link
        href="/admin"
        className="mt-10 block text-center text-xs text-gray-400 underline"
      >
        관리자 페이지
      </Link>
    </main>
  );
}
