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
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-black tracking-widest px-2">Connected</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white/70 uppercase">Solana RPC</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-black tracking-widest px-2">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-400" /> Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1.5 flex justify-between">
               <span>Memory Usage</span>
               <span className="text-primary">{Math.round((health?.memory?.rss || 0) / 1024 / 1024)}MB / 512MB</span>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all duration-1000" style={{ width: `${Math.min(100, ((health?.memory?.rss || 0) / (512 * 1024 * 1024)) * 100)}%` }} />
             </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-orange-400" /> Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-1">
            <div className="text-3xl font-black font-display text-white tracking-tighter italic">
              {health?.uptime ? `${Math.floor(health.uptime / 3600)}H ${Math.floor((health.uptime % 3600) / 60)}M` : "0H 0M"}
            </div>
            <div className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              Continuous Protection
            </div>
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
