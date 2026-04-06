import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, ShieldAlert, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AwsCredentialsPanel, { type AwsCredentials } from "@/components/AwsCredentialsPanel";

interface VpcRoutingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: AwsCredentials | null;
  onAccept: () => void;
  onDecline: () => void;
  onReAuthenticate: (creds: AwsCredentials) => void;
}

const REQUIRED_VPC_PERMISSIONS = [
  "ec2:CreateVpc",
  "ec2:CreateSubnet",
  "ec2:CreateSecurityGroup",
  "ec2:CreateRouteTable",
  "ec2:CreateInternetGateway",
  "ec2:AttachInternetGateway",
  "ec2:CreateRoute",
  "ec2:DeleteVpc",
  "ec2:DeleteSubnet",
  "ec2:DeleteSecurityGroup",
  "ec2:DeleteRouteTable",
  "ec2:DeleteInternetGateway",
  "ec2:DetachInternetGateway",
  "ec2:DeleteRoute"
];

export const VpcRoutingDialog = ({
  open,
  onOpenChange,
  credentials,
  onAccept,
  onDecline,
  onReAuthenticate,
}: VpcRoutingDialogProps) => {
  const [showError, setShowError] = useState(false);

  const { hasPermissions, missingPermissions, currentPermissions } = useMemo(() => {
    if (!credentials?.permissions) {
      return { hasPermissions: false, missingPermissions: REQUIRED_VPC_PERMISSIONS, currentPermissions: {} };
    }

    const missing = REQUIRED_VPC_PERMISSIONS.filter((p) => !credentials.permissions?.[p]);
    return {
      hasPermissions: missing.length === 0,
      missingPermissions: missing,
      currentPermissions: credentials.permissions,
    };
  }, [credentials]);

  const handleYes = () => {
    if (hasPermissions) {
      onAccept();
    } else {
      setShowError(true);
    }
  };

  const handleReAuthSave = (newCreds: AwsCredentials) => {
    onReAuthenticate(newCreds);
    setShowError(false); // Reset error view to let it re-evaluate
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setShowError(false);
    }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
        <AnimatePresence mode="wait">
          {!showError ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Route agent through AWS VPC?</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Would you like to automatically route the AI agent through an isolated AWS VPC?
                    This will automatically set up the required VPC, subnets, and security groups in your environment.
                  </p>
                  <div className="mt-3 p-3 bg-muted/30 rounded-md border border-border text-left">
                    <p className="text-xs font-semibold mb-1">Exact Permissions Required:</p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-tight">
                      {REQUIRED_VPC_PERMISSIONS.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 w-full">
                  <Button variant="outline" className="flex-1" onClick={onDecline}>
                    No, skip
                  </Button>
                  <Button variant="action" className="flex-1" onClick={handleYes}>
                    Yes, route through VPC
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 flex flex-col max-h-[85vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Insufficient Permissions</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your current credentials do not have the required permissions to automatically provision the VPC routing infrastructure.
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <h3 className="text-xs font-bold mb-2">Missing Permissions</h3>
                  <ul className="space-y-1.5">
                    {missingPermissions.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <h3 className="text-xs font-bold mb-2">Current VPC Permissions</h3>
                  <ul className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin pr-2">
                    {REQUIRED_VPC_PERMISSIONS.map((p) => {
                      const has = currentPermissions[p];
                      return (
                        <li key={p} className="flex items-center gap-2 text-[11px] font-mono">
                          {has ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                          )}
                          <span className={has ? "text-foreground" : "text-muted-foreground/50"}>{p}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">
                    Please acknowledge this error, update your IAM role/user, and provide new credentials below to continue.
                  </p>
                  <AwsCredentialsPanel credentials={credentials} onSave={handleReAuthSave} compact />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowError(false)} className="text-xs">
                  Back
                </Button>
                <Button variant="outline" size="sm" onClick={onDecline} className="text-xs">
                  Cancel VPC Setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VpcRoutingDialog;
