import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Key, ShieldCheck, ChevronDown, ChevronUp, Lock, Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/** Session credentials returned by the exchange endpoint — these are the ONLY credentials sent to the agent. */
export interface AwsSessionCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
  region: string;
}

/** Full credentials type used by the app. Raw keys stay local; only session creds go to the agent. */
export interface AwsCredentials {
  method: "access_key" | "assume_role";
  region: string;
  /** Populated after successful exchange — ONLY these are sent with requests */
  session: AwsSessionCredentials | null;
  /** Display-only metadata */
  identity?: { account: string; arn: string };
  /** Original access key ID prefix for display */
  displayKeyPrefix?: string;
}

const AWS_REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1", "eu-north-1",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-south-1",
  "sa-east-1", "ca-central-1", "me-south-1", "af-south-1",
];

interface AwsCredentialsPanelProps {
  credentials: AwsCredentials | null;
  onSave: (creds: AwsCredentials) => void;
  compact?: boolean;
}

const AwsCredentialsPanel = ({ credentials, onSave, compact = false }: AwsCredentialsPanelProps) => {
  const [isOpen, setIsOpen] = useState(!credentials);
  const [method, setMethod] = useState<"access_key" | "assume_role">(credentials?.method || "access_key");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [roleArn, setRoleArn] = useState("");
  const [region, setRegion] = useState(credentials?.region || "us-east-1");
  const [sessionToken, setSessionToken] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [exchanging, setExchanging] = useState(false);

  const handleSave = async () => {
    setExchanging(true);
    try {
      const payload: any = { method, region };
      if (method === "access_key") {
        payload.accessKeyId = accessKeyId;
        payload.secretAccessKey = secretAccessKey;
        if (sessionToken) payload.sessionToken = sessionToken;
      } else {
        payload.roleArn = roleArn;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aws-exchange-credentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ credentials: payload }),
        }
      );

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `Validation failed (${resp.status})`);
      }

      const creds: AwsCredentials = {
        method,
        region,
        session: data.sessionCredentials,
        identity: data.identity,
        displayKeyPrefix: method === "access_key" ? accessKeyId.slice(0, 10) : undefined,
      };

      onSave(creds);
      setIsOpen(false);
      toast.success(`Connected to AWS account ${data.identity?.account || ""}`);

      // Clear raw inputs from memory
      setAccessKeyId("");
      setSecretAccessKey("");
      setSessionToken("");
      setRoleArn("");
    } catch (err: any) {
      toast.error(err.message || "Failed to validate credentials");
    } finally {
      setExchanging(false);
    }
  };

  const isValid = method === "access_key"
    ? accessKeyId.trim() && secretAccessKey.trim() && region.trim()
    : roleArn.trim() && region.trim();

  const isExpired = credentials?.session?.expiration
    ? new Date(credentials.session.expiration) < new Date()
    : false;

  return (
    <div className={`border border-border rounded-lg bg-card overflow-hidden ${compact ? "text-xs" : ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            credentials && !isExpired
              ? "bg-primary/10 border border-primary/20"
              : "bg-destructive/10 border border-destructive/20"
          }`}>
            {credentials && !isExpired ? (
              <ShieldCheck className="w-3 h-3 text-primary" />
            ) : (
              <Key className="w-3 h-3 text-destructive" />
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-foreground">
              {credentials && !isExpired
                ? "Connected (Session Token)"
                : isExpired
                ? "Session Expired"
                : "AWS Credentials"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {credentials
                ? `${credentials.displayKeyPrefix || "role"}... · ${credentials.region}${
                    credentials.identity?.account ? ` · ${credentials.identity.account}` : ""
                  }`
                : "configure to begin"}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
              <div className="flex gap-1.5">
                <Button
                  variant={method === "access_key" ? "terminal" : "action"}
                  size="xs"
                  onClick={() => setMethod("access_key")}
                  className="flex-1"
                >
                  <Key className="w-3 h-3" />
                  Access Key
                </Button>
                <Button
                  variant={method === "assume_role" ? "terminal" : "action"}
                  size="xs"
                  onClick={() => setMethod("assume_role")}
                  className="flex-1"
                >
                  <Lock className="w-3 h-3" />
                  Assume Role
                </Button>
              </div>

              {method === "access_key" ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Access Key ID</Label>
                    <Input
                      value={accessKeyId}
                      onChange={(e) => setAccessKeyId(e.target.value)}
                      placeholder="AKIA..."
                      className="font-mono text-xs h-8 bg-muted border-border focus:border-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Secret Access Key</Label>
                    <div className="relative">
                      <Input
                        type={showSecret ? "text" : "password"}
                        value={secretAccessKey}
                        onChange={(e) => setSecretAccessKey(e.target.value)}
                        placeholder="••••••••"
                        className="font-mono text-xs h-8 bg-muted border-border focus:border-primary/40 pr-8"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Role ARN</Label>
                  <Input
                    value={roleArn}
                    onChange={(e) => setRoleArn(e.target.value)}
                    placeholder="arn:aws:iam::123456789012:role/..."
                    className="font-mono text-xs h-8 bg-muted border-border focus:border-primary/40"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Region</Label>
                <div className="relative">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full h-8 pl-7 pr-3 rounded-md bg-muted border border-border text-xs font-mono text-foreground focus:border-primary/40 focus:outline-none appearance-none cursor-pointer"
                  >
                    {AWS_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {method === "access_key" && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Session Token <span className="text-muted-foreground/50">optional</span></Label>
                  <Input
                    value={sessionToken}
                    onChange={(e) => setSessionToken(e.target.value)}
                    placeholder="For temporary credentials"
                    className="font-mono text-xs h-8 bg-muted border-border focus:border-primary/40"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 px-2.5 py-2 bg-muted rounded border border-border">
                <Lock className="w-3 h-3 text-primary flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Raw keys are exchanged for temporary STS session tokens. Only session tokens are used for requests — raw keys are never stored or transmitted to the agent.
                </p>
              </div>

              <Button
                variant="terminal"
                size="sm"
                onClick={handleSave}
                disabled={!isValid || exchanging}
                className="w-full"
              >
                {exchanging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Validating & Exchanging...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {credentials ? "Re-authenticate" : "Connect"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AwsCredentialsPanel;
