import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, Database, Globe as GlobeIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface SystemHealthProps {
  health: {
    uptime: number;
    memory: any;
    cpu: any;
    dbStatus: string;
    rpcStatus: string;
    errorLogs: any[];
  };
}

export function SystemHealth({ health }: SystemHealthProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-400" /> Server Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display">{((health?.memory?.rss || 0) / 1024 / 1024).toFixed(1)} MB</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Memory Usage (RSS)</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Database className="w-3 h-3 text-green-400" /> DB Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display text-green-400">{health?.dbStatus}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">PostgreSQL Connectivity</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <GlobeIcon className="w-3 h-3 text-primary" /> Solana RPC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display text-primary">{health?.rpcStatus}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Mainnet-Beta Status</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-xl flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" /> Recent Error Log
          </CardTitle>
          <CardDescription>Critical system events and failed transactions requiring attention.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-widest w-40">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Event Source</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Critical Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health?.errorLogs?.map((log, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-red-500/[0.02]">
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] font-black uppercase">{log.source}</Badge></TableCell>
                  <TableCell className="text-xs font-medium text-red-400">{log.message}</TableCell>
                </TableRow>
              ))}
              {(!health?.errorLogs || health.errorLogs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground text-xs uppercase font-bold tracking-widest">
                    System operating normally. No critical errors detected.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}