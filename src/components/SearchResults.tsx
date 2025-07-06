'use client'

export interface PlayerResult {
  username: string
  platform: string
}

interface Props {
  results: PlayerResult[]
  onSelect: (player: PlayerResult) => void
}

export default function SearchResults({ results, onSelect }: Props) {
  return (
    <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md max-h-60 overflow-auto">
      {results.map((r) => (
        <li
          key={`${r.username}-${r.platform}`}
          onClick={() => onSelect(r)}
          className="px-4 py-2 hover:bg-gray-700 flex justify-between cursor-pointer"
        >
          <span>{r.username}</span>
          <span className="text-gray-400 text-sm">{r.platform}</span>
        </li>
      ))}
    </ul>
  )
}
