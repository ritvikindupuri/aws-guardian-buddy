import { useState } from "react";
import { Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationSettingsProps {
  email: string;
  onSave: (email: string) => void;
}

const NotificationSettings = ({ email, onSave }: NotificationSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(email);

  const handleSave = () => {
    onSave(draft.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(email);
    setIsEditing(false);
  };

  return (
    <div className="border border-border rounded-lg bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Email Notifications
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setDraft(email);
              setIsEditing(true);
            }}
            className="text-[10px] text-primary h-5 px-1.5"
          >
            {email ? "Edit" : "Configure"}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <input
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="analyst@company.com"
              className="w-full rounded-md bg-muted border border-border px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              The AI agent will use AWS SNS to send a report summary to this email after every analysis. Requires SNS permissions in your IAM role.
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="terminal"
                size="xs"
                onClick={handleSave}
                className="flex-1 flex items-center gap-1 justify-center"
              >
                <Check className="w-3 h-3" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCancel}
                className="flex items-center gap-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {email ? (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                <span className="text-[11px] text-secondary-foreground font-mono truncate">
                  {email}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">
                No email configured — reports will not be sent
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSettings;
