import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VerificationLogsProps {
  executions: any[];
}

export const VerificationLogs = ({ executions }: VerificationLogsProps) => (
  <section>
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Verification Logs</h2>
      <div className="h-0.5 flex-1 bg-white/10 mt-2 rounded-full" />
    </div>
    <Card className="glass-card border border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden shadow-lg">
      <CardContent className="p-0">
        {executions && executions.length > 0 ? (
          <div className="divide-y border-white/5">
            {executions.slice(0, 10).map((execution: any) => (
              <div key={execution.id} className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-primary opacity-40 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                  </div>
                  <div>
                    <p className="font-black text-xl font-display tracking-tight uppercase italic leading-none mb-2 text-white group-hover:text-primary transition-colors">{execution.action?.title || 'System Verification'}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 px-2 py-0.5 bg-white/5 rounded-md tracking-widest">{execution.campaign?.title}</Badge>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">+ {execution.action?.rewardAmount} REWARD</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    className={cn(
                      "text-[8px] font-black uppercase px-4 py-1 rounded-full tracking-widest border border-white/10",
                      execution.status === 'paid' 
                        ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                    )}
                  >
                    {execution.status}
                  </Badge>
                  <span className="text-[8px] font-black font-mono text-white/30 uppercase tracking-widest">
                    {execution.createdAt ? format(new Date(execution.createdAt), 'MMM d, HH:mm') : 'REAL-TIME'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center space-y-2">
            <p className="text-xl font-black font-display uppercase tracking-[0.3em] text-white italic">Protocol Inactivity Detected</p>
            <p className="text-sm font-black uppercase tracking-widest text-white italic">System verification logs are currently empty</p>
          </div>
        )}
      </CardContent>
    </Card>
  </section>
);