import { User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  username: string;
  user_id: string;
  player_tags: string[];
  profile_summary: string[];
  exploit_strategy: string[];
}

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const getTagColor = (tag: string) => {
    const tagColors: { [key: string]: string } = {
      'LAG': 'bg-red-600 hover:bg-red-700',
      'TAG': 'bg-blue-600 hover:bg-blue-700',
      'Fish': 'bg-green-600 hover:bg-green-700',
      'Nit': 'bg-yellow-600 hover:bg-yellow-700',
      'Maniac': 'bg-purple-600 hover:bg-purple-700',
      'Tight': 'bg-indigo-600 hover:bg-indigo-700',
      'Loose': 'bg-orange-600 hover:bg-orange-700',
      'Aggressive': 'bg-red-500 hover:bg-red-600',
      'Passive': 'bg-gray-600 hover:bg-gray-700',
    };
    return tagColors[tag] || 'bg-slate-600 hover:bg-slate-700';
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
            <User className="w-5 h-5 text-slate-300 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors duration-300">
              {player.username}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {player.player_tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className={`text-xs ${getTagColor(tag)} text-white border-0`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Profile Summary */}
        <div>
          <h4 className="font-semibold text-green-400 mb-2">Profile Summary</h4>
          <ul className="space-y-1">
            {player.profile_summary.map((point, index) => (
              <li key={index} className="text-slate-300 text-sm flex items-start">
                <span className="text-green-400 mr-2 mt-1">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Exploit Strategy */}
        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
          <h4 className="font-semibold text-yellow-400 mb-2 flex items-center">
            🎯 Exploit Strategy
          </h4>
          <ul className="space-y-1">
            {player.exploit_strategy.map((strategy, index) => (
              <li key={index} className="text-slate-200 text-sm flex items-start">
                <span className="text-yellow-400 mr-2 mt-1">▶</span>
                {strategy}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
