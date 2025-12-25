import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { TrophyProgressChart } from '@/components/charts/TrophyProgressChart';
import { WinRateChart } from '@/components/charts/WinRateChart';
import { useTeamStats, usePlayerStats } from '@/hooks/usePlayerStats';
import { 
  Trophy, Users, TrendingUp, Target, Gift, Crown, Shield, Swords
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { data: teamStats, isLoading } = useTeamStats();
  const { data: players } = usePlayerStats();

  // Generate mock trophy progression (would be real data in production)
  const trophyProgressData = [
    { date: 'Nov 1', trophies: 52000 },
    { date: 'Nov 8', trophies: 53500 },
    { date: 'Nov 15', trophies: 54200 },
    { date: 'Nov 22', trophies: 55100 },
    { date: 'Nov 29', trophies: 56300 },
    { date: 'Dec 6', trophies: 57000 },
    { date: 'Dec 13', trophies: 58200 },
    { date: 'Dec 20', trophies: teamStats?.totalTrophies ?? 59000 },
  ];

  // Top donators
  const topDonators = players
    ?.sort((a, b) => (b.donations ?? 0) - (a.donations ?? 0))
    ?.slice(0, 5) ?? [];

  // Role distribution
  const roleDistribution = players?.reduce((acc, player) => {
    const role = player.clan_role || 'member';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const roleChartData = Object.entries(roleDistribution).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count,
  }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gradient mb-2">
          Team Analytics
        </h1>
        <p className="text-muted-foreground">
          Comprehensive clan performance metrics and insights.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Players"
              value={teamStats?.totalPlayers ?? 0}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Combined Trophies"
              value={teamStats?.totalTrophies?.toLocaleString() ?? '0'}
              subtitle={`Avg: ${teamStats?.avgTrophies?.toLocaleString()}`}
              icon={Trophy}
              variant="gold"
            />
            <StatCard
              title="Overall Win Rate"
              value={`${teamStats?.winRate ?? 0}%`}
              subtitle={`${teamStats?.totalWins?.toLocaleString()} wins`}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Donations"
              value={teamStats?.totalDonations?.toLocaleString() ?? '0'}
              icon={Gift}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Trophy Progression */}
        <TrophyProgressChart data={trophyProgressData} />

        {/* Overall Win Rate */}
        {teamStats && teamStats.totalWins > 0 && (
          <WinRateChart 
            wins={teamStats.totalWins} 
            losses={teamStats.totalLosses}
          />
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Role Distribution */}
        <div className="stat-card">
          <h3 className="font-display font-bold text-lg mb-4">Role Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} layout="vertical">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(240, 15%, 20%)" 
                  horizontal={false}
                />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontFamily: 'Rajdhani' }}
                />
                <YAxis 
                  type="category"
                  dataKey="role"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12, fontFamily: 'Rajdhani' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240, 20%, 9%)',
                    border: '1px solid hsl(240, 15%, 20%)',
                    borderRadius: '8px',
                    fontFamily: 'Rajdhani',
                  }}
                  formatter={(value: number) => [value, 'Players']}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(217, 91%, 60%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Donators */}
        <div className="stat-card">
          <h3 className="font-display font-bold text-lg mb-4">Top Donators</h3>
          
          {topDonators.length > 0 ? (
            <div className="space-y-3">
              {topDonators.map((player, index) => (
                <div 
                  key={player.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-lg font-display font-bold text-sm
                    ${index === 0 ? 'bg-gradient-gold text-accent-foreground' :
                      index === 1 ? 'bg-slate-400 text-slate-900' :
                      index === 2 ? 'bg-amber-700 text-amber-100' :
                      'bg-muted text-muted-foreground'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.player_tag}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <Gift className="h-4 w-4" />
                    <span className="font-display font-bold">
                      {player.donations?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No donation data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-bold text-lg mb-4">Performance Insights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-5 w-5 text-accent" />
              <span className="font-medium">Highest Trophies</span>
            </div>
            <p className="text-2xl font-display font-bold trophy-shimmer">
              {Math.max(...(players?.map(p => p.trophies ?? 0) ?? [0])).toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-success" />
              <span className="font-medium">Most Wins</span>
            </div>
            <p className="text-2xl font-display font-bold text-success">
              {Math.max(...(players?.map(p => p.wins ?? 0) ?? [0])).toLocaleString()}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Most War Wins</span>
            </div>
            <p className="text-2xl font-display font-bold text-primary">
              {Math.max(...(players?.map(p => p.war_day_wins ?? 0) ?? [0])).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
