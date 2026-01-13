import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Ban, ShieldAlert, Clock } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: any[];
  onUpdateStatus: (userId: number, status: string) => void;
  onUpdateRole: (userId: number, role: string) => void;
}

export function UserTable({ 
  users, 
  onUpdateStatus, 
  onUpdateRole
}: UserTableProps) {
  return (
    <Table>
      <TableHeader className="bg-white/[0.02]">
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Wallet Identifier</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Permission Level</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Balance</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Trust Score</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Joined Protocol</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest pr-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(!users || users.length === 0) && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs uppercase font-bold tracking-widest italic">
              No protocol users found.
            </TableCell>
          </TableRow>
        )}
        {users?.map((user: any) => (
          <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
            <TableCell className="font-mono text-[11px] font-bold py-4">
              <span className="text-primary mr-1 opacity-50">#</span>
              {user.walletAddress}
            </TableCell>
            <TableCell>
              <Badge 
                variant={user.status === 'blocked' ? 'destructive' : user.status === 'suspended' ? 'outline' : 'secondary'}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  user.status === 'blocked' && "bg-red-500/20 text-red-500 border-red-500/30",
                  user.status === 'suspended' && "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
                  user.status === 'active' && "bg-green-500/20 text-green-500 border-green-500/30"
                )}
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge 
                variant={user.role === 'admin' ? 'default' : 'secondary'}
                className={user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black uppercase' : 'text-[10px] font-black uppercase'}
              >
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold">{user.balance}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-display">{user.reputationScore}</span>
                <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, (user.reputationScore / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-medium">
              {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Genesis'}
            </TableCell>
            <TableCell className="text-right pr-8">
              <div className="flex justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 border-white/10 font-bold text-[10px] uppercase"
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Status
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
                      Suspend (Check)
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
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary"
                  onClick={() => onUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                >
                  {user.role === 'admin' ? 'Demote' : 'Promote'}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}