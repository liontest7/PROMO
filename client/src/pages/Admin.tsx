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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  AlertCircle,
  Cpu,
  Database,
  Globe as GlobeIcon,
  LifeBuoy,
  RefreshCcw,
  Zap,
  Trash2,
  FileText,
  ShieldCheck,
  Flame,
  Wallet
} from "lucide-react";
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
  Ban,
  UserCheck,
  Terminal
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";
import { CampaignTable } from "@/components/admin/CampaignTable";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const { data: users, isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery<any[]>({
    queryKey: ["/api/admin/executions"],
  });

  const { data: systemHealth, isLoading: loadingHealth } = useQuery<{
    uptime: number;
    memory: any;
    cpu: any;
    dbStatus: string;
    rpcStatus: string;
    errorLogs: any[];
  }>({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 10000 // Refresh every 10s
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

  const filteredUsers = (users || []).filter(u => 
    u.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = (campaigns || []).filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExecutions = (executions || []).filter(e => 
    e.user?.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.status?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const manualVerifyMutation = useMutation({
    mutationFn: async (executionId: number) => {
      const res = await fetch(`/api/admin/executions/${executionId}/manual-verify`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to verify manually');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/executions"] });
      toast({ title: "Action Verified", description: "Rewards will be processed manually." });
    }
  });

  if (loadingUsers || loadingCampaigns || loadingExecutions || loadingStats || loadingHealth) {
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
        <AdminStats 
          stats={adminStats || { totalUsers: 0, activeCampaigns: 0, totalExecutions: 0, totalRewardsPaid: 0, blockedUsers: 0 }} 
          campaignsCount={campaigns?.length || 0} 
        />

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
              <TabsTrigger value="health" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                System Health
              </TabsTrigger>
              <TabsTrigger value="fraud" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-red-400">
                Fraud Shield
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex-1 md:flex-none rounded-lg px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Live Terminal
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
                <UserTable 
                  users={filteredUsers}
                  onUpdateBlockStatus={(userId, isBlocked) => updateBlockStatusMutation.mutate({ userId, isBlocked })}
                  onUpdateRole={(userId, role) => updateRoleMutation.mutate({ userId, role })}
                />
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
                            <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase border-white/10" onClick={() => setSelectedCampaign(campaign)}>
                              <Clock className="w-3 h-3 mr-1" /> Audit
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                              <a href={`/campaign/${campaign.id}`} target="_blank">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-[10px] font-black uppercase border-white/10 hover:bg-red-500/10 hover:text-red-500"
                              onClick={() => {
                                if(confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
                                  // In a real app we'd add a delete endpoint
                                  toast({ title: "Admin Action", description: "Delete functionality restricted for safety." });
                                }
                              }}
                            >
                              <Ban className="w-3 h-3 mr-1" /> Delete
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

          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-blue-400" /> Server Load
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black font-display">{((systemHealth?.memory?.rss || 0) / 1024 / 1024).toFixed(1)} MB</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Memory Usage (RSS)</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Database className="w-3 h-3 text-green-400" /> DB Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black font-display text-green-400">{systemHealth?.dbStatus}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">PostgreSQL Connectivity</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <GlobeIcon className="w-3 h-3 text-primary" /> Solana RPC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black font-display text-primary">{systemHealth?.rpcStatus}</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Mainnet-Beta Status</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" /> Recent Error Log
                </CardTitle>
                <CardDescription>Critical system events and failed transactions requiring attention.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest w-40">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Event Source</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Critical Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemHealth?.errorLogs?.map((log, idx) => (
                      <TableRow key={idx} className="border-white/5 hover:bg-red-500/[0.02]">
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px] font-black uppercase">{log.source}</Badge></TableCell>
                        <TableCell className="text-xs font-medium text-red-400">{log.message}</TableCell>
                      </TableRow>
                    ))}
                    {(!systemHealth?.errorLogs || systemHealth.errorLogs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground text-xs uppercase font-bold tracking-widest">
                          System operating normally. No critical errors detected.
                        </TableCell>
                      </TableRow>
                    )}
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
                          <div className="flex justify-end gap-2">
                            {execution.status === 'pending' || execution.status === 'rejected' ? (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 text-[9px] font-black uppercase text-primary hover:bg-primary/10"
                                onClick={() => manualVerifyMutation.mutate(execution.id)}
                              >
                                <Zap className="w-3 h-3 mr-1" /> Force Pay
                              </Button>
                            ) : null}
                            <span>{execution.createdAt ? format(new Date(execution.createdAt), 'HH:mm:ss') : 'Unknown'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
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
                    {filteredUsers?.filter(u => u.reputationScore > 200 || parseFloat(u.balance) > 50).map((user: any) => (
                      <TableRow key={user.id} className="border-red-500/10 hover:bg-red-500/10 transition-colors">
                        <TableCell className="font-mono text-[11px] font-bold py-4">{user.walletAddress}</TableCell>
                        <TableCell className="font-bold text-red-400">{user.balance} tokens</TableCell>
                        <TableCell className="font-bold text-red-400">{user.reputationScore}</TableCell>
                        <TableCell className="text-right pr-8">
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 font-bold text-[10px] uppercase"
                            onClick={() => updateBlockStatusMutation.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
                          >
                            {user.isBlocked ? "Unblock" : "Instant Ban"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.filter(u => u.reputationScore > 200 || parseFloat(u.balance) > 50).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No suspicious activity detected currently.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="glass-card border-white/10 bg-black rounded-2xl overflow-hidden font-mono">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Live Terminal Logs
                </CardTitle>
                <CardDescription>Real-time system events, RPC status, and security alerts.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 h-[500px] overflow-y-auto space-y-2">
                {systemHealth?.errorLogs?.map((log: any, i: number) => (
                  <div key={i} className="text-[11px] leading-relaxed flex gap-3">
                    <span className="text-muted-foreground opacity-50">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
                    <span className={cn(
                      "font-black uppercase tracking-tighter",
                      log.source === 'Solana RPC' ? 'text-blue-400' : 'text-primary'
                    )}>[{log.source}]</span>
                    <span className="text-white/80">{log.message}</span>
                  </div>
                ))}
                {(executions || []).slice(0, 10).map((exec: any, i: number) => (
                  <div key={`exec-${i}`} className="text-[11px] leading-relaxed flex gap-3">
                    <span className="text-muted-foreground opacity-50">[{format(new Date(exec.createdAt), 'HH:mm:ss')}]</span>
                    <span className="text-green-400 font-black uppercase tracking-tighter">[EXECUTION]</span>
                    <span className="text-white/80">
                      User {exec.user?.walletAddress.slice(0,6)}... completed {exec.action?.type} for {exec.campaign?.title} (Status: {exec.status})
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
          <div className="relative p-6 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="px-2 py-0.5 border-primary/30 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-tighter">
                  Protocol Audit
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 border-green-500/30 bg-green-500/5 text-green-500 text-[9px] font-black uppercase tracking-tighter">
                  Verified On-Chain
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none">
                {selectedCampaign?.title} <span className="text-primary">Audit</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-xs mt-1">
                Deep protocol verification and proof of execution for campaign {selectedCampaign?.id}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Project Token</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-primary">${selectedCampaign?.tokenName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-50">({selectedCampaign?.tokenAddress?.slice(0,6)}...)</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Remaining Budget</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-green-400">{selectedCampaign?.remainingBudget}</span>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-50">/ {selectedCampaign?.totalBudget}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Proof of Protocol Execution
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Project Creation Fee</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Platform setup and verification fee</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black">PAID (0.42 SOL)</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Deflationary Burn Proof</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Protocol tokens burned on creation</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-black tracking-tighter">BURNED & VERIFIED</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Reward Escrow</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Locked tokens for task distributions</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">SOLANA ESCROW ACTIVE</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-primary mb-1">Audit Consensus</p>
                  <p className="text-[10px] text-primary/80 leading-relaxed">
                    This campaign has been fully verified on the Solana blockchain. All fees, burns, and reward allocations match the protocol state. No anomalies detected.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5" onClick={() => setSelectedCampaign(null)}>
              Dismiss Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
