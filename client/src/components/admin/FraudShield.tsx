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
      <Card className="glass-card border-red-500/30 bg-red-500/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-red-500/20 bg-red-500/5">
          <CardTitle className="text-2xl font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
            <UserX className="h-6 w-6" />
            Suspicious Wallets
          </CardTitle>
          <CardDescription className="text-base font-black text-red-200/90 uppercase tracking-tight italic">Flagged protocol participants requiring immediate review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
                  <TableHeader className="bg-red-500/10 border-b border-red-500/20 sticky top-0 z-10">
                    <TableRow className="border-none">
                      <TableHead className="text-sm font-black uppercase text-red-400 tracking-widest py-4">Wallet</TableHead>
                      <TableHead className="text-sm font-black uppercase text-red-400 tracking-widest py-4">Status & Score</TableHead>
                      <TableHead className="text-right text-sm font-black uppercase text-red-400 tracking-widest pr-6 py-4">Control</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {suspiciousUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <TableCell className="font-mono text-sm font-black py-5 text-white">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[12px] font-black text-white bg-white/10 border-white/20 px-2 py-0.5">R:{user.reputationScore}</Badge>
                        <Badge variant="outline" className="text-[12px] font-black text-red-400 bg-red-500/10 border-red-500/30 px-2 py-0.5">B:{user.balance}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-9 px-4 font-black text-xs uppercase tracking-widest border border-red-500/50 hover:bg-red-500 transition-all">
                            MANAGE
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black border-red-500/30 text-white p-2">
                          <DropdownMenuItem className="text-xs font-black uppercase tracking-widest text-green-500 focus:bg-green-500/20 cursor-pointer" onClick={() => onUpdateStatus(user.id, 'active')}>
                            <UserCheck className="w-4 h-4 mr-2" /> SET ACTIVE
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-black uppercase tracking-widest text-yellow-500 focus:bg-yellow-500/20 cursor-pointer" onClick={() => onUpdateStatus(user.id, 'suspended')}>
                            <Clock className="w-4 h-4 mr-2" /> SUSPEND
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-black uppercase tracking-widest text-red-500 focus:bg-red-500/20 cursor-pointer" onClick={() => onUpdateStatus(user.id, 'blocked')}>
                            <Ban className="w-4 h-4 mr-2" /> BLOCK
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {suspiciousUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                      <p className="text-sm font-black uppercase tracking-widest text-white italic">Clean Protocol Environment</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="glass-card border-yellow-500/30 bg-yellow-500/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-yellow-500/20 bg-yellow-500/5">
          <CardTitle className="text-2xl font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Campaign Anomalies
          </CardTitle>
          <CardDescription className="text-base font-black text-yellow-200/90 uppercase tracking-tight italic">Irregular budget behavior or manual intervention alerts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
                  <TableHeader className="bg-yellow-500/10 border-b border-yellow-500/20 sticky top-0 z-10">
                    <TableRow className="border-none">
                      <TableHead className="text-sm font-black uppercase text-yellow-400 tracking-widest py-4">Project</TableHead>
                      <TableHead className="text-sm font-black uppercase text-yellow-400 tracking-widest py-4">State</TableHead>
                      <TableHead className="text-right text-sm font-black uppercase text-yellow-400 tracking-widest pr-6 py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {suspiciousCampaigns.map((campaign: any) => (
                  <TableRow key={campaign.id} className="border-yellow-500/10 hover:bg-yellow-500/10 transition-colors">
                    <TableCell className="font-black py-5 text-base text-white uppercase">{campaign.title}</TableCell>
                    <TableCell className="font-mono text-sm text-yellow-400 font-black">{campaign.remainingBudget} / {campaign.totalBudget}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className="text-[12px] font-black uppercase border-yellow-500/40 text-yellow-400 bg-yellow-500/10 px-3 py-1 tracking-widest">{campaign.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {suspiciousCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                      <p className="text-sm font-black uppercase tracking-widest text-white italic">Healthy Campaign Ecosystem</p>
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