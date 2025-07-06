// components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold hover:opacity-80 transition"
        >
          <span className="text-green-400">Poker</span>
          <span className="text-white">Genie</span>
        </Link>

        <Link href="/login">
          <button className="px-5 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition">
            Login
          </button>
        </Link>
      </div>
    </header>
  );
}
