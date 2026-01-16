import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";
import { CampaignTable } from "@/components/admin/CampaignTable";
import { ExecutionLogTable } from "@/components/admin/ExecutionLogTable";
import { FraudShield } from "@/components/admin/FraudShield";
import { AuditDialog } from "@/components/admin/AuditDialog";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminHealthSection } from "@/components/admin/sections/AdminHealthSection";
import { AdminWalletSection } from "@/components/admin/sections/AdminWalletSection";
import { AdminLogsSection } from "@/components/admin/sections/AdminLogsSection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { walletAddress } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [settingsUpdate, setSettingsUpdate] = useState<any>({});
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  
  const currentWallet = walletAddress || localStorage.getItem('walletAddress');

  const { data: users, isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!currentWallet
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["/api/admin/campaigns"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!currentWallet
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery<any[]>({
    queryKey: ["/api/admin/executions"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!currentWallet
  });

  const { data: settings, isLoading: loadingSettings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
    staleTime: 600000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!currentWallet
  });

  const { data: adminStats, isLoading: loadingStats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!currentWallet
  });

  const { data: walletInfo } = useQuery<any>({
    queryKey: ["/api/admin/wallet-info"],
    staleTime: 300000,
    enabled: !!currentWallet
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

  const filteredExecutions = useMemo(() => (executions || []).filter((e: any) => 
    e.user?.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [executions, searchTerm]);

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
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
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
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

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch("/api/admin/settings", {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': currentWallet || '',
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(await res.text() || 'Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setSettingsUpdate({});
      toast({ title: "Success", description: "Protocol parameters updated" });
    }
  });

  const testXConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/test-twitter", {
        method: 'POST',
        headers: { 
          'x-wallet-address': currentWallet || '',
        }
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "X API Verified", description: data.message });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      } else {
        toast({ title: "Verification Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  const isInitialLoading = (loadingUsers || loadingCampaigns || loadingExecutions || loadingStats || loadingSettings) && !users;

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold animate-pulse text-primary tracking-widest uppercase italic">Establishing Secure Admin Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
          <div className="flex-1">
             <AdminStats 
                stats={adminStats || { totalUsers: 0, activeCampaigns: 0, totalExecutions: 0, totalRewardsPaid: 0, blockedUsers: 0 }} 
                campaignsCount={campaigns?.length || 0} 
                walletInfo={walletInfo}
              />
          </div>
        </div>

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
                        onCheckedChange={(checked) => updateSettingsMutation.mutate({ campaignsEnabled: checked })}
                      />
                      <Label htmlFor="campaigns-enabled" className="flex flex-col">
                        <span className="font-bold uppercase text-xs tracking-widest text-white">Global Campaign Status</span>
                        <span className="text-sm text-white/70">{settings?.campaignsEnabled ? 'Enabled' : 'Disabled'}</span>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold uppercase text-xs tracking-widest text-white">Campaign Category Controls</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/10"
                          onClick={() => testXConnectionMutation.mutate()}
                          disabled={testXConnectionMutation.isPending}
                        >
                          {testXConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                        </Button>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold",
                          settings?.twitterApiStatus === 'active' ? "text-green-400 border-green-400/20" : "text-orange-400 border-orange-400/20"
                        )}>
                          X API: {settings?.twitterApiStatus || 'Checking...'}
                        </Badge>
                      </div>
                    </div>
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
                        )}>Social Engagement</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-white">Protocol Parameters</h3>
                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20">
                      Total Allocation: {(settingsUpdate.burnPercent ?? settings?.burnPercent ?? 0) + 
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
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">Burn %</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.burnPercent ?? settings?.burnPercent ?? 50} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, burnPercent: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">Rewards %</Label>
                      <Input 
                        type="number" 
                        className="h-10 bg-black/20 border-white/10 text-sm text-white"
                        value={settingsUpdate.rewardsPercent ?? settings?.rewardsPercent ?? 40} 
                        onChange={(e) => setSettingsUpdate((prev: any) => ({ ...prev, rewardsPercent: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-white uppercase tracking-wider font-bold">System %</Label>
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

        <Tabs defaultValue="users" className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-xl w-full md:w-auto h-auto gap-1">
              <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">USERS</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">ANALYTICS</TabsTrigger>
              <TabsTrigger value="campaigns" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">CAMPAIGNS</TabsTrigger>
              <TabsTrigger value="executions" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">LOGS</TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">WALLET</TabsTrigger>
              <TabsTrigger value="health" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-black text-white hover:text-white transition-all">HEALTH</TabsTrigger>
              <TabsTrigger value="fraud" className="flex-1 md:flex-none rounded-lg px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white text-red-400 hover:text-red-300 transition-all">FRAUD</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="GLOBAL SEARCH..."
                className="pl-10 h-10 bg-white/5 border-white/10 text-white font-bold text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="users">
            <UserTable 
              users={filteredUsers} 
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ userId: id, status })}
              onUpdateRole={(id, role) => updateRoleMutation.mutate({ userId: id, role })}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignTable 
              campaigns={filteredCampaigns} 
              onAudit={(campaign) => setSelectedCampaign(campaign)}
            />
          </TabsContent>

          <TabsContent value="executions">
            <ExecutionLogTable executions={filteredExecutions} />
          </TabsContent>

          <TabsContent value="wallet">
            <AdminWalletSection />
          </TabsContent>

          <TabsContent value="health">
            <AdminHealthSection />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudShield 
              users={filteredUsers} 
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ userId: id, status })}
            />
          </TabsContent>
        </Tabs>

        {selectedCampaign && (
           <AuditDialog 
              campaign={selectedCampaign} 
              onClose={() => setSelectedCampaign(null)} 
            />
        )}
      </div>
    </div>
  );
}
