import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Key, ShieldCheck, ChevronDown, ChevronUp, Lock, Eye, EyeOff, Globe, Loader2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  /** Evaluated permissions for the principal */
  permissions?: Record<string, boolean>;
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
  const [storeForGuardian, setStoreForGuardian] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");

  const handleSave = async () => {
    setExchanging(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        permissions: data.permissions,
        displayKeyPrefix: method === "access_key" ? accessKeyId.slice(0, 10) : undefined,
      };

      onSave(creds);
      setIsOpen(false);
      toast.success(`Connected to AWS account ${data.identity?.account || ""}`);

      // Store credentials for Guardian autonomous scans if opted in (AES-256-GCM server-side)
      if (storeForGuardian && method === "access_key") {
        try {
          const vaultResp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aws-credential-vault`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({
                action: "encrypt_and_store",
                accessKeyId,
                secretAccessKey,
                sessionToken: sessionToken || undefined,
                region,
                label: "Default",
                accountId: data.identity?.account || null,
                notificationEmail: notificationEmail || null,
                scanMode: "all",
                credentialMethod: method,
              }),
            }
          );
          const vaultData = await vaultResp.json();
          if (!vaultResp.ok) {
            console.error("Vault store failed:", vaultData.error);
            toast.error("Connected but failed to store for Guardian scheduling.");
          } else {
            toast.success("Credentials stored (AES-256-GCM) for autonomous Guardian scans.");
          }
        } catch (guardianErr) {
          console.error("Guardian store error:", guardianErr);
        }
      }

      // Clear raw inputs from memory
      setAccessKeyId("");
      setSecretAccessKey("");
      setSessionToken("");
      setRoleArn("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

              {method === "access_key" && (
                <div className="flex items-center justify-between px-2.5 py-2 bg-secondary/30 rounded border border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-foreground font-medium">Enable Guardian Scheduling</p>
                      <p className="text-[9px] text-muted-foreground">Store encrypted credentials for autonomous hourly cost & drift scans</p>
                    </div>
                  </div>
                  <Switch
                    checked={storeForGuardian}
                    onCheckedChange={setStoreForGuardian}
                    className="scale-75"
                  />
                </div>
              )}

              {storeForGuardian && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Notification Email <span className="text-muted-foreground/50">for alerts</span></Label>
                  <Input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="alerts@example.com"
                    className="font-mono text-xs h-8 bg-muted border-border focus:border-primary/40"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2.5 py-2 bg-destructive/10 rounded border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-[10px] text-destructive leading-tight font-medium">
                    Strict Warning: Never use production credentials or AdministratorAccess with this tool. Only use scoped-down roles in sandbox or audit accounts.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 bg-muted rounded border border-border">
                  <Lock className="w-3 h-3 text-primary flex-shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Raw keys are exchanged for temporary STS session tokens. Only session tokens are used for requests — raw keys are never stored or transmitted to the agent.
                  </p>
                </div>
              </div>

              {credentials?.permissions && Object.keys(credentials.permissions).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border mt-2">
                  <Label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">IAM Capability Check (Pre-Flight)</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(credentials.permissions).map(([action, allowed]) => (
                      <div key={action} className="flex items-center gap-1.5 text-[10px] font-mono">
                        <div className={`w-2 h-2 rounded-full ${allowed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={allowed ? 'text-foreground' : 'text-muted-foreground'}>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
