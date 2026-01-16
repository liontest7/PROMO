import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Terminal, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const cnHelper = (...classes: any[]) => classes.filter(Boolean).join(' ');

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

  if (isLoading) return <div className="p-8 text-center text-white font-black animate-pulse">FETCHING SYSTEM LOGS...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-widest text-white">System Activity Log</h2>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => clearLogsMutation.mutate()}
          disabled={clearLogsMutation.isPending}
          className="h-9 font-black uppercase text-xs tracking-widest"
        >
          <Trash2 className="w-3 h-3 mr-2" /> Clear All
        </Button>
      </div>

      <Card className="glass-card border-white/20 bg-white/[0.01] rounded-xl overflow-hidden">
        <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/20">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-xs font-black uppercase text-white w-32 py-4">Timestamp</TableHead>
                <TableHead className="text-xs font-black uppercase text-white w-24 py-4">Level</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Event</TableHead>
                <TableHead className="text-xs font-black uppercase text-white py-4">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? logs.map((log: any, i: number) => (
                <TableRow key={i} className="border-white/10 hover:bg-white/[0.05] transition-colors">
                  <TableCell className="text-xs font-black font-mono text-white/80">{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cnHelper(
                      "text-[10px] font-black uppercase px-2 py-0.5",
                      log.level === 'error' ? 'text-red-500 border-red-500/40 bg-red-500/5' : 
                      log.level === 'warn' ? 'text-yellow-500 border-yellow-500/40 bg-yellow-500/5' : 
                      'text-blue-400 border-blue-400/40 bg-blue-400/5'
                    )}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-black text-white uppercase tracking-tighter">{log.event}</TableCell>
                  <TableCell className="text-sm font-black text-white font-mono max-w-md truncate">{log.details}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-white/30 text-sm font-black uppercase tracking-widest">No activity recorded</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
