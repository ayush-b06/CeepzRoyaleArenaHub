import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTournaments } from '@/hooks/useTournaments';
import { 
  Swords, Trophy, Users, Calendar, ChevronRight, Plus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function Tournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const { isAdmin } = useAuth();

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    registration: 'bg-primary/20 text-primary border-primary',
    in_progress: 'bg-success/20 text-success border-success',
    completed: 'bg-accent/20 text-accent border-accent',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    registration: 'Open',
    in_progress: 'Live',
    completed: 'Finished',
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient mb-2">
            Tournaments
          </h1>
          <p className="text-muted-foreground">
            Manage brackets, schedules, and track standings.
          </p>
        </div>
        {isAdmin && (
          <Link to="/admin">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Button>
          </Link>
        )}
      </div>

      {/* Tournament Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Link 
              key={tournament.id} 
              to={`/tournaments/${tournament.id}`}
              className="block"
            >
              <div className="stat-card group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <Swords className="h-6 w-6 text-primary" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(statusColors[tournament.status])}
                  >
                    {tournament.status === 'in_progress' && (
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                    )}
                    {statusLabels[tournament.status] || tournament.status}
                  </Badge>
                </div>

                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {tournament.name}
                </h3>
                
                {tournament.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tournament.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{tournament.max_participants} max</span>
                  </div>
                  {tournament.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(tournament.start_date), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">
                    {tournament.tournament_type?.replace('_', ' ')}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="stat-card text-center py-16">
          <Swords className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-bold text-xl mb-2">No Tournaments Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first tournament to start tracking brackets and standings.
          </p>
          {isAdmin && (
            <Link to="/admin">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Create Tournament
              </Button>
            </Link>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
