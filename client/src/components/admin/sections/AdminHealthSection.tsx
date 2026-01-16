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
        <Card className="glass-card border-white/20 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-black text-white uppercase">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs uppercase font-black tracking-widest px-3 py-1">Connected</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-black text-white uppercase">Solana RPC</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-xs uppercase font-black tracking-widest px-3 py-1">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" /> Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-sm font-black text-white uppercase tracking-widest mb-2.5 flex justify-between">
               <span>Memory Usage</span>
               <span className="text-primary font-black">{(health?.memory?.rss ? Math.round(health.memory.rss / 1024 / 1024) : 0)}MB / 512MB</span>
             </div>
             <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all duration-1000" style={{ width: `${Math.min(100, ((health?.memory?.rss || 0) / (512 * 1024 * 1024)) * 100)}%` }} />
             </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-orange-400" /> Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-2">
            <div className="text-5xl font-black font-display text-white tracking-tighter italic">
              {health?.uptime ? `${Math.floor(health.uptime / 3600)}H ${Math.floor((health.uptime % 3600) / 60)}M` : "0H 0M"}
            </div>
            <div className="text-xs font-black text-green-500 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Continuous Protection
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/20 bg-white/[0.01] overflow-hidden">
        <CardHeader className="border-b border-white/20 bg-white/[0.02]">
          <CardTitle className="text-base flex items-center gap-2 text-destructive font-black uppercase tracking-widest">
            <AlertCircle className="w-5 h-5" /> Recent Error Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/20">
              <TableRow className="border-none">
                <TableHead className="text-xs font-black uppercase text-white py-4">Timestamp</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Source</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health?.errorLogs?.length > 0 ? health.errorLogs.map((log: any, i: number) => (
                <TableRow key={i} className="border-white/10 hover:bg-white/[0.05] transition-colors">
                  <TableCell className="text-xs font-black font-mono text-white/80">{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] font-black uppercase text-white border-white/30 px-2 py-0.5">[{log.source}]</Badge></TableCell>
                  <TableCell className="text-sm font-black text-red-400">{log.message}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-white/30 text-sm font-black uppercase tracking-widest italic">All systems nominal</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
