import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, PanelRightOpen, PanelRightClose, LogOut, History, Settings, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import QuickActions from "@/components/QuickActions";
import AwsCredentialsPanel, { type AwsCredentials } from "@/components/AwsCredentialsPanel";
import FindingsPanel, { type Finding } from "@/components/FindingsPanel";
import StatusBar from "@/components/StatusBar";
import ChatHistoryPanel from "@/components/ChatHistoryPanel";
import CloudPilotLogo from "@/components/CloudPilotLogo";
import NotificationSettings from "@/components/NotificationSettings";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { toast } from "sonner";

const ChatInterface = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [credentials, setCredentials] = useState<AwsCredentials | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [findings] = useState<Finding[]>([]);
  const [notificationEmail, setNotificationEmail] = useState<string>(() => {
    return localStorage.getItem("cloudpilot-notification-email") || "";
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user, signOut } = useAuth();
  const {
    conversations,
    loading: historyLoading,
    createConversation,
    deleteConversation,
    clearAllHistory,
  } = useChatHistory(user);

  const { messages, isLoading, sendMessage, clearMessages } = useChat(currentConvId, notificationEmail);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    setCurrentConvId(null);
    clearMessages();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConvId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (currentConvId === id) {
      setCurrentConvId(null);
      clearMessages();
    }
  };

  const handleClearAll = async () => {
    await clearAllHistory();
    setCurrentConvId(null);
    clearMessages();
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !credentials) return;
    setInput("");

    let convId = currentConvId;

    // Create a new conversation if none is active
    if (!convId && user) {
      const title = trimmed.length > 65 ? trimmed.slice(0, 65) + "…" : trimmed;
      try {
        const conv = await createConversation(title);
        convId = conv?.id ?? null;
        setCurrentConvId(convId);
      } catch {
        // If DB unavailable, continue without persistence
      }
    }

    sendMessage(trimmed, credentials, convId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
      }
    }, 0);
  };

  const handleSaveNotificationEmail = (email: string) => {
    setNotificationEmail(email);
    localStorage.setItem("cloudpilot-notification-email", email);
  };

  const handleAddToS3 = useCallback(async (content: string, messageId: string) => {
    if (!credentials?.session) {
      toast.error("AWS session credentials required. Please re-authenticate.");
      return;
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aws-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Archive the following report to the centralized S3 bucket (cloudpilot-reports-<account-id>). Create the bucket if it doesn't exist. Upload as markdown with key "reports/${new Date().toISOString().slice(0, 10)}/${messageId}.md". Only perform the S3 archival — do NOT regenerate the report. Respond with a brief confirmation of the S3 upload location.\n\n---\n\n${content}`,
              },
            ],
            credentials: credentials.session,
            notificationEmail: null,
          }),
        }
      );

      if (!resp.ok) throw new Error("S3 upload request failed");

      // Consume the stream but we don't need to display it
      const reader = resp.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      toast.success("Report archived to S3 bucket");
    } catch (err: any) {
      toast.error("Failed to archive report to S3: " + (err.message || "Unknown error"));
      throw err;
    }
  }, [credentials]);

  // Determine if we should show the thinking indicator
  const showThinking = isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user");

  const hasMessages = messages.length > 0;
  const userEmail = user?.email ?? "";
  const userLabel = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <CloudPilotLogo className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground tracking-tight">CloudPilot AI</h1>
              <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border tracking-wider">v1.0</span>
            </div>
            <p className="text-[10px] text-muted-foreground">AWS Cloud Security Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/reports")}
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Reports
          </Button>

          {userLabel && (
            <span className="hidden md:block text-[11px] text-muted-foreground px-2 font-mono">
              {userLabel}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-muted-foreground h-8 w-8"
          >
            {showSidebar ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 max-w-2xl mx-auto">
                <div className="text-center space-y-5 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto glow-primary">
                    <CloudPilotLogo className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">CloudPilot AI</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Real-time AWS security operations. Connect your credentials to audit, investigate, and remediate cloud infrastructure.
                    </p>
                  </div>
                </div>

                {!credentials && (
                  <div className="w-full max-w-sm mb-8">
                    <AwsCredentialsPanel credentials={credentials} onSave={setCredentials} />
                  </div>
                )}

                {credentials && (
                  <div className="w-full animate-fade-in-up">
                    <QuickActions onAction={handleQuickAction} disabled={isLoading} />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} onAddToS3={handleAddToS3} />
                ))}
                {showThinking && <ThinkingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-border bg-card/50">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={credentials ? "Ask about your AWS environment..." : "Connect AWS credentials to begin"}
                  disabled={!credentials || isLoading}
                  rows={1}
                  className="w-full resize-none rounded-lg bg-muted border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/15 disabled:opacity-40"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
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
                className="h-10 w-10 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <StatusBar
            isConnected={!!credentials}
            region={credentials?.region || "—"}
            messageCount={messages.length}
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-72 border-l border-border bg-card/30 overflow-y-auto scrollbar-thin p-3 space-y-3 hidden lg:flex lg:flex-col">

            {/* New Chat button */}
            <Button
              variant="action"
              size="sm"
              onClick={startNewChat}
              className="w-full flex items-center gap-2 justify-center border-primary/20 text-primary hover:bg-primary/10"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </Button>

            {/* Chat History */}
            <div className="border border-border rounded-lg bg-card p-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <History className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">History</p>
              </div>
              <ChatHistoryPanel
                conversations={conversations}
                currentConversationId={currentConvId}
                loading={historyLoading}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onClearAll={handleClearAll}
              />
            </div>

            {/* AWS Credentials */}
            <AwsCredentialsPanel credentials={credentials} onSave={setCredentials} compact />

            {/* Notification Email Settings */}
            <NotificationSettings email={notificationEmail} onSave={handleSaveNotificationEmail} />

            {/* Findings */}
            <FindingsPanel
              findings={findings}
              onClear={() => {}}
              onInvestigate={(f) =>
                handleQuickAction(`Investigate finding: ${f.title} on resource ${f.resource}`)
              }
            />

            {/* Quick Actions in sidebar */}
            {credentials && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2 px-1">QUICK ACTIONS</p>
                <QuickActions onAction={handleQuickAction} disabled={isLoading} />
              </div>
            )}

            {/* Capabilities */}
            <div className="border border-border rounded-lg bg-card p-3 space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">CAPABILITIES</p>
              <ul className="space-y-1.5">
                {[
                  "Live AWS API execution",
                  "Attack simulation",
                  "Compliance scanning (CIS/NIST/PCI)",
                  "Incident response & forensics",
                  "Remediation commands",
                ].map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-[11px] text-secondary-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
