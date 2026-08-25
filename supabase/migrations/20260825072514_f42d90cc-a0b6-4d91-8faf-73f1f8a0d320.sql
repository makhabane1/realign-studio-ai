CREATE TABLE public.market_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT '',
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  newsletter TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_updates TO authenticated;
GRANT ALL ON public.market_updates TO service_role;
ALTER TABLE public.market_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can manage their own market updates" ON public.market_updates FOR ALL TO authenticated USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_market_updates_updated_at BEFORE UPDATE ON public.market_updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();