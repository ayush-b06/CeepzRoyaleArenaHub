import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTournamentById, useTournamentParticipants, useTournamentMatches } from '@/hooks/useTournaments';
import { 
  Swords, Trophy, Users, Calendar, ArrowLeft, Clock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, isLoading } = useTournamentById(id);
  const { data: participants } = useTournamentParticipants(id);
  const { data: matches } = useTournamentMatches(id);

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    registration: 'bg-primary/20 text-primary border-primary',
    in_progress: 'bg-success/20 text-success border-success',
    completed: 'bg-accent/20 text-accent border-accent',
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-48 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </DashboardLayout>
    );
  }

  if (!tournament) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="font-display text-2xl font-bold mb-4">Tournament Not Found</h2>
          <Link to="/tournaments">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tournaments
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Group matches by round
  const matchesByRound = matches?.reduce((acc, match) => {
    const round = match.round;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>) ?? {};

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <DashboardLayout>
      {/* Back button */}
      <Link to="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Link>

      {/* Tournament Header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
              <Swords className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl font-bold">{tournament.name}</h1>
                <Badge variant="outline" className={cn(statusColors[tournament.status])}>
                  {tournament.status === 'in_progress' && (
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                  )}
                  {tournament.status}
                </Badge>
              </div>
              {tournament.description && (
                <p className="text-muted-foreground">{tournament.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{participants?.length ?? 0}/{tournament.max_participants}</span>
            </div>
            {tournament.start_date && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(tournament.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted capitalize">
              {tournament.tournament_type?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bracket / Matches */}
        <div className="lg:col-span-2">
          <div className="stat-card">
            <h3 className="font-display font-bold text-lg mb-4">Bracket</h3>
            
            {rounds.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-8 min-w-max pb-4">
                  {rounds.map((round) => (
                    <div key={round} className="w-64">
                      <h4 className="font-display font-bold text-sm text-muted-foreground mb-3">
                        Round {round}
                      </h4>
                      <div className="space-y-3">
                        {matchesByRound[round]?.map((match) => (
                          <div 
                            key={match.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              match.status === 'completed' ? 'border-border bg-muted/30' :
                              match.status === 'in_progress' ? 'border-primary bg-primary/10' :
                              'border-border'
                            )}
                          >
                            <div className="space-y-2">
                              {/* Player 1 */}
                              <div className={cn(
                                'flex items-center justify-between p-2 rounded',
                                match.winner_id === match.player1_id && 'bg-success/20'
                              )}>
                                <span className="font-medium truncate">
                                  {match.player1?.name || 'TBD'}
                                </span>
                                <span className="font-display font-bold">
                                  {match.player1_score}
                                </span>
                              </div>
                              
                              {/* VS divider */}
                              <div className="text-center text-xs text-muted-foreground">vs</div>
                              
                              {/* Player 2 */}
                              <div className={cn(
                                'flex items-center justify-between p-2 rounded',
                                match.winner_id === match.player2_id && 'bg-success/20'
                              )}>
                                <span className="font-medium truncate">
                                  {match.player2?.name || 'TBD'}
                                </span>
                                <span className="font-display font-bold">
                                  {match.player2_score}
                                </span>
                              </div>
                            </div>

                            {match.scheduled_time && (
                              <div className="mt-2 pt-2 border-t border-border flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(match.scheduled_time), 'MMM d, h:mm a')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Swords className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No matches scheduled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="stat-card h-fit">
          <h3 className="font-display font-bold text-lg mb-4">Participants</h3>
          
          {participants && participants.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((p) => (
                <div 
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg',
                    p.status === 'winner' ? 'bg-accent/20' :
                    p.status === 'eliminated' ? 'bg-destructive/10 opacity-60' :
                    'bg-muted/50'
                  )}
                >
                  {p.seed && (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-display font-bold">
                      {p.seed}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.players?.name}</p>
                    <p className="text-xs text-muted-foreground">{p.players?.player_tag}</p>
                  </div>
                  {p.status === 'winner' && (
                    <Trophy className="h-4 w-4 text-accent" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No participants yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
