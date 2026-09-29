CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('vanguard', 'rogue')),
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all characters for leaderboard."
  ON public.characters FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own character."
  ON public.characters FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );

CREATE POLICY "Users can update their own character."
  ON public.characters FOR UPDATE
  USING ( auth.uid() = profile_id );
