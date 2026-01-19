import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  paginatedLeaders: any[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
}

export function LeaderboardTable({ 
  paginatedLeaders, 
  totalPages, 
  currentPage, 
  setCurrentPage 
}: LeaderboardTableProps) {
  return (
    <div className="space-y-8">
      <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="bg-white/[0.05] px-12 py-8 border-b border-white/10 flex items-center text-sm font-black text-white uppercase tracking-[0.5em] italic">
          <span className="w-20">Rank</span>
          <span className="flex-1">Contributor</span>
          <span className="w-40 text-right">Score</span>
          <span className="w-40 text-right">Tasks</span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-white/10">
            {paginatedLeaders?.map((user) => (
              <div key={user.rank} className="flex items-center px-12 py-10 hover:bg-white/[0.05] transition-all group relative">
                <div className="absolute left-0 w-1.5 h-0 bg-primary group-hover:h-full transition-all duration-300" />
                <span className={cn(
                  "w-20 text-3xl font-black font-display transition-colors",
                  user.rank === 1 ? "text-yellow-500" :
                  user.rank === 2 ? "text-gray-300" :
                  user.rank === 3 ? "text-amber-600" :
                  "text-white/80"
                )}>#{user.rank}</span>
                <div className="flex-1 flex items-center gap-8">
                  <Avatar className="h-16 w-16 border-2 border-white/10 group-hover:border-primary/60 transition-all shadow-xl">
                    <AvatarFallback className="text-base font-black bg-white/10">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-2xl font-display uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">
                      {user.name.startsWith('USER ') ? user.fullWallet.slice(0, 4) + '...' + user.fullWallet.slice(-4) : user.name}
                    </span>
                    <span className="text-xs font-mono text-white/40 truncate max-w-[250px]">{user.fullWallet}</span>
                  </div>
                </div>
                <div className="w-40 text-right">
                  <p className="text-3xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{(user.points || 0).toLocaleString()}</p>
                </div>
                <div className="w-40 text-right">
                  <p className="text-2xl font-black font-display text-white/50">{user.tasks}</p>
                </div>
              </div>
            ))}

            {(!paginatedLeaders || paginatedLeaders.length === 0) && (
              <div className="p-32 text-center">
                <p className="text-white/30 text-xl uppercase font-black tracking-[0.4em] italic animate-pulse">Neural Ranking Data Missing</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
          >
            Previous
          </Button>
          <span className="text-xs font-black text-white/60 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
