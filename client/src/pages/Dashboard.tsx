import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const { data: stats, isLoading } = useUserStats(walletAddress);
  
  const chartData = [
    { name: 'Total Earned', earnings: stats ? Number(stats.totalEarned) : 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-48 mb-8 bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">User Dashboard</h1>
            <p className="text-muted-foreground">Track your performance and earnings across all campaigns.</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Wallet</p>
            <p className="font-mono text-sm font-bold">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-6)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[11px] font-bold text-primary uppercase tracking-widest">Total Earnings</CardTitle>
              <div className="p-2 rounded-lg bg-primary/20">
                <Coins className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display tracking-tight">{stats?.totalEarned || "0.00"} SOL</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold py-0.5 px-1.5 rounded bg-primary/20 text-primary">+12.5%</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">vs last 7 days</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.tasksCompleted || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across multiple campaigns</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reputation Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.reputation || 100}</div>
              <p className="text-xs text-muted-foreground mt-1">Top 10% of users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 glass-card border-white/5 rounded-2xl bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Earnings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions && executions.length > 0 ? (
                  executions.slice(0, 5).map((execution: any) => (
                    <div key={execution.id} className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className={`w-2 h-2 mt-2 rounded-full ${execution.status === 'paid' ? 'bg-primary' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{execution.action?.title || 'Action Completed'}</p>
                        <p className="text-xs text-muted-foreground">
                          {execution.campaign?.title} • {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
