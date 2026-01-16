import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Terminal, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function AdminLogsSection() {
  const { toast } = useToast();
  
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/logs"],
    refetchInterval: 5000,
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/logs/clear", { method: 'POST' });
      if (!res.ok) throw new Error("Failed to clear logs");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "Success", description: "Admin logs cleared" });
    }
  });

  if (isLoading) return <div className="p-8 text-center text-white font-bold animate-pulse">FETCHING SYSTEM LOGS...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black uppercase tracking-widest text-white">System Activity Log</h2>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => clearLogsMutation.mutate()}
          disabled={clearLogsMutation.isPending}
          className="h-8 font-black uppercase text-[10px] tracking-widest"
        >
          <Trash2 className="w-3 h-3 mr-2" /> Clear All
        </Button>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] rounded-xl overflow-hidden">
        <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/10">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-white w-32">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white w-24">Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Event</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length > 0 ? logs.map((log: any, i: number) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="text-[10px] font-mono text-white/50">{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase",
                      log.level === 'error' ? 'text-red-500 border-red-500/20' : 
                      log.level === 'warn' ? 'text-yellow-500 border-yellow-500/20' : 
                      'text-blue-400 border-blue-400/20'
                    )}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-white uppercase tracking-tighter">{log.event}</TableCell>
                  <TableCell className="text-xs font-medium text-white/70 font-mono max-w-md truncate">{log.details}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-white/30 text-xs font-black uppercase tracking-widest">No activity recorded</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
