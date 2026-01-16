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
import { UserCheck, Ban, ShieldAlert, Clock, MoreHorizontal, Shield, ExternalLink, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  return (
    <>
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Wallet Identifier</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Permission Level</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Balance</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Trust Score</TableHead>
            <TableHead className="text-[12px] font-black uppercase text-white tracking-widest">Joined Protocol</TableHead>
            <TableHead className="text-right text-[12px] font-black uppercase text-white tracking-widest pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!users || users.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-white text-xs uppercase font-black tracking-widest italic">
                No protocol users found.
              </TableCell>
            </TableRow>
          )}
          {users?.map((user: any) => (
            <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
              <TableCell className="font-mono text-xs font-bold py-4 text-white">
                <span className="text-primary mr-1 opacity-50">#</span>
                {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === 'blocked' ? 'destructive' : user.status === 'suspended' ? 'outline' : 'secondary'}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
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
                  className={user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20 text-[11px] font-black uppercase' : 'text-[11px] font-black uppercase'}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white">{user.balance || 0}</span>
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
              <TableCell className="text-sm text-white font-bold">
                {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Genesis'}
              </TableCell>
              <TableCell className="text-right pr-8" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 border-white/10 font-black text-xs uppercase tracking-widest text-white"
                          >
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Status
                          </Button>
                        </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl text-white">
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
                    className="h-8 text-xs font-black uppercase hover:bg-primary/10 hover:text-primary tracking-widest text-white"
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

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl glass-card border-white/10 bg-black/95 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">User Profile <span className="text-primary">Record</span></DialogTitle>
            <DialogDescription className="text-white/70 font-bold">Comprehensive overview of protocol participant behavior.</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-white/50">Wallet Address</span>
                  <p className="text-sm font-mono font-bold truncate">{selectedUser.walletAddress}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase text-white/50">Social Presence</span>
                  <div className="flex gap-2">
                    {selectedUser.twitterHandle ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">@{selectedUser.twitterHandle}</Badge>
                    ) : (
                      <span className="text-xs font-bold text-white/30 italic">No X Connected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Activity Audit</h4>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 p-8 text-center">
                    <Clock className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Execution history coming soon</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 border-white/10 text-xs font-bold uppercase tracking-widest text-white"
                  onClick={() => onUpdateStatus(selectedUser.id, selectedUser.status === 'active' ? 'suspended' : 'active')}
                >
                  {selectedUser.status === 'active' ? 'Suspend' : 'Reinstate'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-9 text-xs font-bold uppercase tracking-widest"
                  onClick={() => {
                    onUpdateStatus(selectedUser.id, 'blocked');
                    setSelectedUser(null);
                  }}
                >
                  Terminate Access
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}