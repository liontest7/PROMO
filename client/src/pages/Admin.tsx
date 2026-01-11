import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Megaphone, 
  CheckCircle, 
  ShieldAlert,
  Loader2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Ban,
  UserCheck
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: users, isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery<any[]>({
    queryKey: ["/api/admin/executions"],
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

  const filteredUsers = users?.filter(u => 
    u.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns?.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExecutions = executions?.filter(e => 
    e.user?.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action?.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const updateCampaignStatusMutation = useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: number, status: string }) => {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update campaign status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Success", description: "Campaign status updated" });
    }
  });

  if (loadingUsers || loadingCampaigns || loadingExecutions || loadingStats) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold animate-pulse text-primary tracking-widest uppercase">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  const totalRewardsPaid = adminStats?.totalRewardsPaid || 0;
  const activeCampaignsCount = adminStats?.activeCampaigns || 0;
  const blockedUsersCount = adminStats?.blockedUsers || 0;
  const totalUsersCount = adminStats?.totalUsers || 0;
  const totalExecutionsCount = adminStats?.totalExecutions || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="px-3 py-1 flex gap-2 items-center border-primary/30 bg-primary/5 text-primary">
                <ShieldCheck className="h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Master Admin</span>
              </Badge>
              <Badge variant="outline" className="px-3 py-1 flex gap-2 items-center border-green-500/30 bg-green-500/5 text-green-500">
                <Activity className="h-3 w-3 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Network Live</span>
              </Badge>
            </div>
            <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none">
              Admin <span className="text-primary">Terminal</span>
            </h1>
            <p className="text-muted-foreground mt-3 font-medium text-sm">Real-time ecosystem management and protocol oversight.</p>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Protocol Value</span>
              <span className="text-2xl font-black font-display text-primary">{(totalRewardsPaid * 0.42).toFixed(2)} SOL</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-display">{totalUsersCount}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[9px] font-bold border-destructive/20 text-destructive bg-destructive/5">
                  {blockedUsersCount} BLOCKED
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold">ACTIVE PROTOCOL</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Campaigns</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Megaphone className="h-4 w-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-display">{campaigns?.length || 0}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary bg-primary/5">
                  {activeCampaignsCount} ACTIVE
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">MANAGED</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Total Task Load</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-display">{totalExecutionsCount}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase">REAL-TIME VERIFIED</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 bg-primary/5 hover-elevate transition-all rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-primary">Protocol Payouts</CardTitle>
              <div className="p-2 rounded-lg bg-primary/20">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-display text-primary">{totalRewardsPaid.toLocaleString()}</div>
              <p className="text-[10px] text-primary/60 mt-1 uppercase font-black tracking-widest">Distributed Tokens</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Console Area */}
        <Tabs defaultValue="users" className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-full md:w-auto">
              <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Protocol Users
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Active Campaigns
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Live Feed
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search wallets, projects..." 
                className="pl-10 bg-white/5 border-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="users">
            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl">Protocol Users</CardTitle>
                <CardDescription>Monitor wallet activity and manage access control.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
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
                    {filteredUsers?.map((user: any) => (
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
                              onClick={() => updateBlockStatusMutation.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
                            >
                              {user.isBlocked ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                              {user.isBlocked ? "Unblock" : "Block User"}
                            </Button>
                            {user.role !== 'admin' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary"
                                onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl">Protocol Campaigns</CardTitle>
                <CardDescription>Oversight of all active and historical project listings.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Project</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Token Info</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Budget Utilization</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase text-muted-foreground tracking-widest pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns?.map((campaign: any) => (
                      <TableRow key={campaign.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 overflow-hidden">
                              {campaign.logoUrl && <img src={campaign.logoUrl} className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-bold text-sm">{campaign.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-primary uppercase">${campaign.tokenName}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{campaign.tokenAddress.slice(0, 4)}...{campaign.tokenAddress.slice(-4)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{campaign.remainingBudget}</span>
                              <span className="text-muted-foreground">/ {campaign.totalBudget}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(Number(campaign.remainingBudget) / Number(campaign.totalBudget)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={campaign.status === 'active' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase' 
                              : 'bg-white/10 text-white/50 border-white/20 text-[9px] font-black uppercase'}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                              <a href={`/campaign/${campaign.id}`} target="_blank">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-[10px] font-black uppercase border-white/10"
                              onClick={() => updateCampaignStatusMutation.mutate({ 
                                campaignId: campaign.id, 
                                status: campaign.status === 'active' ? 'paused' : 'active' 
                              })}
                            >
                              {campaign.status === 'active' ? 'Pause' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executions">
            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl">Protocol Event Log</CardTitle>
                <CardDescription>Real-time audit trail of all task verifications and payouts.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocol User</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Operation</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right pr-8">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExecutions?.map((execution: any) => (
                      <TableRow key={execution.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="font-mono text-[10px] py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{execution.user?.walletAddress?.slice(0, 6)}...{execution.user?.walletAddress?.slice(-4)}</span>
                            <span className="text-muted-foreground opacity-50">USER_ID: {execution.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{execution.campaign?.title}</span>
                            <span className="text-[10px] uppercase text-muted-foreground">{execution.action?.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] font-black uppercase",
                              execution.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              execution.status === 'verified' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            )}
                          >
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-[10px] font-medium text-muted-foreground pr-8">
                          {execution.createdAt ? format(new Date(execution.createdAt), 'HH:mm:ss') : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
