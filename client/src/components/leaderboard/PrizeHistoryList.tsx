import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PrizeHistoryListProps {
  history: any[];
}

export function PrizeHistoryList({ history }: PrizeHistoryListProps) {
  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="bg-white/[0.05] px-12 py-8 border-b border-white/10 flex items-center text-sm font-black text-white uppercase tracking-[0.5em] italic">
          <span className="w-40">Period</span>
          <span className="flex-1">Winners Summary</span>
          <span className="w-40 text-right">Prize Pool</span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-white/10">
            {history?.map((week, idx) => (
              <div key={idx} className="flex flex-col lg:flex-row lg:items-center px-8 lg:px-12 py-10 hover:bg-white/[0.03] transition-all group gap-8">
                <div className="w-full lg:w-40 shrink-0">
                  <p className="text-2xl font-black font-display text-white italic uppercase leading-none">{week.period}</p>
                  <p className="text-[10px] font-black text-white/40 tracking-widest mt-2">{week.dates}</p>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {week.winners.map((winner: any, i: number) => (
                    <div key={i} className="flex flex-col gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl relative group/winner">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 shadow-xl shrink-0",
                          i === 0 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
                          i === 1 ? "bg-gray-300/20 text-gray-300 border-gray-300/50" :
                          "bg-amber-600/20 text-amber-600 border-amber-600/50"
                        )}>
                          #{i + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-base font-black text-white uppercase italic truncate">{winner.name}</p>
                          <p className="text-sm font-black text-primary uppercase leading-none mt-1.5">{winner.prizeAmount.toLocaleString()} $DROP</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-10 w-full bg-white/10 hover:bg-white/20 border-white/10 text-xs font-black uppercase tracking-tighter mt-1" asChild>
                        <a href={winner.proofUrl} target="_blank" rel="noreferrer">
                          <ExternalLinkIcon className="w-4 h-4 mr-2" />
                          Blockchain Proof
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="w-full lg:w-48 text-left lg:text-right flex flex-col lg:items-end shrink-0">
                  <p className="text-6xl lg:text-5xl font-black font-display text-primary italic leading-none">{(week.prize || 0).toLocaleString()}</p>
                  <p className="text-sm font-black text-white/30 tracking-[0.2em] uppercase mt-3">$DROP POOL</p>
                </div>
              </div>
            ))}
          </div>
          
          {(!history || history.length === 0) && (
            <div className="p-32 text-center">
              <p className="text-white/30 text-xl uppercase font-black tracking-[0.4em] italic animate-pulse">Neural History Data Pending First Reward Cycle</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
