import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Activity, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface LiveTerminalProps {
  errorLogs: any[];
  executions: any[];
}

export function LiveTerminal({ errorLogs, executions }: LiveTerminalProps) {
  const { data: history } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/history"],
  });

  // Combine and sort logs by timestamp
  const terminalLogs = [
    ...(errorLogs || []).map(log => ({ ...log, type: 'error', source: 'SYSTEM' })),
    ...(executions || []).map(exec => ({ 
      timestamp: exec.createdAt, 
      type: 'execution',
      message: `User ${exec.user?.walletAddress.slice(0,6)}... completed ${exec.action?.type} for ${exec.campaign?.title} (Status: ${exec.status})`,
      source: 'EXECUTION'
    })),
    ...(history || []).flatMap(h => h.winners.map((w: any) => ({
      timestamp: h.endDate,
      type: w.status === 'paid' ? 'success' : 'error',
      message: `Weekly Payout: ${w.name} received ${w.prizeAmount} $DROPY (${w.status})`,
      source: 'AUTOMATION'
    })))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className="glass-card border-white/10 bg-black rounded-2xl overflow-hidden font-mono">
      <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl flex items-center gap-2 text-white">
            <Terminal className="h-5 w-5 text-primary" />
            Live Terminal Logs
          </CardTitle>
          <CardDescription className="text-sm font-medium text-white/70">Real-time system events, payouts, and security alerts.</CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Activity className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Engine Active</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-[500px] overflow-y-auto space-y-2 flex flex-col-reverse">
        {terminalLogs.length === 0 && (
          <div className="text-[11px] text-muted-foreground opacity-50 italic">
            Waiting for protocol events...
          </div>
        )}
        {terminalLogs.map((log: any, i: number) => (
          <div key={i} className="text-[11px] leading-relaxed flex gap-3 group">
            <span className="text-muted-foreground opacity-50">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
            <span className={cn(
              "font-black uppercase tracking-tighter",
              log.source === 'EXECUTION' ? 'text-green-400' : 
              log.source === 'AUTOMATION' ? 'text-blue-400' : 'text-primary'
            )}>[{log.source}]</span>
            <span className="text-white/80 group-hover:text-white transition-colors">{log.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}