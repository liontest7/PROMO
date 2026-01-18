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

  const COLORS = ['#22c55e', '#16a34a', '#15803d', '#14532d', '#166534'];
  const distributionData = analytics?.distribution && analytics.distribution.some((d: any) => d.value > 0) 
    ? analytics.distribution 
    : [
        { name: 'Twitter', value: 0 },
        { name: 'Telegram', value: 0 },
        { name: 'Website', value: 0 }
      ];

  const stats = analytics.stats || {};
  const trend = analytics.trend || [];
  const engagements = analytics.engagements || {};
  const growth = analytics.growth || {};
  const treasury = analytics.treasury || {};
  const payouts = analytics.payouts || {};

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase font-black tracking-[0.2em] text-primary/80">Volume</CardDescription>
            <CardTitle className="text-4xl font-display font-black text-white italic tracking-tighter">
              {(payouts?.totalRewards || stats?.totalRewardsPaid || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-white/70 font-black uppercase tracking-widest">
              <TrendingUp className="w-4 h-4 text-primary" />
              Total $DROPY Distributed
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase font-black tracking-[0.2em] text-primary/80">Engagement</CardDescription>
            <CardTitle className="text-4xl font-display font-black text-white italic tracking-tighter">
              {(engagements?.totalExecutions || stats?.totalExecutions || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-white/70 font-black uppercase tracking-widest">
              <Target className="w-4 h-4 text-primary" />
              Verified Actions
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase font-black tracking-[0.2em] text-primary/80">Reach</CardDescription>
            <CardTitle className="text-4xl font-display font-black text-white italic tracking-tighter">
              {(growth?.totalUsers || stats?.totalUsers || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-white/70 font-black uppercase tracking-widest">
              <Users className="w-4 h-4 text-primary" />
              Unique Wallets
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase font-black tracking-[0.2em] text-primary/80">Treasury</CardDescription>
            <CardTitle className="text-4xl font-display font-black text-white italic tracking-tighter">
              {(treasury?.totalBurned || stats?.totalBurned || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-white/70 font-black uppercase tracking-widest">
              <Coins className="w-4 h-4 text-primary" />
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
            <CardDescription className="text-white">Daily user registrations (Last 30 days)</CardDescription>
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
                    if (!val) return "";
                    try {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    } catch (e) {
                      return val;
                    }
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
            <CardTitle className="text-white uppercase font-black text-lg tracking-widest">Action Distribution</CardTitle>
            <CardDescription className="text-white/60 font-bold">Verifications by type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] relative">
            {distributionData.every((d: any) => d.value === 0) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20 italic">No verification data yet</p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {distributionData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={distributionData.every((d: any) => d.value === 0) ? '#1f2937' : COLORS[index % COLORS.length]} />
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
