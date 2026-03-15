import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import QuickActions from "@/components/QuickActions";
import AwsCredentialsPanel, { type AwsCredentials } from "@/components/AwsCredentialsPanel";
import { useChat } from "@/hooks/useChat";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [credentials, setCredentials] = useState<AwsCredentials | null>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !credentials) return;
    setInput("");
    sendMessage(trimmed, credentials);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-green-subtle">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground font-mono">CloudSec Agent</h1>
            <p className="text-xs text-muted-foreground">AI-powered AWS security operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 space-y-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto glow-green">
                <Terminal className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-mono">CloudSec Agent</h2>
              <p className="text-muted-foreground max-w-md">
                Your AI security operations assistant. Configure AWS credentials below, then ask questions or run security assessments.
              </p>
            </motion.div>

            <div className="w-full max-w-lg">
              <AwsCredentialsPanel credentials={credentials} onSave={setCredentials} />
            </div>

            {credentials && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <p className="text-xs text-muted-foreground font-mono mb-3 text-center">QUICK ACTIONS</p>
                <QuickActions onAction={(prompt) => sendMessage(prompt, credentials)} disabled={isLoading} />
              </motion.div>
            )}
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Credentials bar when in chat */}
      {messages.length > 0 && (
        <div className="px-4 pt-2">
          <AwsCredentialsPanel credentials={credentials} onSave={setCredentials} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={credentials ? "Ask about your AWS security posture..." : "Configure AWS credentials first..."}
              disabled={!credentials || isLoading}
              rows={1}
              className="w-full resize-none rounded-lg bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50 font-sans"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <Button
            variant="terminal"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || !credentials || isLoading}
            className="h-11 w-11 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
