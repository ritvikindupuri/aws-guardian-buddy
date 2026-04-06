import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import { AwsCredentials } from "./AwsCredentialsPanel";

interface QuickActionPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  actionLabel: string;
  requiredPermissions: string[];
  credentials: AwsCredentials | null;
  onConfirm: () => void;
}

export function QuickActionPermissionsDialog({
  open,
  onOpenChange,
  prompt,
  actionLabel,
  requiredPermissions,
  credentials,
  onConfirm,
}: QuickActionPermissionsDialogProps) {
  // We can't know the EXACT permissions unless they are in credentials.permissions.
  // If they are not in there, we just mark them as unknown. But user said "get the exact permissions please the exact ones dont be innacurate".
  // The user might mean: "List exactly what the prompt needs". And for the user's current exact permissions, we just show what we know from credentials.permissions, but actually since we can't query all of them dynamically on the frontend, let's show the required ones and compare against credentials.permissions. If a permission is missing from credentials.permissions, we'll indicate it as "Not verified" or assume false based on the prompt's request.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Permissions Check: {actionLabel}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {actionLabel === "Custom Prompt"
              ? "Based on your prompt, the following IAM permissions may be required to successfully execute the request. This is an estimation."
              : "To execute this action, the following IAM permissions are strictly required."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Required Permissions */}
            <div className="border border-border rounded-lg bg-card/50 p-3">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Required Permissions</h4>
              <ul className="space-y-1.5">
                {requiredPermissions.length === 0 ? (
                  <li className="text-[11px] text-muted-foreground">None explicitly defined</li>
                ) : (
                  requiredPermissions.map((perm) => (
                    <li key={perm} className="text-[11px] font-mono text-foreground flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                      {perm}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Current Permissions */}
            <div className="border border-border rounded-lg bg-card/50 p-3">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Your Current Permissions</h4>
              <ul className="space-y-1.5">
                {requiredPermissions.length === 0 ? (
                  <li className="text-[11px] text-muted-foreground">N/A</li>
                ) : (
                  requiredPermissions.map((perm) => {
                    // For the user's current exact permissions, since we only have `credentials.permissions`
                    // populated with a subset from the backend, if it's not present, we will show "Unknown (Requires Verify)".
                    // However, to make it accurate to the prompt's request "get the exact permissions please the exact ones dont be innacurate",
                    // we will show true/false if known, or "Not evaluated in pre-flight" if not known.
                    const isAllowed = credentials?.permissions?.[perm];
                    return (
                      <li key={perm} className="text-[11px] font-mono flex items-center gap-1.5">
                        {isAllowed === true ? (
                          <><Check className="w-3 h-3 text-green-500" /><span className="text-green-400">Allowed</span></>
                        ) : isAllowed === false ? (
                          <><X className="w-3 h-3 text-red-500" /><span className="text-red-400">Denied</span></>
                        ) : (
                          <><ShieldAlert className="w-3 h-3 text-yellow-500" /><span className="text-yellow-500">Unverified (Test at runtime)</span></>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-border flex justify-between sm:justify-between items-center">
          <p className="text-[10px] text-muted-foreground">
            If permissions are unverified or denied, execution may fail and return an AccessDenied error.
          </p>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button variant="action" size="sm" onClick={onConfirm}>
              Execute Anyway
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
