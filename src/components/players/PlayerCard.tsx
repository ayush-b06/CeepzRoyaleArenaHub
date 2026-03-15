import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trophy, Target, Crown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    player_tag: string;
    clan_role?: string | null;
    trophies: number | null;
    best_trophies: number | null;
    level: number | null;
    wins: number | null;
    losses: number | null;
    war_day_wins: number | null;
    favorite_card?: string | null;
  };
  rank?: number;
}

export function PlayerCard({ player, rank }: PlayerCardProps) {
  const winRate = player.wins && player.losses 
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0;

  const roleColors: Record<string, string> = {
    leader: 'bg-accent text-accent-foreground',
    coLeader: 'bg-secondary text-secondary-foreground',
    elder: 'bg-primary text-primary-foreground',
    member: 'bg-muted text-muted-foreground',
  };

  const roleIcons: Record<string, typeof Crown> = {
    leader: Crown,
    coLeader: Shield,
    elder: Target,
    member: Trophy,
  };

  const RoleIcon = player.clan_role ? roleIcons[player.clan_role] || Trophy : Trophy;

  return (
    <Link to={`/players/${player.id}`} className="block">
      <div className="stat-card group cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          {rank && (
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg font-display font-bold text-lg',
              rank === 1 && 'bg-gradient-gold text-accent-foreground',
              rank === 2 && 'bg-slate-400 text-slate-900',
              rank === 3 && 'bg-amber-700 text-amber-100',
              rank > 3 && 'bg-muted text-muted-foreground'
            )}>
              {rank}
            </div>
          )}

          {/* Player info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-lg truncate group-hover:text-primary transition-colors">
                {player.name}
              </h3>
              {player.clan_role && (
                <Badge variant="secondary" className={cn('text-xs', roleColors[player.clan_role])}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {player.clan_role}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{player.player_tag}</p>
          </div>

          {/* Trophy count */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 trophy-shimmer">
              <Trophy className="h-5 w-5" />
              <span className="font-display font-bold text-xl">{player.trophies?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {player.best_trophies?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-display font-bold text-primary">{player.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Wins</p>
            <p className="font-display font-bold text-success">{player.wins?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className={cn(
              'font-display font-bold',
              winRate >= 50 ? 'text-success' : 'text-destructive'
            )}>
              {winRate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">War Wins</p>
            <p className="font-display font-bold text-accent">{player.war_day_wins}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
