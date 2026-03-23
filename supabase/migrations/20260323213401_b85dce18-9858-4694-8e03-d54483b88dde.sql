
CREATE TABLE public.agent_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id text,
  aws_service text NOT NULL,
  aws_operation text NOT NULL,
  aws_region text NOT NULL,
  params_hash text,
  status text NOT NULL DEFAULT 'success',
  error_code text,
  error_message text,
  validator_result text DEFAULT 'allowed',
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.agent_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
  ON public.agent_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX idx_audit_log_user_id ON public.agent_audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.agent_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_service_op ON public.agent_audit_log(aws_service, aws_operation);

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_audit_log;
