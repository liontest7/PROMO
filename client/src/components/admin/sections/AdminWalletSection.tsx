import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, Zap, Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function AdminWalletSection() {
  const { data: walletInfo, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/wallet-info"],
    refetchInterval: 60000,
  });

  const { data: adminStats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) return <div className="p-8 text-center text-white font-bold animate-pulse">SCANNING PROTOCOL WALLET...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary font-black uppercase tracking-widest">Master Treasury</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Solana Network Balance</p>
            <h2 className="text-4xl font-black font-display text-white">{walletInfo?.balanceSol?.toFixed(4) || "0.0000"} SOL</h2>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/5">
            <p className="text-[10px] font-bold text-white/50 uppercase mb-1">Wallet Address</p>
            <code className="text-xs text-primary font-mono break-all">{walletInfo?.address || "NOT_LOADED"}</code>
          </div>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl p-6">
           <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-white/10">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <Badge variant="outline" className="border-white/20 text-white font-black uppercase tracking-widest">Native Token</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">$DROPY Supply in Treasury</p>
            <h2 className="text-4xl font-black font-display text-white">{walletInfo?.balanceDropy?.toLocaleString() || "0"} $DROPY</h2>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
             <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-bold text-white/50 uppercase">Network Status</p>
                <p className="text-xs font-black text-green-500 uppercase">Mainnet Beta</p>
             </div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-bold text-white/50 uppercase">Tx Priority</p>
                <p className="text-xs font-black text-primary uppercase">Ultra High</p>
             </div>
          </div>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/10">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <Badge variant="outline" className="border-white/20 text-white font-black uppercase tracking-widest">Rewards Pool</Badge>
          </div>
          <div className="space-y-1 py-4">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Weekly Rewards Pool</p>
            <h2 className="text-4xl font-black font-display text-white">{walletInfo?.weeklyRewardsPool?.toLocaleString() || "0"} $DROPY</h2>
            <p className="text-[10px] text-white/50 uppercase">Accumulated from creation fees</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10">Active Balance</Button>
            <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-white/90">Distribute</Button>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Recent Protocol Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 bg-white/[0.01]">
                <TableHead className="text-[10px] font-black uppercase text-white">Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Amount</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Destination</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletInfo?.recentLogs?.length > 0 ? (
                walletInfo.recentLogs.map((log: any, i: number) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="text-[10px] font-mono text-white/70">{log.type || "TRANSFER"}</TableCell>
                    <TableCell className="text-[10px] font-mono text-white">{log.amount || "---"}</TableCell>
                    <TableCell className="text-[10px] font-mono text-primary truncate max-w-[150px]">{log.destination || "SYSTEM"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] border-green-500/50 text-green-500 uppercase">COMPLETED</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/5">
                  <TableCell colSpan={4} className="text-center py-12 text-white/30 text-xs font-black uppercase tracking-widest">No recent on-chain events detected</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
