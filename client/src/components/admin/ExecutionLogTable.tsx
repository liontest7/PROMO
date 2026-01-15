import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface ExecutionLogTableProps {
  executions: any[];
}

export function ExecutionLogTable({ executions }: ExecutionLogTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'pending':
      case 'waiting':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return 'text-green-500';
      case 'pending':
      case 'waiting':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="rounded-md border border-white/5">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase text-white tracking-widest py-4">Protocol User</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white tracking-widest py-4">Operation</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white tracking-widest py-4">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white tracking-widest text-right pr-8 py-4">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!executions || executions.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                  <Clock className="w-8 h-8" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Waiting for protocol events...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {executions?.map((execution: any) => (
            <TableRow key={execution.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
              <TableCell className="font-mono text-[10px] py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-primary">{execution.user?.walletAddress?.slice(0, 6)}...{execution.user?.walletAddress?.slice(-4)}</span>
                  <span className="text-muted-foreground opacity-50">USER_ID: {execution.userId}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{execution.campaign?.title}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{execution.action?.type}</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(execution.status)}
                  <span className={cn("text-[10px] font-black uppercase tracking-wider", getStatusColor(execution.status))}>
                    {execution.status}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-4 pr-8">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {execution.createdAt ? format(new Date(execution.createdAt), 'HH:mm:ss') : 'Unknown'}
                  </span>
                  {execution.transactionSignature ? (
                    <a 
                      href={`https://solscan.io/tx/${execution.transactionSignature}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-[9px] font-bold"
                    >
                      SOLSCAN <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[9px] text-muted-foreground uppercase font-black opacity-30 italic">On-Chain Pending</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}