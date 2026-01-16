import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ExternalLink, ShieldCheck, Activity, Cpu, HardDrive, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AdminHealthSection() {
  const { toast } = useToast();
  
  const { data: health, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="p-8 text-center text-white font-bold animate-pulse">MONITORING SYSTEM VITALS...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" /> Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white/70 uppercase">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase">{health?.dbStatus || "Connected"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white/70 uppercase">Solana RPC</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase">{health?.rpcStatus || "Healthy"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-400" /> Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-xs font-bold text-white/70 uppercase mb-1">Memory Usage</div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, ((health?.memory?.heapUsed || 0) / (health?.memory?.heapTotal || 1)) * 100)}%` }} />
             </div>
             <div className="text-[10px] text-white/50 mt-1">{Math.round((health?.memory?.heapUsed || 0) / 1024 / 1024)}MB / {Math.round((health?.memory?.heapTotal || 0) / 1024 / 1024)}MB</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-orange-400" /> Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-black text-white">{Math.floor((health?.uptime || 0) / 3600)}h {Math.floor(((health?.uptime || 0) % 3600) / 60)}m</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-sm flex items-center gap-2 text-destructive font-black uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" /> Recent Error Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase text-white">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Source</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health?.errorLogs?.length > 0 ? health.errorLogs.map((log: any, i: number) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell className="text-[10px] font-mono text-white font-bold">{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] uppercase text-white">{log.source}</Badge></TableCell>
                  <TableCell className="text-xs font-medium text-red-400">{log.message}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-white/50 text-xs font-black uppercase tracking-widest">All systems nominal</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
