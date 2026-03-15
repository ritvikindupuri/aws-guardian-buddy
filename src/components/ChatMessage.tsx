import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Shield, User, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "streaming" | "complete" | "error";

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  status?: MessageStatus;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 px-4 py-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            {isSystem ? (
              <AlertTriangle className="w-4 h-4 text-warning" />
            ) : (
              <Shield className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-secondary border border-border"
            : "bg-card border border-border"
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_pre]:bg-muted [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-primary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {message.status === "streaming" && (
          <div className="flex items-center gap-1.5 mt-2 text-terminal-dim">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs font-mono">processing...</span>
          </div>
        )}

        {message.status === "complete" && !isUser && (
          <div className="flex items-center gap-1.5 mt-2 text-terminal-dim">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-mono">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
