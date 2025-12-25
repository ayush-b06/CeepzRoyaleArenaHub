import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { PlayerCard } from '@/components/players/PlayerCard';
import { WinRateChart } from '@/components/charts/WinRateChart';
import { useTeamStats } from '@/hooks/usePlayerStats';
import { useActiveWarSeason, useWarReadinessStats } from '@/hooks/useWarReadiness';
import { useTournaments } from '@/hooks/useTournaments';
import { Users, Trophy, Swords, Shield, TrendingUp, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { data: teamStats, isLoading: teamLoading } = useTeamStats();
  const { data: activeSeason } = useActiveWarSeason();
  const { data: warStats } = useWarReadinessStats(activeSeason?.id);
  const { data: tournaments } = useTournaments();

  const activeTournaments = tournaments?.filter(t => t.status === 'in_progress' || t.status === 'registration') || [];
  const topPlayers = teamStats?.players?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gradient mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to CeepzRoyale ArenaHub — your clan's performance at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {teamLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Players"
              value={teamStats?.totalPlayers ?? 0}
              subtitle="Active clan members"
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Clan Trophies"
              value={teamStats?.totalTrophies?.toLocaleString() ?? '0'}
              subtitle={`Avg: ${teamStats?.avgTrophies?.toLocaleString() ?? 0}`}
              icon={Trophy}
              variant="gold"
            />
            <StatCard
              title="Win Rate"
              value={`${teamStats?.winRate ?? 0}%`}
              subtitle={`${teamStats?.totalWins?.toLocaleString() ?? 0} wins`}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Donations"
              value={teamStats?.totalDonations?.toLocaleString() ?? '0'}
              subtitle="Cards shared"
              icon={Gift}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Top Players & War Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* War Readiness Banner */}
          {warStats && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">War Readiness</h2>
                    <p className="text-sm text-muted-foreground">{activeSeason?.season_name}</p>
                  </div>
                </div>
                <Link to="/war">
                  <Button variant="ghost" size="sm">
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-gradient">
                    {warStats.readinessRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-accent">
                    {warStats.readyCount}/{warStats.totalParticipants}
                  </p>
                  <p className="text-xs text-muted-foreground">Players</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-success">
                    {warStats.winRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold trophy-shimmer">
                    {warStats.totalFame?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Fame</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Players */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">Top Players</h2>
              <Link to="/players">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <PlayerCard key={player.id} player={player} rank={index + 1} />
                ))
              ) : (
                <div className="stat-card text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No players yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add players via the Admin panel to see stats here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Win Rate & Tournaments */}
        <div className="space-y-6">
          {/* Win Rate Chart */}
          {teamStats && teamStats.totalWins > 0 && (
            <WinRateChart 
              wins={teamStats.totalWins} 
              losses={teamStats.totalLosses} 
            />
          )}

          {/* Active Tournaments */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Tournaments</h3>
              <Link to="/tournaments">
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {activeTournaments.length > 0 ? (
              <div className="space-y-3">
                {activeTournaments.slice(0, 3).map((tournament) => (
                  <Link 
                    key={tournament.id} 
                    to={`/tournaments/${tournament.id}`}
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Swords className="h-5 w-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tournament.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {tournament.status}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Swords className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No active tournaments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
