import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ShieldCheck, ChevronDown, ChevronUp, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AwsCredentials {
  method: "access_key" | "assume_role";
  accessKeyId?: string;
  secretAccessKey?: string;
  roleArn?: string;
  region: string;
  sessionToken?: string;
}

interface AwsCredentialsPanelProps {
  credentials: AwsCredentials | null;
  onSave: (creds: AwsCredentials) => void;
}

const AwsCredentialsPanel = ({ credentials, onSave }: AwsCredentialsPanelProps) => {
  const [isOpen, setIsOpen] = useState(!credentials);
  const [method, setMethod] = useState<"access_key" | "assume_role">(credentials?.method || "access_key");
  const [accessKeyId, setAccessKeyId] = useState(credentials?.accessKeyId || "");
  const [secretAccessKey, setSecretAccessKey] = useState(credentials?.secretAccessKey || "");
  const [roleArn, setRoleArn] = useState(credentials?.roleArn || "");
  const [region, setRegion] = useState(credentials?.region || "us-east-1");
  const [sessionToken, setSessionToken] = useState(credentials?.sessionToken || "");
  const [showSecret, setShowSecret] = useState(false);

  const handleSave = () => {
    onSave({
      method,
      accessKeyId: method === "access_key" ? accessKeyId : undefined,
      secretAccessKey: method === "access_key" ? secretAccessKey : undefined,
      roleArn: method === "assume_role" ? roleArn : undefined,
      region,
      sessionToken: sessionToken || undefined,
    });
    setIsOpen(false);
  };

  const isValid = method === "access_key"
    ? accessKeyId.trim() && secretAccessKey.trim() && region.trim()
    : roleArn.trim() && region.trim();

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${credentials ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}>
            {credentials ? <ShieldCheck className="w-4 h-4 text-primary" /> : <Key className="w-4 h-4 text-destructive" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">AWS Credentials</p>
            <p className="text-xs text-muted-foreground font-mono">
              {credentials ? `${credentials.method === "access_key" ? "Access Key" : "Assume Role"} • ${credentials.region}` : "Not configured"}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              <div className="flex gap-2">
                <Button
                  variant={method === "access_key" ? "terminal" : "action"}
                  size="sm"
                  onClick={() => setMethod("access_key")}
                  className="flex-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  Access Key
                </Button>
                <Button
                  variant={method === "assume_role" ? "terminal" : "action"}
                  size="sm"
                  onClick={() => setMethod("assume_role")}
                  className="flex-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Assume Role
                </Button>
              </div>

              {method === "access_key" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-mono">ACCESS KEY ID</Label>
                    <Input
                      value={accessKeyId}
                      onChange={(e) => setAccessKeyId(e.target.value)}
                      placeholder="AKIA..."
                      className="font-mono text-sm bg-muted border-border focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-mono">SECRET ACCESS KEY</Label>
                    <div className="relative">
                      <Input
                        type={showSecret ? "text" : "password"}
                        value={secretAccessKey}
                        onChange={(e) => setSecretAccessKey(e.target.value)}
                        placeholder="••••••••••••"
                        className="font-mono text-sm bg-muted border-border focus:border-primary/50 pr-10"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-mono">ROLE ARN</Label>
                  <Input
                    value={roleArn}
                    onChange={(e) => setRoleArn(e.target.value)}
                    placeholder="arn:aws:iam::123456789012:role/..."
                    className="font-mono text-sm bg-muted border-border focus:border-primary/50"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-mono">REGION</Label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-east-1"
                  className="font-mono text-sm bg-muted border-border focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-mono">SESSION TOKEN (optional)</Label>
                <Input
                  value={sessionToken}
                  onChange={(e) => setSessionToken(e.target.value)}
                  placeholder="Optional for temporary credentials"
                  className="font-mono text-sm bg-muted border-border focus:border-primary/50"
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
                <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Credentials are sent securely per-request and never stored on our servers.
                </p>
              </div>

              <Button
                variant="terminal"
                onClick={handleSave}
                disabled={!isValid}
                className="w-full"
              >
                <ShieldCheck className="w-4 h-4" />
                Connect to AWS
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AwsCredentialsPanel;
