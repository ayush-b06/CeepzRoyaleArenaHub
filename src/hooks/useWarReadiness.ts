import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useWarSeasons() {
  return useQuery({
    queryKey: ['war-seasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('war_seasons')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveWarSeason() {
  return useQuery({
    queryKey: ['active-war-season'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('war_seasons')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useWarParticipation(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['war-participation', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      
      const { data, error } = await supabase
        .from('war_participation')
        .select(`
          *,
          players (
            id,
            name,
            player_tag,
            trophies,
            clan_role
          )
        `)
        .eq('war_season_id', seasonId)
        .order('fame_earned', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!seasonId,
  });
}

export function useWarReadinessStats(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['war-readiness-stats', seasonId],
    queryFn: async () => {
      if (!seasonId) return null;
      
      const { data, error } = await supabase
        .from('war_participation')
        .select('*')
        .eq('war_season_id', seasonId);
      
      if (error) throw error;
      
      const total = data?.length ?? 0;
      const ready = data?.filter(p => p.is_ready).length ?? 0;
      const totalFame = data?.reduce((sum, p) => sum + (p.fame_earned ?? 0), 0) ?? 0;
      const totalBattles = data?.reduce((sum, p) => sum + (p.battles_played ?? 0), 0) ?? 0;
      const totalWins = data?.reduce((sum, p) => sum + (p.battles_won ?? 0), 0) ?? 0;

      return {
        totalParticipants: total,
        readyCount: ready,
        readinessRate: total > 0 ? Math.round((ready / total) * 100) : 0,
        totalFame,
        totalBattles,
        winRate: totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0,
      };
    },
    enabled: !!seasonId,
  });
}
