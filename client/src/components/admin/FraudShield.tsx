import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, UserCheck, Ban, Clock, ShieldCheck, UserX, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FraudShieldProps {
  users: any[];
  campaigns?: any[];
  onUpdateStatus: (userId: number, status: string) => void;
}

export function FraudShield({ users, campaigns, onUpdateStatus }: FraudShieldProps) {
  const { data: suspiciousUsers, isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/fraud/suspicious-users"],
    initialData: users?.filter(u => u.reputationScore > 200 || parseFloat(u.balance) > 50 || u.status === 'suspended') || []
  });

  const { data: suspiciousCampaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/fraud/suspicious-campaigns"],
    initialData: campaigns?.filter(c => (parseFloat(c.remainingBudget) < 0) || c.status === 'paused') || []
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="glass-card border-red-500/20 bg-red-500/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-red-500/10">
          <CardTitle className="text-xl text-red-400 flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Suspicious Wallets
          </CardTitle>
          <CardDescription className="text-sm font-bold text-red-200/80">High-balance accounts or unusual reputation scores.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
                  <TableHeader>
                    <TableRow className="border-red-500/10 hover:bg-transparent">
                      <TableHead className="text-xs font-black uppercase text-red-400 tracking-widest">Wallet</TableHead>
                      <TableHead className="text-xs font-black uppercase text-red-400 tracking-widest">Rep/Bal</TableHead>
                      <TableHead className="text-right text-xs font-black uppercase text-red-400 tracking-widest pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {suspiciousUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <TableCell className="font-mono text-[11px] font-black py-4 text-white">
                      {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[10px] w-fit font-black text-white">R:{user.reputationScore}</Badge>
                        <Badge variant="outline" className="text-[10px] w-fit font-black text-red-400">B:{user.balance}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-7 px-3 font-black text-[10px] uppercase tracking-widest">
                            MANAGE
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
                          <DropdownMenuItem className="text-[10px] font-bold uppercase text-green-500" onClick={() => onUpdateStatus(user.id, 'active')}>
                            <UserCheck className="w-3 h-3 mr-2" /> SET ACTIVE
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[10px] font-bold uppercase text-yellow-500" onClick={() => onUpdateStatus(user.id, 'suspended')}>
                            <Clock className="w-3 h-3 mr-2" /> SUSPEND
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[10px] font-bold uppercase text-red-500" onClick={() => onUpdateStatus(user.id, 'blocked')}>
                            <Ban className="w-3 h-3 mr-2" /> BLOCK
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {suspiciousUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-white" />
                      <p className="text-[10px] uppercase font-black tracking-widest text-white">Clean Protocol</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="glass-card border-yellow-500/20 bg-yellow-500/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-yellow-500/10">
          <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Campaign Alerts
          </CardTitle>
          <CardDescription className="text-sm font-bold text-yellow-200/80">Budget anomalies or manual suspensions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
                  <TableHeader>
                    <TableRow className="border-yellow-500/10 hover:bg-transparent">
                      <TableHead className="text-xs font-black uppercase text-yellow-400 tracking-widest">Project</TableHead>
                      <TableHead className="text-xs font-black uppercase text-yellow-400 tracking-widest">State</TableHead>
                      <TableHead className="text-right text-xs font-black uppercase text-yellow-400 tracking-widest pr-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {suspiciousCampaigns.map((campaign: any) => (
                  <TableRow key={campaign.id} className="border-yellow-500/10 hover:bg-yellow-500/10 transition-colors">
                    <TableCell className="font-bold py-4 text-sm text-white">{campaign.title}</TableCell>
                    <TableCell className="font-mono text-xs text-yellow-400 font-black">{campaign.remainingBudget} / {campaign.totalBudget}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-yellow-500/30 text-yellow-400 tracking-widest">{campaign.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {suspiciousCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-white" />
                      <p className="text-[10px] uppercase font-black tracking-widest text-white">Healthy Campaigns</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}