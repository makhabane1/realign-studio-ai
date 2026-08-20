CREATE TABLE public.agents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  brokerage TEXT NOT NULL DEFAULT '',
  tone_tags TEXT[] NOT NULL DEFAULT '{}',
  buyer_type TEXT NOT NULL DEFAULT '',
  visual_style TEXT NOT NULL DEFAULT 'Minimal',
  brand_colors TEXT[] NOT NULL DEFAULT ARRAY['#12233F','#C4653A'],
  plan TEXT NOT NULL DEFAULT 'free',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage own profile" ON public.agents FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  property_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  social_caption TEXT,
  follow_up_email TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX listings_agent_created_idx ON public.listings (agent_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage own listings" ON public.listings FOR ALL TO authenticated USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.agents (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Agents read own listing images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Agents upload own listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);