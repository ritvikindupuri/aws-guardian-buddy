
-- Stored AWS credentials for autonomous Guardian scheduling
-- Encrypted at rest via Supabase's pgcrypto; the encryption key is the service role key hash
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.stored_aws_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Default',
  region text NOT NULL DEFAULT 'us-east-1',
  encrypted_access_key_id text NOT NULL,
  encrypted_secret_access_key text NOT NULL,
  encrypted_session_token text,
  credential_method text NOT NULL DEFAULT 'access_key' CHECK (credential_method IN ('access_key', 'assume_role')),
  role_arn text,
  account_id text,
  notification_email text,
  guardian_enabled boolean NOT NULL DEFAULT true,
  scan_mode text NOT NULL DEFAULT 'all' CHECK (scan_mode IN ('all', 'cost', 'drift')),
  last_scan_at timestamptz,
  last_scan_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, label)
);

ALTER TABLE public.stored_aws_credentials ENABLE ROW LEVEL SECURITY;

-- Users can manage their own stored credentials
CREATE POLICY "Users can view own stored credentials"
  ON public.stored_aws_credentials FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stored credentials"
  ON public.stored_aws_credentials FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stored credentials"
  ON public.stored_aws_credentials FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stored credentials"
  ON public.stored_aws_credentials FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Service role needs full access for guardian-scheduler
CREATE POLICY "Service role full access on stored_aws_credentials"
  ON public.stored_aws_credentials FOR ALL TO service_role
  USING (true) WITH CHECK (true);
