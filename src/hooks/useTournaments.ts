import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useTournamentById(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return null;
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });
}

export function useTournamentParticipants(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-participants', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          players (
            id,
            name,
            player_tag,
            trophies
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('seed', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });
}

export function useTournamentMatches(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          player1:players!tournament_matches_player1_id_fkey (
            id,
            name,
            player_tag
          ),
          player2:players!tournament_matches_player2_id_fkey (
            id,
            name,
            player_tag
          ),
          winner:players!tournament_matches_winner_id_fkey (
            id,
            name
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });
}
