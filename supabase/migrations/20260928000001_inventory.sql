CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  item_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory."
  ON public.inventory_items FOR SELECT
  USING ( auth.uid() = profile_id );

CREATE POLICY "Users can insert their own inventory items."
  ON public.inventory_items FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );
