import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">환영합니다</h1>
      <p className="mt-2 text-sm text-gray-500">
        문의사항이 있으시면 아래 버튼을 눌러 남겨주세요.
      </p>

      <Link
        href="/contact"
        className="mt-8 rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
      >
        문의하기
      </Link>

      <Link
        href="/admin"
        className="mt-10 text-xs text-gray-400 underline"
      >
        관리자 페이지
      </Link>
    </main>
  );
}
