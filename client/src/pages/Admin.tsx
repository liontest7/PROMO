import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";
import { CampaignTable } from "@/components/admin/CampaignTable";
import { ExecutionLogTable } from "@/components/admin/ExecutionLogTable";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { FraudShield } from "@/components/admin/FraudShield";
import { AuditDialog } from "@/components/admin/AuditDialog";
import { LiveTerminal } from "@/components/admin/LiveTerminal";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { walletAddress } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [settingsUpdate, setSettingsUpdate] = useState<any>({});
  
  const fetchAdmin = async ({ queryKey }: any) => {
    const currentWallet = walletAddress || localStorage.getItem('walletAddress');
    console.log(`[Admin] Fetching ${queryKey.join("/")} with wallet: ${currentWallet}`);
    const path = queryKey.join("/");
    const fetchUrl = path.startsWith('/') ? path : `/${path}`;
    const res = await fetch(fetchUrl, {
      headers: {
        'x-wallet-address': currentWallet || '',
        'wallet-address': currentWallet || '',
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Admin] Fetch failed for ${fetchUrl}:`, errorText);
      throw new Error(errorText || "Forbidden");
    }
    return res.json();
  };

  const { data: settings, isLoading: loadingSettings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
    staleTime: 120000,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 300000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: campaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
    staleTime: 300000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: executions } = useQuery<any[]>({
    queryKey: ["/api/admin/executions"],
    staleTime: 300000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: systemHealth } = useQuery<{
    uptime: number;
    memory: any;
    cpu: any;
    dbStatus: string;
    rpcStatus: string;
    errorLogs: any[];
  }>({
    queryKey: ["/api/admin/system-health"],
    staleTime: 300000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: adminStats, isLoading: loadingStats } = useQuery<{
    totalUsers: number;
    activeCampaigns: number;
    totalExecutions: number;
    totalRewardsPaid: number;
    blockedUsers: number;
    suspendedUsers: number;
    suspiciousUsers?: number;
  }>({
    queryKey: ["/api/admin/stats"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const filteredUsers = useMemo(() => (users || []).filter(u => 
    u.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [users, searchTerm]);

  const filteredCampaigns = useMemo(() => (campaigns || []).filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tokenAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [campaigns, searchTerm]);

  const filteredExecutions = useMemo(() => (executions || []).filter(e => 
    e.user?.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [executions, searchTerm]);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const currentWallet = walletAddress || localStorage.getItem('walletAddress');
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
          'wallet-address': currentWallet || ''
        },
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: string }) => {
      const currentWallet = walletAddress || localStorage.getItem('walletAddress');
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
          'wallet-address': currentWallet || ''
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User status updated" });
    }
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, balance }: { userId: number, balance: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': localStorage.getItem('walletAddress') || ''
        },
        body: JSON.stringify({ balance })
      });
      if (!res.ok) throw new Error('Failed to update balance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User balance updated" });
    }
  });

  const updateReputationMutation = useMutation({
    mutationFn: async ({ userId, reputationScore }: { userId: number, reputationScore: number }) => {
      const res = await fetch(`/api/admin/users/${userId}/reputation`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': localStorage.getItem('walletAddress') || ''
        },
        body: JSON.stringify({ reputationScore })
      });
      if (!res.ok) throw new Error('Failed to update reputation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User reputation updated" });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const currentWallet = walletAddress || localStorage.getItem('walletAddress');
      const res = await fetch("/api/admin/settings", {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
          'wallet-address': currentWallet || ''
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to update settings');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
      setSettingsUpdate({});
      toast({ title: "Success", description: "Protocol parameters updated" });
    }
  });

  const { data: logs, isLoading: loadingLogs } = useQuery<any[]>({
    queryKey: ["/api/admin/logs"],
    refetchInterval: 5000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  const { data: walletInfo, isLoading: loadingWallet } = useQuery<any>({
    queryKey: ["/api/admin/wallet-info"],
    refetchInterval: 30000,
    queryFn: fetchAdmin,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress'))
  });

  if (!users || !campaigns || !executions || !adminStats || !systemHealth || !settings || !logs || !walletInfo) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold animate-pulse text-primary tracking-widest uppercase">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
          <CardHeader 
            className="border-b border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors flex flex-row items-center justify-between"
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
          >
            <div>
              <CardTitle className="text-xl text-white">System Controls</CardTitle>
              <CardDescription className="text-base font-bold text-white">Global protocol parameters and feature toggles.</CardDescription>
            </div>
            <div className="text-white">
              {isControlsExpanded ? <ChevronUp className="w-5 h-5 transition-transform" /> : <ChevronDown className="w-5 h-5 transition-transform" />}
            </div>
          </CardHeader>
          {isControlsExpanded && (
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-4">
                      <Switch 
                        id="campaigns-enabled" 
                        checked={settings?.campaignsEnabled ?? true} 
                        onCheckedChange={(checked) => {
                          updateSettingsMutation.mutate({ campaignsEnabled: checked });
                        }}
                      />
                      <Label htmlFor="campaigns-enabled" className="flex flex-col">
                        <span className="font-bold uppercase text-xs tracking-widest text-white">Global Campaign Status</span>
                        <span className="text-sm text-white/70">{settings?.campaignsEnabled ? 'Enabled' : 'Disabled'}</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
                      <div className={`h-3 w-3 rounded-full ${settings?.twitterApiStatus === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'} transition-colors duration-500`} />
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-[10px] tracking-widest text-white/50">Twitter API Status</span>
                        <span className={cn(
                          "text-xs font-black uppercase tracking-tighter",
                          settings?.twitterApiStatus === 'active' ? 'text-green-500' : 'text-red-500'
                        )}>
                          {settings?.twitterApiStatus === 'active' ? 'Live & Connected' : 'Disconnected (Verification Delayed)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Campaign Type Toggles */}
                  <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-white mb-2">Campaign Category Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch 
                          id="holder-enabled" 
                          checked={settings?.holderQualificationEnabled ?? true} 
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ holderQualificationEnabled: checked })}
                        />
                        <Label htmlFor="holder-enabled" className="text-xs uppercase tracking-wider font-bold text-white">Holder Qualification</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch 
                          id="social-enabled" 
                          checked={settings?.socialEngagementEnabled ?? true} 
                          disabled={settings?.twitterApiStatus !== 'active'}
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ socialEngagementEnabled: checked })}
                        />
                        <Label htmlFor="social-enabled" className={cn(
                          "text-xs uppercase tracking-wider font-bold",
                          settings?.twitterApiStatus !== 'active' ? "text-white/30" : "text-white"
                        )}>
                          Social Engagement
                          {settings?.twitterApiStatus !== 'active' && (
                            <span className="block text-[8px] text-red-400 normal-case font-normal">Disabled: No API Connection</span>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-white">Weekly Rewards Pool</h3>
                    <Badge variant="outline" className="text-white border-white/20 text-xs font-black uppercase">
                      Active Balance
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-3xl font-display font-bold text-white">
                        {parseFloat(settings?.weeklyRewardsPool || "0").toLocaleString()} <span className="text-sm text-white/70">$DROPY</span>
                      </p>
                      <p className="text-xs text-white/70 uppercase tracking-wider">Accumulated from creation fees</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 border-white/20 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest"
                      onClick={() => {
                        toast({ 
                          title: "Coming Soon", 
                          description: "Weekly rewards distribution mechanism is being finalized on-chain.",
                        });
                      }}
                    >
                      Distribute
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-white">Protocol Parameters</h3>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-black uppercase",
                      ((settingsUpdate.burnPercent ?? settings?.burnPercent ?? 0) + 
                       (settingsUpdate.rewardsPercent ?? settings?.rewardsPercent ?? 0) + 
                       (settingsUpdate.systemPercent ?? settings?.systemPercent ?? 0)) === 100 
                        ? "text-green-500 border-green-500/20" 
                        : "text-red-500 border-red-500/20"
                    )}>
                      Total: {(settingsUpdate.burnPercent ?? settings?.burnPercent ?? 0) + 
                             (settingsUpdate.rewardsPercent ?? settings?.rewardsPercent ?? 0) + 
                             (settingsUpdate.systemPercent ?? settings?.systemPercent ?? 0)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">Creation Fee ($DROPY)</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.creationFee ?? settings?.creationFee ?? 10000} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, creationFee: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">Burn Percent (%)</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.burnPercent ?? settings?.burnPercent ?? 50} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, burnPercent: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">Rewards Percent (%)</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.rewardsPercent ?? settings?.rewardsPercent ?? 40} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, rewardsPercent: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">System Percent (%)</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.systemPercent ?? settings?.systemPercent ?? 10} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, systemPercent: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full h-10 font-black uppercase text-xs tracking-widest mt-2 bg-white text-black hover:bg-white/90" 
                    onClick={() => updateSettingsMutation.mutate(settingsUpdate)}
                    disabled={updateSettingsMutation.isPending || Object.keys(settingsUpdate).length === 0}
                  >
                    {updateSettingsMutation.isPending ? "Syncing..." : "Update Protocol"}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>


        <AdminStats 
          stats={adminStats || { totalUsers: 0, activeCampaigns: 0, totalExecutions: 0, totalRewardsPaid: 0, blockedUsers: 0 }} 
          campaignsCount={campaigns?.length || 0} 
          walletInfo={walletInfo}
        />

        <Tabs defaultValue="users" className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-xl w-full md:w-auto h-auto gap-1">
              <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                USERS
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                ANALYTICS
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                CAMPAIGNS
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                LOGS
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                WALLET
              </TabsTrigger>
              <TabsTrigger value="health" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">
                HEALTH
              </TabsTrigger>
              <TabsTrigger value="fraud" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-xs tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white text-red-400 hover:text-red-300 transition-all">
                FRAUD
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
                <CardTitle className="text-xl text-white font-black">Protocol Users</CardTitle>
                <CardDescription className="text-base font-bold text-white">Monitor wallet activity and manage access control.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <UserTable 
                  users={filteredUsers}
                  onUpdateRole={(userId, role) => updateRoleMutation.mutate({ userId, role })}
                  onUpdateStatus={(userId, status) => updateStatusMutation.mutate({ userId, status })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl text-white font-black">Protocol Campaigns</CardTitle>
                <CardDescription className="text-base font-bold text-white">Oversight of all active and historical project listings.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CampaignTable 
                  campaigns={filteredCampaigns}
                  onAudit={(campaign) => setSelectedCampaign(campaign)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <SystemHealth health={systemHealth || { uptime: 0, memory: {}, cpu: {}, dbStatus: 'N/A', rpcStatus: 'N/A', errorLogs: [] }} />
            <LiveTerminal 
              errorLogs={systemHealth?.errorLogs || []} 
              executions={executions || []} 
            />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudShield 
              users={users || []} 
              campaigns={campaigns || []}
              onUpdateStatus={(userId, status) => updateStatusMutation.mutate({ userId, status })}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AuditDialog 
        campaign={selectedCampaign} 
        onClose={() => setSelectedCampaign(null)} 
      />
    </div>
  );
}