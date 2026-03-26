import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChatHistory = (user: User | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    setLoading(true);
    const { data } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("conversations" as any)
      .select("*")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .order("updated_at", { ascending: false }) as any);
    if (data) setConversations(data as Conversation[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (title: string): Promise<Conversation | null> => {
    if (!user) return null;
    const { data, error } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("conversations" as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ user_id: user.id, title } as any)
      .select()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as any);
    if (error) throw error;
    const conv = data as Conversation;
    setConversations((prev) => [conv, ...prev]);
    return conv;
  };

  const updateTitle = async (id: string, title: string) => {
    await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("conversations" as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ title, updated_at: new Date().toISOString() } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", id) as any);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  const deleteConversation = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("conversations" as any).delete().eq("id", id) as any);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAllHistory = async () => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("conversations" as any).delete().eq("user_id", user.id) as any);
    setConversations([]);
  };

  const touchConversation = (id: string) => {
    const now = new Date().toISOString();
    (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("conversations" as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ updated_at: now } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", id) as any).then();
    setConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, updated_at: now } : c));
      return [...updated].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  };

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    updateTitle,
    deleteConversation,
    clearAllHistory,
    touchConversation,
  };
};
