-- Create players/profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  near_wallet_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create Arenas table
CREATE TABLE public.arenas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'COMING_SOON')),
  player_capacity INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.arenas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Arenas are viewable by everyone."
  ON public.arenas FOR SELECT USING (true);

-- Insert initial arenas
INSERT INTO public.arenas (id, name, description, status, player_capacity, sort_order) VALUES
('near-launchpad', 'NEAR Launchpad', 'An abandoned magical launch facility built around a Rift. PvPvE.', 'ACTIVE', 12, 1),
('crimson-mines', 'Crimson Mines', 'Deep underground mines.', 'COMING_SOON', 12, 2),
('sunken-city', 'Sunken City', 'An ancient city submerged in water.', 'COMING_SOON', 12, 3),
('the-abyss', 'The Abyss', 'The darkest depths of the rift.', 'COMING_SOON', 12, 4);
