import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Zap, Trophy, ShieldCheck, Link2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AdminWalletSection() {
  const { data: walletInfo, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/wallet-info"],
  });

  if (isLoading) {
    return <div className="p-8 text-center text-white font-bold animate-pulse">SCANNING TREASURY & ESCROW STATE...</div>;
  }

  const payoutModel = walletInfo?.payoutModel;
  const treasury = walletInfo?.treasury;
  const escrow = walletInfo?.escrow;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary font-black uppercase tracking-widest">System Treasury</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-black text-primary uppercase tracking-widest">Treasury SOL Balance</p>
            <h2 className="text-2xl font-black font-display text-white">{treasury?.balanceSol?.toFixed(4) || "0.0000"} <span className="text-xs">SOL</span></h2>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/10 space-y-2">
            <p className="text-[12px] font-black text-white uppercase">System Wallet</p>
            <code className="text-[9px] text-primary font-black font-mono break-all">{treasury?.systemWalletAddress || "NOT_CONFIGURED"}</code>
            <Badge variant="outline" className={treasury?.systemWalletConfigured ? "border-green-500/40 text-green-500" : "border-red-500/40 text-red-500"}>
              {treasury?.systemWalletConfigured ? "CONFIGURED" : "MISSING SECRET"}
            </Badge>
          </div>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-white/10">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <Badge variant="outline" className="border-white/20 text-white font-black uppercase tracking-widest">Payout Model</Badge>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[11px] font-black text-white uppercase">Cluster</p>
              <p className="text-sm font-black text-primary uppercase">{payoutModel?.cluster || "unknown"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-black text-white uppercase">Rewards Engine</p>
                <p className="text-sm font-black text-white uppercase">{payoutModel?.rewardsPayoutsEnabled ? "Enabled" : "Dry Mode"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] font-black text-white uppercase">Smart Contract</p>
                <p className="text-sm font-black text-white uppercase">{payoutModel?.smartContractEnabled ? "On" : "Off"}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/10">
              <p className="text-[11px] font-black text-white uppercase mb-1">Program ID</p>
              <code className="text-[9px] text-primary font-black font-mono break-all">{payoutModel?.smartContractProgramId || "NOT_SET"}</code>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-white/10">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <Badge variant="outline" className="border-white/20 text-white font-black uppercase tracking-widest">Escrow Coverage</Badge>
          </div>
          <div className="space-y-1 py-4">
            <p className="text-[12px] font-black text-white uppercase tracking-widest">Campaign Escrow Wallets</p>
            <h2 className="text-2xl font-black font-display text-white">{escrow?.activeEscrows || 0} <span className="text-xs">active</span></h2>
            <p className="text-[11px] font-black text-white uppercase">{escrow?.fundedEscrows || 0} funded signatures from {escrow?.totalCampaigns || 0} campaigns</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] font-black text-white uppercase">Treasury DROPY</p>
            <p className="text-sm font-black text-primary uppercase">{treasury?.balanceDropy?.toLocaleString() || "0"} DROPY</p>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-white/20 bg-white/[0.01] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/20 bg-white/[0.02]">
          <CardTitle className="text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Weekly Rewards Pool Snapshot: {walletInfo?.weeklyRewardsPool?.toLocaleString() || "0"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 bg-white/[0.02]">
                <TableHead className="text-xs font-black uppercase text-white py-4">Source</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Message</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletInfo?.recentLogs?.length > 0 ? (
                walletInfo.recentLogs.map((log: any, i: number) => (
                  <TableRow key={i} className="border-white/10 hover:bg-white/[0.05] transition-colors">
                    <TableCell className="text-xs font-black font-mono text-white uppercase">{log.source || "SYSTEM"}</TableCell>
                    <TableCell className="text-xs font-black font-mono text-primary truncate max-w-[500px]">{log.message || "---"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={log.level === "error" ? "text-[10px] font-black border-red-500/50 text-red-500 uppercase bg-red-500/5 px-2 py-0.5" : "text-[10px] font-black border-green-500/50 text-green-500 uppercase bg-green-500/5 px-2 py-0.5"}>
                        {(log.level || "info").toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10">
                  <TableCell colSpan={3} className="text-center py-12 text-white/30 text-sm font-black uppercase tracking-widest italic">No recent protocol events detected</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
