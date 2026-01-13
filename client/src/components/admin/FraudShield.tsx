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
import { ShieldAlert, UserCheck, Ban, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FraudShieldProps {
  users: any[];
  campaigns?: any[];
  onUpdateStatus: (userId: number, status: string) => void;
}

export function FraudShield({ users, campaigns, onUpdateStatus }: FraudShieldProps) {
  const suspiciousUsers = users?.filter(u => u.reputationScore > 200 || parseFloat(u.balance) > 50 || u.status === 'suspended') || [];

  const suspiciousCampaigns = campaigns?.filter(c => (parseFloat(c.remainingBudget) < 0) || c.status === 'paused') || [];

  return (
    <div className="space-y-8">
      <Card className="glass-card border-red-500/20 bg-red-500/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-red-500/10">
          <CardTitle className="text-xl text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            User Fraud Shield
          </CardTitle>
          <CardDescription>Wallets flagged for suspicious activity or policy violations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-red-500/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-red-400 tracking-widest">Flagged Wallet</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-red-400 tracking-widest">Balance</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-red-400 tracking-widest">Reputation</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase text-red-400 tracking-widest pr-8">Emergency Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousUsers.map((user: any) => (
                <TableRow key={user.id} className="border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <TableCell className="font-mono text-[11px] font-bold py-4">{user.walletAddress}</TableCell>
                  <TableCell className="font-bold text-red-400">{user.balance} tokens</TableCell>
                  <TableCell className="font-bold text-red-400">{user.reputationScore}</TableCell>
                  <TableCell className="text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-8 font-bold text-[10px] uppercase"
                        >
                          Action
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
                        <DropdownMenuItem 
                          className="text-xs font-bold uppercase tracking-wider text-green-500 hover:bg-green-500/10"
                          onClick={() => onUpdateStatus(user.id, 'active')}
                        >
                          <UserCheck className="w-3 h-3 mr-2" />
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs font-bold uppercase tracking-wider text-yellow-500 hover:bg-yellow-500/10"
                          onClick={() => onUpdateStatus(user.id, 'suspended')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          Suspend (Review)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10"
                          onClick={() => onUpdateStatus(user.id, 'blocked')}
                        >
                          <Ban className="w-3 h-3 mr-2" />
                          Block Permanent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {suspiciousUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic text-xs uppercase tracking-widest">Clean Protocol</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {suspiciousCampaigns.length > 0 && (
        <Card className="glass-card border-yellow-500/20 bg-yellow-500/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-yellow-500/10">
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Campaign Alerts
            </CardTitle>
            <CardDescription>Campaigns with budget anomalies or manual suspensions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-yellow-500/10 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">Campaign Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">Budget State</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-yellow-400 tracking-widest">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-yellow-400 tracking-widest pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousCampaigns.map((campaign: any) => (
                  <TableRow key={campaign.id} className="border-yellow-500/10 hover:bg-yellow-500/10 transition-colors">
                    <TableCell className="font-bold py-4">{campaign.title}</TableCell>
                    <TableCell className="font-mono text-[10px] text-yellow-400">{campaign.remainingBudget} / {campaign.totalBudget}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-yellow-500/30 text-yellow-400">{campaign.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button size="sm" variant="outline" className="h-8 text-[10px] font-black border-yellow-500/20 hover:bg-yellow-500/10" asChild>
                         <a href={`/campaign/${campaign.id}`}>AUDIT</a>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}