import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Activity, Users, Megaphone, CheckCircle2, TrendingUp, Zap } from "lucide-react";

export function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery<{
    stats: {
      totalUsers: number;
      totalCampaigns: number;
      totalExecutions: number;
      activeCampaigns: number;
      taskVerified: number;
      conversionRate: string;
    };
    trend: { date: string; count: number }[];
  }>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    );
  }

  const { stats, trend } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-400" /> Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <Megaphone className="w-3 h-3 text-primary" /> Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display">{stats.totalCampaigns}</div>
            <p className="text-[9px] text-green-400 mt-1 uppercase font-bold">{stats.activeCampaigns} Active Now</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-400" /> Task Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display">{stats.taskVerified.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.01]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-400" /> Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display">
              {stats.conversionRate}x
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold">Tasks per user</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 bg-primary/5 hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
              <Zap className="w-3 h-3" /> Growth Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black font-display text-primary">
              {((stats.taskVerified / (stats.totalUsers || 1)) * 100).toFixed(0)}%
            </div>
            <p className="text-[9px] text-primary/70 mt-1 uppercase font-bold">Engagement Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-white/[0.01] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Protocol Activity</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Verified tasks (7 Day Trend)</p>
          </div>
          <Activity className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff20" 
                fontSize={10} 
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis stroke="#ffffff20" fontSize={10} />
              <Tooltip 
                contentStyle={ { backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' } }
                itemStyle={ { color: '#22c55e', fontWeight: 'bold' } }
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#22c55e" 
                strokeWidth={3} 
                dot={ { fill: '#22c55e', strokeWidth: 2, r: 4 } } 
                activeDot={ { r: 6, strokeWidth: 0 } }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
