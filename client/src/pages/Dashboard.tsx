import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockChartData = [
  { name: 'Mon', earnings: 400 },
  { name: 'Tue', earnings: 300 },
  { name: 'Wed', earnings: 600 },
  { name: 'Thu', earnings: 200 },
  { name: 'Fri', earnings: 900 },
  { name: 'Sat', earnings: 1100 },
  { name: 'Sun', earnings: 800 },
];

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const { data: stats, isLoading } = useUserStats(walletAddress);

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
        <h1 className="text-3xl font-display font-bold mb-8">User Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.totalEarned || "0.00"} SOL</div>
              <p className="text-xs text-muted-foreground mt-1">+12.5% from last week</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stats?.tasksCompleted || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across 12 campaigns</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
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
          <Card className="col-span-1 lg:col-span-2 glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Earnings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
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

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">Completed "Follow on Twitter"</p>
                      <p className="text-xs text-muted-foreground">Bonk Airdrop Campaign • 2h ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
