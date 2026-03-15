-- CloudPilot AI — Chat History Schema
-- Run this in your Supabase SQL editor or via: supabase db push

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'New Conversation',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id   UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL,
  content           TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id   ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated   ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation   ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created        ON public.messages(created_at);

-- Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "users_own_conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only access messages in their own conversations
CREATE POLICY "users_own_messages"
  ON public.messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );
