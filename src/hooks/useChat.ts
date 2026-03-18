import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessageData, MessageRole, MessageStatus } from "@/components/ChatMessage";
import type { AwsCredentials } from "@/components/AwsCredentialsPanel";

export const useChat = (conversationId: string | null, notificationEmail?: string) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from DB when active conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    (supabase
      .from("messages" as any)
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }) as any)
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setMessages(
            data.map((m: any) => ({
              id: m.id,
              role: m.role as MessageRole,
              content: m.content,
              status: "complete" as MessageStatus,
              timestamp: new Date(m.created_at),
            }))
          );
        }
      });
  }, [conversationId]);

  const sendMessage = useCallback(
    async (
      content: string,
      credentials: AwsCredentials | null,
      convId?: string | null
    ) => {
      if (!credentials) return;

      const targetConvId = convId ?? conversationId;

      const userMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        status: "complete",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Persist user message immediately
      if (targetConvId) {
        (supabase
          .from("messages" as any)
          .insert({
            id: userMsg.id,
            conversation_id: targetConvId,
            role: "user",
            content,
          } as any) as any).then();
      }

      const assistantId = crypto.randomUUID();
      let assistantContent = "";

      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant" as const,
              content: assistantContent,
              status: "streaming" as const,
              timestamp: new Date(),
            },
          ];
        });
      };

      try {
        const historyForApi = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aws-agent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ messages: historyForApi, credentials, notificationEmail: notificationEmail || null }),
          }
        );

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${resp.status})`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (delta) upsertAssistant(delta);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, status: "complete" as const } : m
          )
        );

        // Persist completed assistant message
        if (targetConvId && assistantContent) {
          (supabase
            .from("messages" as any)
            .insert({
              id: assistantId,
              conversation_id: targetConvId,
              role: "assistant",
              content: assistantContent,
            } as any) as any).then();

          (supabase
            .from("conversations" as any)
            .update({ updated_at: new Date().toISOString() } as any)
            .eq("id", targetConvId) as any).then();
        }
      } catch (err: any) {
        const errorContent = `**Error:** ${err.message || "Something went wrong"}`;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id === assistantId) {
            return prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: errorContent, status: "error" as const }
                : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant" as const,
              content: errorContent,
              status: "error" as const,
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, conversationId, notificationEmail]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearMessages };
};
