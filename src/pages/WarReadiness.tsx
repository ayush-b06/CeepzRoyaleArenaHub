import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { useActiveWarSeason, useWarParticipation, useWarReadinessStats } from '@/hooks/useWarReadiness';
import { 
  Shield, Target, Trophy, Users, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function WarReadiness() {
  const { data: activeSeason, isLoading: seasonLoading } = useActiveWarSeason();
  const { data: participation, isLoading: participationLoading } = useWarParticipation(activeSeason?.id);
  const { data: stats } = useWarReadinessStats(activeSeason?.id);

  const isLoading = seasonLoading || participationLoading;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-bold text-gradient">
            War Readiness
          </h1>
          {activeSeason && (
            <Badge variant="outline" className="text-success border-success">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-success animate-pulse" />
              Active War
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Track clan war participation, deck preparation, and battle performance.
        </p>
      </div>

      {/* Active Season Banner */}
      {activeSeason && (
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current War Season</p>
              <h2 className="font-display text-2xl font-bold text-accent">
                {activeSeason.season_name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Started: {new Date(activeSeason.start_date).toLocaleDateString()}
              </p>
            </div>
            
            {stats && (
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-gradient">
                    {stats.readinessRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Readiness</p>
                </div>
                <div className="h-16 w-px bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-display font-bold text-accent">
                    {stats.readyCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Ready Players</p>
                </div>
              </div>
            )}
          </div>
          
          {stats && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Team Readiness</span>
                <span className="font-medium">{stats.readyCount}/{stats.totalParticipants}</span>
              </div>
              <Progress value={stats.readinessRate} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Participants"
              value={stats.totalParticipants}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Total Fame"
              value={stats.totalFame.toLocaleString()}
              icon={Trophy}
              variant="gold"
            />
            <StatCard
              title="Battles Played"
              value={stats.totalBattles}
              icon={Target}
              variant="default"
            />
            <StatCard
              title="Battle Win Rate"
              value={`${stats.winRate}%`}
              icon={Shield}
              variant={stats.winRate >= 50 ? 'success' : 'destructive'}
            />
          </>
        ) : (
          <div className="col-span-4 stat-card text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active war season</p>
          </div>
        )}
      </div>

      {/* Participants Table */}
      <div className="stat-card">
        <h3 className="font-display font-bold text-lg mb-4">War Participants</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : participation && participation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Player</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Fame</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Battles</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Win Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Boat Attacks</th>
                </tr>
              </thead>
              <tbody>
                {participation.map((p) => {
                  const winRate = p.battles_played && p.battles_played > 0
                    ? Math.round((p.battles_won ?? 0) / p.battles_played * 100)
                    : 0;
                  
                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{p.players?.name}</p>
                          <p className="text-xs text-muted-foreground">{p.players?.player_tag}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.is_ready ? (
                          <Badge className="bg-success/20 text-success border-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-warning border-warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-display font-bold trophy-shimmer">
                          {p.fame_earned?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-display font-bold">
                          {p.battles_won ?? 0}/{p.battles_played ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn(
                          'font-display font-bold',
                          winRate >= 50 ? 'text-success' : 'text-destructive'
                        )}>
                          {winRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-display font-bold text-primary">
                          {p.boat_attacks ?? 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No participants in this war season</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
