export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          battle_time: string
          battle_type: string
          created_at: string
          crowns: number | null
          deck_used: Json | null
          game_mode: string | null
          id: string
          opponent_crowns: number | null
          opponent_deck: Json | null
          opponent_name: string | null
          opponent_trophies: number | null
          player_id: string
          result: string
          trophy_change: number | null
        }
        Insert: {
          battle_time: string
          battle_type: string
          created_at?: string
          crowns?: number | null
          deck_used?: Json | null
          game_mode?: string | null
          id?: string
          opponent_crowns?: number | null
          opponent_deck?: Json | null
          opponent_name?: string | null
          opponent_trophies?: number | null
          player_id: string
          result: string
          trophy_change?: number | null
        }
        Update: {
          battle_time?: string
          battle_type?: string
          created_at?: string
          crowns?: number | null
          deck_used?: Json | null
          game_mode?: string | null
          id?: string
          opponent_crowns?: number | null
          opponent_deck?: Json | null
          opponent_name?: string | null
          opponent_trophies?: number | null
          player_id?: string
          result?: string
          trophy_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          best_trophies: number | null
          clan_cards_collected: number | null
          clan_role: string | null
          created_at: string
          current_deck: Json | null
          donations: number | null
          donations_received: number | null
          favorite_card: string | null
          id: string
          last_synced_at: string | null
          level: number | null
          losses: number | null
          name: string
          player_tag: string
          three_crown_wins: number | null
          trophies: number | null
          updated_at: string
          war_day_wins: number | null
          wins: number | null
        }
        Insert: {
          best_trophies?: number | null
          clan_cards_collected?: number | null
          clan_role?: string | null
          created_at?: string
          current_deck?: Json | null
          donations?: number | null
          donations_received?: number | null
          favorite_card?: string | null
          id?: string
          last_synced_at?: string | null
          level?: number | null
          losses?: number | null
          name: string
          player_tag: string
          three_crown_wins?: number | null
          trophies?: number | null
          updated_at?: string
          war_day_wins?: number | null
          wins?: number | null
        }
        Update: {
          best_trophies?: number | null
          clan_cards_collected?: number | null
          clan_role?: string | null
          created_at?: string
          current_deck?: Json | null
          donations?: number | null
          donations_received?: number | null
          favorite_card?: string | null
          id?: string
          last_synced_at?: string | null
          level?: number | null
          losses?: number | null
          name?: string
          player_tag?: string
          three_crown_wins?: number | null
          trophies?: number | null
          updated_at?: string
          war_day_wins?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          player_tag: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          player_tag?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          player_tag?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          created_at: string
          id: string
          match_number: number
          played_at: string | null
          player1_id: string | null
          player1_score: number | null
          player2_id: string | null
          player2_score: number | null
          round: number
          scheduled_time: string | null
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_number: number
          played_at?: string | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          round: number
          scheduled_time?: string | null
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_number?: number
          played_at?: string | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          round?: number
          scheduled_time?: string | null
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          id: string
          player_id: string
          seed: number | null
          status: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          seed?: number | null
          status?: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          seed?: number | null
          status?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          name: string
          rules: Json | null
          start_date: string | null
          status: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name: string
          rules?: Json | null
          start_date?: string | null
          status?: string
          tournament_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name?: string
          rules?: Json | null
          start_date?: string | null
          status?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      war_participation: {
        Row: {
          battles_played: number | null
          battles_won: number | null
          boat_attacks: number | null
          created_at: string
          decks_used: Json | null
          fame_earned: number | null
          id: string
          is_ready: boolean | null
          notes: string | null
          player_id: string
          updated_at: string
          war_season_id: string
        }
        Insert: {
          battles_played?: number | null
          battles_won?: number | null
          boat_attacks?: number | null
          created_at?: string
          decks_used?: Json | null
          fame_earned?: number | null
          id?: string
          is_ready?: boolean | null
          notes?: string | null
          player_id: string
          updated_at?: string
          war_season_id: string
        }
        Update: {
          battles_played?: number | null
          battles_won?: number | null
          boat_attacks?: number | null
          created_at?: string
          decks_used?: Json | null
          fame_earned?: number | null
          id?: string
          is_ready?: boolean | null
          notes?: string | null
          player_id?: string
          updated_at?: string
          war_season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "war_participation_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "war_participation_war_season_id_fkey"
            columns: ["war_season_id"]
            isOneToOne: false
            referencedRelation: "war_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      war_seasons: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          season_name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          season_name: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          season_name?: string
          start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "player"],
    },
  },
} as const
