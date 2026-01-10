import { Navigation } from "@/components/Navigation";
import { Trophy, TrendingUp, Star, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_CONFIG } from "@shared/config";

const LEADERBOARD_DATA = [
  { rank: 1, name: "SolanaWhale", points: 12500, avatar: "SW", tasks: 142 },
  { rank: 2, name: "CryptoKing", points: 10200, avatar: "CK", tasks: 98 },
  { rank: 3, name: "DropyHunter", points: 8900, avatar: "DH", tasks: 85 },
  { rank: 4, name: "AirdropFarmer", points: 7600, avatar: "AF", tasks: 72 },
  { rank: 5, name: "MoonWalker", points: 6500, avatar: "MW", tasks: 64 },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter mb-2">Hall of Fame</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-black">Top Ecosystem Contributors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {LEADERBOARD_DATA.slice(0, 3).map((user, i) => (
            <Card key={user.name} className={`glass-card border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden relative group ${i === 0 ? 'md:-translate-y-4 border-yellow-500/30 bg-yellow-500/5' : ''}`}>
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : 'bg-amber-600 text-white'}`}>
                    #{user.rank}
                  </div>
                </div>
                <h3 className="text-xl font-black font-display uppercase italic">{user.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-black font-display text-primary">{user.points.toLocaleString()}</span>
                </div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">{user.tasks} Tasks Completed</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {LEADERBOARD_DATA.map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black font-display text-white/20 w-6">#{user.rank}</span>
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="text-xs font-bold">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-lg">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Score</p>
                      <p className="text-xl font-black font-display text-primary">{user.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right min-w-[100px] hidden sm:block">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tasks</p>
                      <p className="text-lg font-black font-display text-white/60">{user.tasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
