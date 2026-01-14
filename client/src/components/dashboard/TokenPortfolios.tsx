import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Activity } from "lucide-react";
import { Link } from "wouter";

interface TokenPortfoliosProps {
  tokenBalances: any[];
}

export const TokenPortfolios = ({ tokenBalances }: TokenPortfoliosProps) => (
  <section>
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Token Portfolios</h2>
      <div className="h-0.5 flex-1 bg-white/10 mt-2 rounded-full" />
    </div>
    
    {tokenBalances && tokenBalances.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tokenBalances.map((tb: any) => (
          <Card key={tb.symbol} className="glass-card border border-white/10 bg-white/[0.03] hover-elevate transition-all rounded-[2rem] overflow-hidden group shadow-lg">
            <div className="p-6 relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12">
                <Coins className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block italic">{tb.symbol} PROTOCOL</span>
                  <div className="text-3xl font-black font-display text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{tb.balance}</div>
                </div>
                {Number(tb.pending) > 0 && (
                  <div className="flex flex-col items-end">
                    <Badge className="text-[8px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                      VERIFYING ASSETS
                    </Badge>
                    <span className="text-sm font-black text-yellow-500 mt-1 font-mono">+{tb.pending}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Historical Yield</span>
                  <span className="text-xl font-black font-display text-white italic tracking-tight">{tb.earned}</span>
                </div>
                {tb.price && (
                  <div className="text-right">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Valuation (USD)</span>
                    <span className="text-xl font-black text-primary font-mono tracking-tighter">${(Number(tb.balance) * Number(tb.price)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 group hover:border-primary/40 transition-all duration-500 shadow-inner">
        <div className="p-4 rounded-xl bg-white/5 mb-4 group-hover:bg-primary/20 transition-all duration-500 shadow-lg border border-white/5">
          <Activity className="w-8 h-8 text-muted-foreground opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all duration-500" />
        </div>
        <p className="text-base font-display font-black uppercase tracking-[0.2em] text-white/20 italic mb-6 text-center">Data Pipeline Empty</p>
        <Button variant="default" className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg shadow-lg hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5" asChild>
          <Link href="/earn">Engage Network Tasks</Link>
        </Button>
      </div>
    )}
  </section>
);