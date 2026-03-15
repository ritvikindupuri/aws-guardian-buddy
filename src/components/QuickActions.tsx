import { Shield, Search, AlertTriangle, Lock, Server, Database, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

const actions = [
  { icon: Search, label: "Audit S3 Buckets", prompt: "List all S3 buckets and check for public access, unencrypted buckets, and missing logging" },
  { icon: Globe, label: "Public Resources", prompt: "Find all publicly accessible resources including S3 buckets, EC2 instances with public IPs, and open security groups" },
  { icon: Lock, label: "IAM Review", prompt: "Review IAM users and roles for overly permissive policies, unused credentials, and MFA status" },
  { icon: AlertTriangle, label: "Security Groups", prompt: "Audit all security groups for overly permissive inbound rules, especially 0.0.0.0/0 on sensitive ports" },
  { icon: Server, label: "EC2 Assessment", prompt: "List all EC2 instances and check for unencrypted volumes, missing IMDSv2, and public exposure" },
  { icon: Database, label: "RDS Security", prompt: "Check all RDS instances for public accessibility, encryption status, and backup configuration" },
  { icon: Users, label: "CloudTrail Status", prompt: "Verify CloudTrail is enabled in all regions and check for any gaps in logging coverage" },
  { icon: Shield, label: "Compliance Check", prompt: "Run a high-level compliance check against CIS AWS Foundations Benchmark recommendations" },
];

const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="action"
          size="sm"
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="flex flex-col items-center gap-1.5 h-auto py-3 px-2 text-xs"
        >
          <action.icon className="w-4 h-4" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
