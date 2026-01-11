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

interface ExecutionLogTableProps {
  executions: any[];
}

export function ExecutionLogTable({ executions }: ExecutionLogTableProps) {
  return (
    <Table>
      <TableHeader className="bg-white/[0.02]">
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocol User</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Operation</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right pr-8">Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] font-black uppercase",
                  execution.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  execution.status === 'verified' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                )}
              >
                {execution.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-[10px] font-medium text-muted-foreground pr-8">
              <span>{execution.createdAt ? format(new Date(execution.createdAt), 'HH:mm:ss') : 'Unknown'}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}