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
  onUpdateStatus: (userId: number, status: string) => void;
}

export function FraudShield({ users, onUpdateStatus }: FraudShieldProps) {
  const suspiciousUsers = users?.filter(u => u.reputationScore > 200 || parseFloat(u.balance) > 50) || [];

  return (
    <Card className="glass-card border-red-500/20 bg-red-500/5 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-red-500/10">
        <CardTitle className="text-xl text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Fraud Detection Shield
        </CardTitle>
        <CardDescription>Users flagged for suspicious activity, high balances, or rapid reputation growth.</CardDescription>
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
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No suspicious activity detected currently.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}