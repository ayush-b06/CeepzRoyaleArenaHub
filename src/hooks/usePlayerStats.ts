import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePlayerStats() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('trophies', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePlayerById(playerId: string | undefined) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });
}

export function usePlayerMatches(playerId: string | undefined) {
  return useQuery({
    queryKey: ['player-matches', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('player_id', playerId)
        .order('battle_time', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!playerId,
  });
}

export function useTeamStats() {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: async () => {
      const { data: players, error } = await supabase
        .from('players')
        .select('*');
      
      if (error) throw error;
      
      // Calculate aggregate stats
      const totalPlayers = players?.length ?? 0;
      const totalTrophies = players?.reduce((sum, p) => sum + (p.trophies ?? 0), 0) ?? 0;
      const totalWins = players?.reduce((sum, p) => sum + (p.wins ?? 0), 0) ?? 0;
      const totalLosses = players?.reduce((sum, p) => sum + (p.losses ?? 0), 0) ?? 0;
      const totalDonations = players?.reduce((sum, p) => sum + (p.donations ?? 0), 0) ?? 0;
      const avgTrophies = totalPlayers > 0 ? Math.round(totalTrophies / totalPlayers) : 0;
      const winRate = totalWins + totalLosses > 0 
        ? Math.round((totalWins / (totalWins + totalLosses)) * 100) 
        : 0;

      return {
        totalPlayers,
        totalTrophies,
        avgTrophies,
        totalWins,
        totalLosses,
        winRate,
        totalDonations,
        players,
      };
    },
  });
}
