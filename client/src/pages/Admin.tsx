import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Megaphone, 
  CheckCircle, 
  ShieldAlert,
  Loader2,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  const { data: users, isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery<any[]>({
    queryKey: ["/api/admin/executions"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error('Failed to update role');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    }
  });

  const updateBlockStatusMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: number, isBlocked: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked })
      });
      if (!res.ok) throw new Error('Failed to update block status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User block status updated" });
    }
  });

  const { data: adminStats, isLoading: loadingStats } = useQuery<{
    totalUsers: number;
    activeCampaigns: number;
    totalExecutions: number;
    totalRewardsPaid: number;
    blockedUsers: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  if (loadingUsers || loadingCampaigns || loadingExecutions || loadingStats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRewardsPaid = adminStats?.totalRewardsPaid || 0;
  const activeCampaignsCount = adminStats?.activeCampaigns || 0;
  const blockedUsersCount = adminStats?.blockedUsers || 0;
  const totalUsersCount = adminStats?.totalUsers || 0;
  const totalExecutionsCount = adminStats?.totalExecutions || 0;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">
            Admin <span className="text-primary">Console</span>
          </h1>
          <p className="text-muted-foreground mt-1">Professional Management & Real-time Operations</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 flex gap-2 items-center border-primary/30 bg-primary/5">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            System Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{blockedUsersCount} blocked</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            <p className="text-[10px] text-primary mt-1 uppercase tracking-wider font-bold">{activeCampaignsCount} active</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutionsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Total tasks done</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Paid</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalRewardsPaid.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Token distribution</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reputation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.walletAddress}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.reputationScore}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant={user.isBlocked ? "destructive" : "outline"}
                      className="h-8 text-xs"
                      onClick={() => updateBlockStatusMutation.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    {user.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                      >
                        Make Admin
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
