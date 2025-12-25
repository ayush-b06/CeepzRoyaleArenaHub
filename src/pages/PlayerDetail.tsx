import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/stats/StatCard';
import { WinRateChart } from '@/components/charts/WinRateChart';
import { usePlayerById, usePlayerMatches } from '@/hooks/usePlayerStats';
import { 
  Trophy, Target, Crown, Shield, Swords, Gift, 
  ArrowLeft, Star, Zap, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: player, isLoading } = usePlayerById(id);
  const { data: matches } = usePlayerMatches(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!player) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="font-display text-2xl font-bold mb-4">Player Not Found</h2>
          <Link to="/players">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const winRate = player.wins && player.losses 
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0;

  const roleColors: Record<string, string> = {
    leader: 'bg-accent text-accent-foreground',
    coLeader: 'bg-secondary text-secondary-foreground',
    elder: 'bg-primary text-primary-foreground',
    member: 'bg-muted text-muted-foreground',
  };

  return (
    <DashboardLayout>
      {/* Back button */}
      <Link to="/players" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Players
      </Link>

      {/* Player Header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-primary text-4xl font-display font-bold text-primary-foreground">
            {player.name[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold">{player.name}</h1>
              {player.clan_role && (
                <Badge className={cn('font-display', roleColors[player.clan_role])}>
                  {player.clan_role}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-4">{player.player_tag}</p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="font-display font-bold trophy-shimmer text-xl">
                  {player.trophies?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Best: {player.best_trophies?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Level {player.level}</span>
              </div>
              {player.last_synced_at && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {format(new Date(player.last_synced_at), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Wins"
          value={player.wins?.toLocaleString() ?? '0'}
          icon={Target}
          variant="success"
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${player.losses?.toLocaleString() ?? 0} losses`}
          icon={TrendingUp}
          variant={winRate >= 50 ? 'success' : 'destructive'}
        />
        <StatCard
          title="War Day Wins"
          value={player.war_day_wins?.toLocaleString() ?? '0'}
          icon={Shield}
          variant="gold"
        />
        <StatCard
          title="Donations"
          value={player.donations?.toLocaleString() ?? '0'}
          subtitle={`Received: ${player.donations_received?.toLocaleString() ?? 0}`}
          icon={Gift}
          variant="primary"
        />
      </div>

      {/* Charts and Match History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Win Rate Chart */}
        {player.wins && player.losses && (
          <WinRateChart wins={player.wins} losses={player.losses} />
        )}

        {/* Recent Matches */}
        <div className="stat-card">
          <h3 className="font-display font-bold text-lg mb-4">Recent Battles</h3>
          
          {matches && matches.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {matches.map((match) => (
                <div 
                  key={match.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    match.result === 'win' ? 'bg-success/10' : 
                    match.result === 'loss' ? 'bg-destructive/10' : 'bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                      match.result === 'win' ? 'bg-success text-success-foreground' :
                      match.result === 'loss' ? 'bg-destructive text-destructive-foreground' :
                      'bg-muted-foreground text-background'
                    )}>
                      {match.crowns}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{match.battle_type}</p>
                      <p className="text-xs text-muted-foreground">
                        vs {match.opponent_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-display font-bold',
                      match.trophy_change && match.trophy_change > 0 ? 'text-success' : 
                      match.trophy_change && match.trophy_change < 0 ? 'text-destructive' : ''
                    )}>
                      {match.trophy_change && match.trophy_change > 0 ? '+' : ''}
                      {match.trophy_change ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(match.battle_time), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Swords className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No battles recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Need to import TrendingUp
import { TrendingUp } from 'lucide-react';
