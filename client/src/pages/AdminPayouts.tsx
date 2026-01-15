import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, RefreshCw, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminPayouts() {
  const { toast } = useToast();
  
  const { data: history, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/prizes"],
  });

  const retryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/prizes/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prizes"] });
      toast({ title: "Retry initiated", description: "Payout process has been restarted." });
    },
    onError: (err: any) => {
      toast({ 
        title: "Retry failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prize Payouts Control</h1>
        <p className="text-muted-foreground">Monitor and manage weekly leaderboard rewards.</p>
      </div>

      <div className="grid gap-6">
        {history?.map((week) => (
          <Card key={week.id} className={week.status === 'failed' ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Week #{week.weekNumber}
                <span className="ml-4 text-sm font-normal text-muted-foreground">
                  {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                </span>
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant={week.status === 'completed' ? 'default' : week.status === 'processing' ? 'secondary' : 'destructive'}>
                  {week.status.toUpperCase()}
                </Badge>
                {week.status === 'failed' && (
                  <Button 
                    size="sm" 
                    onClick={() => retryMutation.mutate(week.id)}
                    disabled={retryMutation.isPending}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                    Retry All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {week.winners.map((winner: any) => (
                    <TableRow key={winner.userId}>
                      <TableCell className="font-bold">#{winner.rank}</TableCell>
                      <TableCell>{winner.twitterHandle ? `@${winner.twitterHandle}` : 'Anonymous'}</TableCell>
                      <TableCell className="font-mono text-xs">{winner.walletAddress.slice(0, 6)}...{winner.walletAddress.slice(-6)}</TableCell>
                      <TableCell>{winner.prizeAmount} $DROPY</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {winner.status === 'paid' ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : winner.status === 'failed' ? (
                            <div className="group relative">
                              <AlertCircle className="w-4 h-4 text-destructive cursor-help" />
                              {winner.errorMessage && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                  {winner.errorMessage}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          <span className="capitalize text-xs">{winner.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {winner.transactionSignature ? (
                          <a 
                            href={`https://solscan.io/tx/${winner.transactionSignature}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-xs"
                          >
                            Solscan <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {(!history || history.length === 0) && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground font-medium">No prize history found. Automation will generate data on week closure.</p>
          </div>
        )}
      </div>
    </div>
  );
}
