import ReactMarkdown from "react-markdown";
import { User, Loader2, CheckCircle, AlertOctagon } from "lucide-react";
import CloudPilotLogo from "@/components/CloudPilotLogo";

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

  return (
    <div className={`animate-fade-in-up flex gap-3 px-5 py-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
            <CloudPilotLogo className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      <div className={`rounded-xl px-5 py-4 text-sm leading-relaxed ${
        isUser
          ? "max-w-[72%] bg-secondary border border-border"
          : "flex-1 min-w-0 bg-card border border-border/60"
      }`}>
        {isUser ? (
          <p className="text-foreground text-[13px] leading-6">{message.content}</p>
        ) : (
          <div className="
            prose max-w-none

            [&_p]:text-[13px] [&_p]:leading-[1.75] [&_p]:text-foreground [&_p]:my-2.5

            [&_ul]:my-2.5 [&_ul]:pl-5 [&_ul]:space-y-1
            [&_ol]:my-2.5 [&_ol]:pl-5 [&_ol]:space-y-1
            [&_li]:text-[13px] [&_li]:leading-[1.7] [&_li]:text-foreground

            [&_strong]:font-bold [&_strong]:text-foreground

            [&_h1]:text-foreground [&_h1]:text-[17px] [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-border
            [&_h2]:text-foreground [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2.5
            [&_h3]:text-primary [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:uppercase [&_h3]:tracking-wide

            [&_code]:font-mono [&_code]:bg-muted [&_code]:border [&_code]:border-border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-[11.5px]
            [&_pre]:bg-muted/60 [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-[11.5px] [&_pre]:overflow-x-auto [&_pre]:my-3
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-foreground [&_pre_code]:text-[11.5px]

            [&_table]:w-full [&_table]:text-[12px] [&_table]:border-collapse [&_table]:my-3 [&_table]:rounded-lg [&_table]:overflow-hidden
            [&_thead]:bg-muted
            [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_th]:tracking-wider [&_th]:border [&_th]:border-border
            [&_td]:px-3.5 [&_td]:py-2 [&_td]:border [&_td]:border-border [&_td]:text-[12px] [&_td]:text-foreground
            [&_tr:nth-child(even)_td]:bg-muted/30

            [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic

            [&_hr]:border-border [&_hr]:my-4

            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
          ">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2.5">
          {message.status === "streaming" && (
            <div className="flex items-center gap-1.5 text-terminal-dim">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px] font-mono tracking-wider uppercase">Executing AWS queries...</span>
            </div>
          )}
          {message.status === "complete" && !isUser && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] font-mono">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {message.status === "error" && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertOctagon className="w-3 h-3" />
              <span className="text-[10px] font-mono">Error — check credentials and try again</span>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
