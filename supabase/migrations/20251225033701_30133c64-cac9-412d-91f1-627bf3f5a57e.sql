-- Create role enum for user access levels
CREATE TYPE public.app_role AS ENUM ('admin', 'player');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  player_tag TEXT, -- Clash Royale player tag (e.g., #ABC123)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'player',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create players table for Clash Royale player data
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_tag TEXT NOT NULL UNIQUE, -- Clash Royale player tag
  name TEXT NOT NULL,
  clan_role TEXT, -- leader, coLeader, elder, member
  trophies INTEGER DEFAULT 0,
  best_trophies INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  three_crown_wins INTEGER DEFAULT 0,
  donations INTEGER DEFAULT 0,
  donations_received INTEGER DEFAULT 0,
  war_day_wins INTEGER DEFAULT 0,
  clan_cards_collected INTEGER DEFAULT 0,
  favorite_card TEXT,
  current_deck JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for battle history
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  battle_time TIMESTAMP WITH TIME ZONE NOT NULL,
  battle_type TEXT NOT NULL, -- ladder, challenge, clanWar, etc.
  game_mode TEXT,
  deck_used JSONB,
  opponent_name TEXT,
  opponent_deck JSONB,
  opponent_trophies INTEGER,
  crowns INTEGER DEFAULT 0,
  opponent_crowns INTEGER DEFAULT 0,
  result TEXT NOT NULL, -- win, loss, draw
  trophy_change INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create war_seasons table for clan war tracking
CREATE TABLE public.war_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create war_participation table for tracking player participation in wars
CREATE TABLE public.war_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_season_id UUID NOT NULL REFERENCES public.war_seasons(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  fame_earned INTEGER DEFAULT 0,
  battles_played INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  boat_attacks INTEGER DEFAULT 0,
  decks_used JSONB,
  is_ready BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (war_season_id, player_id)
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL DEFAULT 'single_elimination', -- single_elimination, double_elimination, round_robin
  status TEXT NOT NULL DEFAULT 'draft', -- draft, registration, in_progress, completed
  max_participants INTEGER DEFAULT 32,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  rules JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  seed INTEGER,
  status TEXT NOT NULL DEFAULT 'registered', -- registered, active, eliminated, winner
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, player_id)
);

-- Create tournament_matches table
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES public.players(id),
  player2_id UUID REFERENCES public.players(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.players(id),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  played_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can modify, users can view their own)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.is_admin());

-- Players policies (everyone can view, admins can modify)
CREATE POLICY "Everyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert players" ON public.players
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update players" ON public.players
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete players" ON public.players
  FOR DELETE USING (public.is_admin());

-- Matches policies
CREATE POLICY "Everyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin());

-- War seasons policies
CREATE POLICY "Everyone can view war seasons" ON public.war_seasons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage war seasons" ON public.war_seasons
  FOR ALL USING (public.is_admin());

-- War participation policies
CREATE POLICY "Everyone can view war participation" ON public.war_participation
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage war participation" ON public.war_participation
  FOR ALL USING (public.is_admin());

-- Tournaments policies
CREATE POLICY "Everyone can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL USING (public.is_admin());

-- Tournament participants policies
CREATE POLICY "Everyone can view tournament participants" ON public.tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournament participants" ON public.tournament_participants
  FOR ALL USING (public.is_admin());

-- Tournament matches policies
CREATE POLICY "Everyone can view tournament matches" ON public.tournament_matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournament matches" ON public.tournament_matches
  FOR ALL USING (public.is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_war_participation_updated_at
  BEFORE UPDATE ON public.war_participation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  -- Auto-assign player role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'player');
  
  RETURN new;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for performance
CREATE INDEX idx_players_player_tag ON public.players(player_tag);
CREATE INDEX idx_matches_player_id ON public.matches(player_id);
CREATE INDEX idx_matches_battle_time ON public.matches(battle_time DESC);
CREATE INDEX idx_war_participation_season ON public.war_participation(war_season_id);
CREATE INDEX idx_tournament_matches_tournament ON public.tournament_matches(tournament_id);