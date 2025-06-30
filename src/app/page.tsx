"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PlayerCard from "@/components/PlayerCard";
import { supabase } from "@/lib/supabaseClient";

interface Player {
  username: string;
  user_id: string;
  player_tags: string[];
  profile_summary: string[];
  exploit_strategy: string[];
}

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("poker_profiles")
        .select("username, user_id, player_tags, profile_summary, exploit_strategy")
        .not("profile_summary", "is", null)
        .not("exploit_strategy", "is", null);

      if (error) console.error("Error fetching players:", error);
      else setPlayers(data as Player[]);
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter(player =>
      player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-green-400">PokerProfile</h1>
            <div className="text-sm text-slate-400">{filteredPlayers.length} players</div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search players by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400"
            />
          </div>
        </div>
      </header>

      {/* Cards */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No players found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.user_id} player={player} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
