import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Database, Cpu, HardDrive, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Globe as GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface SystemHealthProps {
  health: {
    uptime: number;
    memory: any;
    cpu: any;
    dbStatus: string;
    rpcStatus: string;
    errorLogs: any[];
    memoryUsage?: string;
    memoryPercent?: number;
  };
}

export function SystemHealth({ health }: SystemHealthProps) {
  const { toast } = useToast();

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/logs/clear", { method: 'POST' });
      if (!res.ok) throw new Error("Failed to clear logs");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Success", description: "System logs cleared" });
    }
  });

  const testApiMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/test-twitter", { method: 'POST' });
      if (!res.ok) throw new Error("API Test failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? "API Live" : "API Error", 
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" /> Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 uppercase">Database</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black uppercase">
                {health?.dbStatus || "Connected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 uppercase">Solana RPC</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black uppercase">
                {health?.rpcStatus || "Healthy"}
              </Badge>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between h-9 border-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5"
                onClick={() => clearLogsMutation.mutate()}
                disabled={clearLogsMutation.isPending}
              >
                Clear System Logs
                <RefreshCw className={cn("h-3 w-3", clearLogsMutation.isPending && "animate-spin")} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between h-9 border-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5"
                onClick={() => testApiMutation.mutate()}
                disabled={testApiMutation.isPending}
              >
                Test X (Twitter) API
                <ShieldCheck className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-400" /> Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase">
                <span>Memory Usage</span>
                <span>{health?.memoryUsage || "0MB"}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                  style={{ width: `${health?.memoryPercent || 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white/70 uppercase">
                <span>CPU Load (1m)</span>
                <span>{health?.cpu?.[0]?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(100, (health?.cpu?.[0] || 0) * 10)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-orange-400" /> System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <div className="text-4xl font-display font-bold text-white">
              {Math.floor((health?.uptime || 0) / 3600)}h {Math.floor(((health?.uptime || 0) % 3600) / 60)}m
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-2">Continuous Protocol Operation</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-xl flex items-center gap-2 text-destructive font-black uppercase tracking-tighter">
            <AlertCircle className="w-5 h-5" /> Recent Error Log
          </CardTitle>
          <CardDescription className="text-sm font-bold text-white/90">Critical system events and failed transactions requiring attention.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-widest w-40 text-white">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white">Event Source</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white">Critical Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {health?.errorLogs?.map((log: any, idx: number) => (
                <TableRow key={idx} className="border-white/5 hover:bg-red-500/[0.02]">
                  <TableCell className="text-[10px] font-mono text-white font-bold">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] font-black uppercase text-white border-white/20">{log.source}</Badge></TableCell>
                  <TableCell className="text-xs font-medium text-red-400">{log.message}</TableCell>
                </TableRow>
              ))}
              {(!health?.errorLogs || health.errorLogs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-white text-xs uppercase font-black tracking-widest">
                    System operating normally. No critical errors detected.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}