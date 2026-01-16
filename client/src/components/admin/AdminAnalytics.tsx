import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, Megaphone, CheckCircle2, TrendingUp, Zap, Target, Coins, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

export function AdminAnalytics() {
  const { walletAddress } = useWallet();

  const fetchAnalytics = async () => {
    const currentWallet = walletAddress || localStorage.getItem('walletAddress');
    const res = await fetch("/api/admin/analytics", {
      headers: {
        'x-wallet-address': currentWallet || '',
        'wallet-address': currentWallet || '',
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  };

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics"],
    queryFn: fetchAnalytics,
    enabled: !!(walletAddress || localStorage.getItem('walletAddress')),
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-background/50 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Processing Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ['#22c55e', '#16a34a', '#15803d', '#14532d'];
  const stats = analytics.stats || {};
  const trend = analytics.trend || [];
  const engagements = analytics.engagements || {};
  const growth = analytics.growth || {};
  const treasury = analytics.treasury || {};
  const payouts = analytics.payouts || {};

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Volume</CardDescription>
            <CardTitle className="text-2xl font-display font-black text-white italic">
              {(payouts?.totalRewards || stats?.totalRewardsPaid || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold uppercase">
              <TrendingUp className="w-3 h-3" />
              Total $DROPY Distributed
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Engagement</CardDescription>
            <CardTitle className="text-2xl font-display font-black text-white italic">
              {(engagements?.totalExecutions || stats?.totalExecutions || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold uppercase">
              <Target className="w-3 h-3" />
              Verified Actions
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Reach</CardDescription>
            <CardTitle className="text-2xl font-display font-black text-white italic">
              {(growth?.totalUsers || stats?.totalUsers || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold uppercase">
              <Users className="w-3 h-3" />
              Unique Wallets
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-primary">Treasury</CardDescription>
            <CardTitle className="text-2xl font-display font-black text-white italic">
              {(treasury?.totalBurned || 15000).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold uppercase">
              <Coins className="w-3 h-3" />
              Total $DROPY Burned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader>
            <CardTitle className="text-white uppercase font-black text-sm tracking-widest">Protocol Growth</CardTitle>
            <CardDescription className="text-white/50">Daily user registrations (Last 30 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth?.dailyTrend || trend}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickFormatter={(val) => {
                    if (!val || typeof val !== 'string') return val;
                    if (val.includes('-')) return val.split('-').slice(1).join('/');
                    return val;
                  }}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={growth?.dailyTrend ? "users" : (trend?.[0]?.count !== undefined ? "count" : "users")} 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGrowth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader>
            <CardTitle className="text-white uppercase font-black text-sm tracking-widest">Action Distribution</CardTitle>
            <CardDescription className="text-white/50">Verifications by type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagements?.actionBreakdown && engagements.actionBreakdown.length > 0 ? engagements.actionBreakdown : [
                    { type: 'Follow', count: 45 },
                    { type: 'Retweet', count: 25 },
                    { type: 'Website', count: 20 },
                    { type: 'Other', count: 10 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                >
                  {(engagements?.actionBreakdown && engagements.actionBreakdown.length > 0 ? engagements.actionBreakdown : [
                    { type: 'Follow', count: 45 },
                    { type: 'Retweet', count: 25 },
                    { type: 'Website', count: 20 },
                    { type: 'Other', count: 10 }
                  ]).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
