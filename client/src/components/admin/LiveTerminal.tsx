import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LiveTerminalProps {
  errorLogs: any[];
  executions: any[];
}

export function LiveTerminal({ errorLogs, executions }: LiveTerminalProps) {
  // Combine and sort logs by timestamp
  const terminalLogs = [
    ...(errorLogs || []).map(log => ({ ...log, type: 'error' })),
    ...(executions || []).map(exec => ({ 
      timestamp: exec.createdAt, 
      type: 'execution',
      message: `User ${exec.user?.walletAddress.slice(0,6)}... completed ${exec.action?.type} for ${exec.campaign?.title} (Status: ${exec.status})`,
      source: 'EXECUTION'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className="glass-card border-white/10 bg-black rounded-2xl overflow-hidden font-mono">
      <CardHeader className="border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-xl flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Live Terminal Logs
        </CardTitle>
        <CardDescription>Real-time system events, RPC status, and security alerts.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-[500px] overflow-y-auto space-y-2 flex flex-col-reverse">
        {terminalLogs.length === 0 && (
          <div className="text-[11px] text-muted-foreground opacity-50 italic">
            Waiting for protocol events...
          </div>
        )}
        {terminalLogs.map((log: any, i: number) => (
          <div key={i} className="text-[11px] leading-relaxed flex gap-3">
            <span className="text-muted-foreground opacity-50">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
            <span className={cn(
              "font-black uppercase tracking-tighter",
              log.type === 'execution' ? 'text-green-400' : 
              log.source === 'Solana RPC' ? 'text-blue-400' : 'text-primary'
            )}>[{log.source}]</span>
            <span className="text-white/80">{log.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}