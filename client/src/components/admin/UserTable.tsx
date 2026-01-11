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
import { UserCheck, Ban } from "lucide-react";
import { format } from "date-fns";

interface UserTableProps {
  users: any[];
  onUpdateBlockStatus: (userId: number, isBlocked: boolean) => void;
  onUpdateRole: (userId: number, role: string) => void;
}

export function UserTable({ users, onUpdateBlockStatus, onUpdateRole }: UserTableProps) {
  return (
    <Table>
      <TableHeader className="bg-white/[0.02]">
        <TableRow className="border-white/5 hover:bg-transparent">
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Wallet Identifier</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Permission Level</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Trust Score</TableHead>
          <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Joined Protocol</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest pr-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user: any) => (
          <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
            <TableCell className="font-mono text-[11px] font-bold py-4">
              <span className="text-primary mr-1 opacity-50">#</span>
              {user.walletAddress}
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
                <Button 
                  size="sm" 
                  variant={user.isBlocked ? "default" : "outline"}
                  className={user.isBlocked 
                    ? "h-8 bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 px-4 font-bold text-[10px] uppercase" 
                    : "h-8 border-red-500/20 text-red-400 hover:bg-red-500/10 px-4 font-bold text-[10px] uppercase"}
                  onClick={() => onUpdateBlockStatus(user.id, !user.isBlocked)}
                >
                  {user.isBlocked ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                  {user.isBlocked ? "Unblock" : "Block User"}
                </Button>
                {user.role !== 'admin' && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary"
                    onClick={() => onUpdateRole(user.id, 'admin')}
                  >
                    Upgrade to Admin
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}