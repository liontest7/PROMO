import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";
import { CampaignTable } from "@/components/admin/CampaignTable";
import { ExecutionLogTable } from "@/components/admin/ExecutionLogTable";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { FraudShield } from "@/components/admin/FraudShield";
import { AuditDialog } from "@/components/admin/AuditDialog";
import { LiveTerminal } from "@/components/admin/LiveTerminal";

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
    refetchInterval: 10000 
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

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, balance }: { userId: number, balance: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <AdminStats 
          stats={adminStats || { totalUsers: 0, activeCampaigns: 0, totalExecutions: 0, totalRewardsPaid: 0, blockedUsers: 0 }} 
          campaignsCount={campaigns?.length || 0} 
        />

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
                  onUpdateBalance={(userId, balance) => updateBalanceMutation.mutate({ userId, balance })}
                  onUpdateReputation={(userId, reputationScore) => updateReputationMutation.mutate({ userId, reputationScore })}
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
                <CampaignTable 
                  campaigns={filteredCampaigns}
                  onAudit={(campaign) => setSelectedCampaign(campaign)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <SystemHealth health={systemHealth || { uptime: 0, memory: {}, cpu: {}, dbStatus: 'N/A', rpcStatus: 'N/A', errorLogs: [] }} />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudShield 
              users={users || []} 
              onUpdateBlockStatus={(userId, isBlocked) => updateBlockStatusMutation.mutate({ userId, isBlocked })}
            />
          </TabsContent>

          <TabsContent value="executions">
            <Card className="glass-card border-white/10 bg-white/[0.01] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl">Protocol Event Log</CardTitle>
                <CardDescription>Real-time audit trail of all task verifications and payouts.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ExecutionLogTable executions={filteredExecutions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <LiveTerminal 
              errorLogs={systemHealth?.errorLogs || []} 
              executions={executions || []} 
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