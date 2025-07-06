// components/PlayerCardPreview.tsx
import Link from 'next/link';

export default function PlayerCardPreview() {
  return (
    <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">ProPlayer2024</h3>
        <span className="text-gray-500 text-xl">🔖</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-green-400 font-medium mb-1">Summary</p>
          <p className="text-gray-200 text-sm">
            Tight-aggressive, solid fundamentals, 3-bet light from late position.
          </p>
        </div>
        <div>
          <p className="text-yellow-400 font-medium mb-1">Exploit</p>
          <p className="text-gray-200 text-sm">
            Wider ranges in position; avoid bluffs on dry boards.
          </p>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-300 mb-6 space-x-4">
        <span>VPIP: <strong className="text-white">22%</strong></span>
        <span>PFR: <strong className="text-white">18%</strong></span>
        <span>3Bet: <strong className="text-white">8%</strong></span>
        <span>C-bet: <strong className="text-white">65%</strong></span>
      </div>

      <textarea
        placeholder="Add your notes about this player..."
        disabled
        className="w-full h-24 px-4 py-3 rounded-lg bg-gray-700 text-gray-400 text-sm resize-none cursor-not-allowed focus:outline-none"
      />

      <Link href="/login">
        <button className="mt-6 w-full py-3 bg-green-500 text-black font-medium rounded-lg hover:bg-green-600 transition">
          View Full Profile →
        </button>
      </Link>
    </div>
  );
}
