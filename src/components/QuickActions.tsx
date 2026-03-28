import {
  Shield, Search, AlertTriangle, Lock, Server,
  Database, Globe, Users, FileSearch, Zap,
  Eye, Activity, Network, HardDrive, Swords,
  Key, Radio, GitBranch, Cpu, Fingerprint, Target,
  FileText, Radar, Bot, ClipboardList, Ban,
  UserX, BellRing, Archive, Mail, ShieldCheck,
  BarChart3, Bell, Gauge, ScrollText, LayoutDashboard,
  Siren, Bug, ShieldAlert, KeyRound, Map,
  Ghost, Skull, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

const categories = [
  {
    label: "AUDIT",
    color: "text-blue-400",
    actions: [
      {
        icon: Search,
        label: "S3 Buckets",
        prompt: "Query all S3 buckets in the account using real AWS API calls. For each bucket check: public access block settings, bucket ACL, bucket policy (identify external principals), default encryption, versioning status, access logging, and replication. Present real findings in a severity-ranked table with the actual bucket names and configurations you retrieved.",
      },
      {
        icon: LayoutDashboard,
        label: "Unified Audit",
        prompt: "Show me everything wrong with my AWS account. Run a formal unified audit across IAM, S3, security groups, EC2, and cost exposure. Return a neatly formatted report with an executive summary, top three issues, recommended fix order, and notable patterns.",
      },
      {
        icon: Lock,
        label: "IAM Posture",
        prompt: "Perform a full IAM audit using real AWS API calls. Query: all IAM users and their MFA status, all access keys and last used dates, users/roles with AdministratorAccess or wildcard policies, password policy settings, users with console access but no MFA, unused credentials older than 90 days. Use getAccountAuthorizationDetails for a comprehensive policy dump. Show real account data only.",
      },
      {
        icon: AlertTriangle,
        label: "Security Groups",
        prompt: "Audit all EC2 security groups using real AWS API calls. Find every group with inbound rules allowing 0.0.0.0/0 or ::/0, especially on ports: 22 (SSH), 3389 (RDP), 3306 (MySQL), 5432 (Postgres), 1433 (MSSQL), 27017 (MongoDB), 6379 (Redis), 9200 (Elasticsearch), 8080/8443 (alt HTTP). List real group IDs, VPCs, and attached resources.",
      },
      {
        icon: Server,
        label: "EC2 Instances",
        prompt: "Audit all EC2 instances with real API calls. Check each instance for: public IP assignment, IMDSv2 enforcement (HttpTokens=required), unencrypted EBS volumes, IAM instance profile presence, running as root (check user data), stopped instances still accruing cost. Also check launch templates for IMDSv1 defaults. Return real instance IDs and states.",
      },
      {
        icon: Database,
        label: "RDS / Aurora",
        prompt: "Audit all RDS and Aurora instances using real AWS APIs. Check: publicly accessible flag, storage encryption status, automated backup retention period, deletion protection, IAM database authentication, SSL/TLS enforcement via parameter groups, multi-AZ configuration, and Enhanced Monitoring. List real DB instance identifiers and their configurations.",
      },
      {
        icon: Cpu,
        label: "Lambda Security",
        prompt: "Audit all Lambda functions using real AWS API calls. For each function check: execution role permissions (are they overly broad?), environment variables for hardcoded secrets or API keys, function policy for public or cross-account access, VPC configuration (functions that should be VPC-isolated), runtime versions for EOL runtimes, and reserved concurrency. Show real function names and findings.",
      },
      {
        icon: ShieldCheck,
        label: "IP Safety Check",
        prompt: "Check if the current IP or specific IP ranges are acceptable and safe from cyberattacks for EC2 instances and in general using real AWS APIs. Review security group ingress rules, NACLs, and WAF IP sets. Identify exposing rules allowing dangerous traffic from untrusted IPs.",
      },
      {
        icon: FileText,
        label: "Log Analyst",
        prompt: "Parse and summarize CloudTrail and CloudWatch logs. Query recent events related to unauthorized API calls, console logins without MFA, or sensitive resource deletions. Present findings in a structured summary table.",
      },
    ],
  },
  {
    label: "COMPLIANCE",
    color: "text-green-400",
    actions: [
      {
        icon: Shield,
        label: "CIS Benchmark",
        prompt: "Run a real CIS AWS Foundations Benchmark v3.0 assessment. Query the actual account configuration for each control: IAM password policy, root account MFA and access keys, CloudTrail multi-region status, Config recorder, VPC default security group rules, S3 Block Public Access at account level, GuardDuty enablement, Security Hub enablement. Report real pass/fail for each control with evidence.",
      },
      {
        icon: Eye,
        label: "CloudTrail",
        prompt: "Verify CloudTrail configuration using real API calls. Check: multi-region trail enabled, log file validation enabled, S3 bucket logging, KMS encryption of logs, CloudWatch Logs integration, event selectors (management events, data events for S3/Lambda), trail status (is logging active?), and S3 bucket policy on the logging bucket. Show the real trail ARNs and their configuration.",
      },
      {
        icon: Activity,
        label: "GuardDuty",
        prompt: "Check GuardDuty status and findings using real AWS API calls. Query: detector status in the current region, all active findings sorted by severity (CRITICAL/HIGH first), S3 protection status, EKS audit log protection, Lambda protection, RDS login protection, and malware scan settings. List real finding IDs, types, and affected resources.",
      },
      {
        icon: Radio,
        label: "Security Hub",
        prompt: "Query AWS Security Hub using real API calls. Get: enabled security standards (CIS, PCI-DSS, NIST, AWS Foundational), failed controls sorted by severity, critical and high findings, suppressed vs active findings breakdown, and cross-region aggregation status. Show real finding counts and the top 10 most critical controls failing in the account.",
      },
    ],
  },
  {
    label: "ATTACK SIMULATION",
    color: "text-red-400",
    actions: [
      {
        icon: Swords,
        label: "Privilege Escalation",
        prompt: "Perform a real IAM privilege escalation assessment. Use AWS API calls to: enumerate all IAM users, roles, and their attached/inline policies, then identify every escalation path — CreatePolicyVersion, SetDefaultPolicyVersion, AttachUserPolicy, AttachRolePolicy, PutUserPolicy, PutRolePolicy, CreateAccessKey on other users, UpdateAssumeRolePolicy, AddUserToGroup, PassRole to Lambda/EC2/CloudFormation, iam:CreateLoginProfile. For each path found, show the exact policy that enables it and the real principal that has the permission.",
      },
      {
        icon: Key,
        label: "Secrets Exposure",
        prompt: "Run a real secrets exposure scan. Use AWS API calls to: check all Lambda function environment variables for credentials patterns, query EC2 instance user data for secrets (describe instances), list all SSM Parameter Store parameters and identify plaintext vs SecureString, check Secrets Manager for resource policies allowing broad access, check EC2 metadata service enforcement (IMDSv2) to assess SSRF-to-credential-theft risk. Report real findings from actual API responses.",
      },
      {
        icon: Target,
        label: "S3 Exfil Paths",
        prompt: "Map real S3 data exfiltration paths. Use AWS API calls to: list all buckets and test their GetBucketAcl and GetBucketPolicy, identify buckets with public read/write/list access, find buckets with cross-account policies (external AWS account principals), check for S3 replication rules sending data to external buckets, identify overly permissive bucket policies granting s3:GetObject or s3:* to '*'. Report real bucket names and the actual policy statements that enable exfiltration.",
      },
      {
        icon: GitBranch,
        label: "Lateral Movement",
        prompt: "Map real lateral movement paths in the account. Use AWS API calls to: enumerate VPC peering connections and route tables, list EC2 instances with IAM roles that have cross-service permissions (e.g., ec2 instance with s3:* or iam:PassRole), enumerate ECS task definitions with privileged containers or host networking, map Lambda execution roles with permissions to assume other roles, identify trust relationships in IAM roles enabling cross-service pivoting. Show real resource IDs and the exact permissions enabling each movement path.",
      },
      {
        icon: Fingerprint,
        label: "Detection Gaps",
        prompt: "Assess real detection and monitoring gaps. Use AWS API calls to: check GuardDuty detector status in ALL regions (list regions, check each), verify CloudTrail is logging in all regions (not just the primary), identify AWS services with no CloudWatch alarms on critical API calls (DeleteTrail, PutBucketPolicy, CreateUser, AttachUserPolicy), check if CloudTrail S3 data events are enabled, verify Config recorder is active, check if root account activity generates alerts. Show the real gaps found.",
      },
      {
        icon: Network,
        label: "Network Exposure",
        prompt: "Map the real external network attack surface. Use AWS API calls to: enumerate all security groups with 0.0.0.0/0 inbound rules across all VPCs, find EC2 instances with public IPs AND sensitive IAM roles (SSRF-to-privilege-escalation), check for publicly accessible RDS instances, find load balancers with HTTP (non-HTTPS) listeners, enumerate API Gateways without WAF or without authentication, check for VPC endpoints missing policies. Show real resource identifiers and the exact exposure.",
      },
      {
        icon: Radar,
        label: "Threat Detector",
        prompt: "Perform anomaly and IOC pattern matching using real AWS API calls. Query GuardDuty findings, WAF sampled requests, and CloudTrail for known indicators of compromise (IOCs) such as anomalous geolocation logins, Tor exit node activity, or cryptocurrency mining patterns.",
      },
      {
        icon: Target,
        label: "Auto Pen Test",
        prompt: "Spin up an attack simulation environment: 1) Create a new VPC, Subnet, and Security Group (allow SSH/HTTP from 0.0.0.0/0), 2) Launch an EC2 instance with a vulnerable configuration (e.g., exposing critical infrastructure metadata or overly permissive IAM role), 3) Run an automated penetration test (simulate an attacker exploiting the public exposure or SSRF to grab credentials), 4) Report the findings and attack path in detail. Finally, you must ask me to confirm the deletion of all services created for this simulation to clean up.",
      },
      {
        icon: Skull,
        label: "AI vs AI Sim",
        prompt: "Run an AI-vs-AI attack simulation engine. Simulate a controlled attacker agent attempting privilege escalation on the current account. Act as the main agent to detect, explain, and respond to those actions in real time. Include dynamic attack path mapping and unified risk scoring in your report.",
      },
      {
        icon: Ghost,
        label: "Evasion Test",
        prompt: "Run an AI evasion testing module to slip past existing CloudTrail and GuardDuty detections for 'Unauthorized API Calls'. Modify attack behavior to identify blind spots before a real attacker does.",
      },
      {
        icon: Wand2,
        label: "Auto Defense",
        prompt: "Operate as an autonomous defense system. Run a dynamic attack path mapping of the current IAM structure to find multi-step paths an attacker could take. If you find a severe path, propose an autonomous incident response runbook to quarantine the risk.",
      },
    ],
  },
  {
    label: "INCIDENT RESPONSE",
    color: "text-orange-400",
    actions: [
      {
        icon: Zap,
        label: "Isolate Instance",
        prompt: "Guide me through isolating a potentially compromised EC2 instance using real AWS API calls. Steps: (1) Query running instances to identify the target, (2) Create a quarantine security group with no inbound/outbound rules, (3) Remove existing security groups and apply quarantine group, (4) Create EBS snapshots for forensic preservation, (5) Disable IMDS on the instance, (6) Tag the instance as quarantined with timestamp. Execute each step with real API calls and show the results.",
      },
      {
        icon: FileSearch,
        label: "Credential Audit",
        prompt: "Perform an emergency credential audit using real AWS API calls. Query: all IAM users and their access key status and last-used dates, all active console sessions via IAM, CloudTrail events in the last 24 hours for credential-related API calls (CreateAccessKey, GetSecretAccessKey), any new IAM users or roles created recently, access keys that have never been used or haven't been used in 90+ days. Return real user names, key IDs, and timestamps.",
      },
      {
        icon: HardDrive,
        label: "Forensic Snapshot",
        prompt: "Create forensic snapshots using real AWS API calls. Query all EC2 instances to identify target instances, then for each compromised instance: create EBS snapshots of all attached volumes with forensic tags (Reason, Timestamp, IncidentID), capture instance metadata (instance type, AMI, network config, IAM role), check if CloudTrail logs are being delivered to S3. Show real snapshot IDs and preservation commands.",
      },
      {
        icon: Users,
        label: "Blast Radius",
        prompt: "Assess the blast radius of a potential compromise using real AWS API calls. Query: all IAM roles with trust policies allowing ec2.amazonaws.com or lambda.amazonaws.com (potential pivot targets), all cross-account role assumptions in CloudTrail last 7 days, all S3 buckets accessible by the potentially compromised identity, RDS instances accessible from the VPC, secrets accessible via the identity's permissions. Show real resources at risk.",
      },
      {
        icon: Ban,
        label: "Block IPs",
        prompt: "Automate IP blocking using real AWS API calls. Query WAF IP sets and EC2 Network ACLs to identify existing block rules. Generate the exact AWS CLI commands to append newly identified malicious IPs to WAF IP sets or NACL deny rules.",
      },
      {
        icon: UserX,
        label: "Revoke IAM",
        prompt: "Automate IAM revocation using real AWS API calls. Query active access keys and attached policies for a specified user or role. Generate the exact AWS CLI commands to deactivate their access keys and detach all associated permissions policies immediately.",
      },
    ],
  },
  {
    label: "GUARDDUTY",
    color: "text-pink-400",
    actions: [
      {
        icon: Target,
        label: "Threat Hunting",
        prompt: "Perform advanced threat hunting using GuardDuty findings via real AWS APIs. Retrieve the top 50 highest-severity active findings across all regions. Group the findings by resource type (EC2, IAM, S3, EKS) and threat purpose (e.g., Backdoor, CryptoCurrency, CredentialAccess). Present the results in a structured table to help identify active attack campaigns.",
      },
      {
        icon: Map,
        label: "Coverage Gap Analysis",
        prompt: "Run a full GuardDuty coverage gap analysis across all AWS regions using real AWS API calls. For every region, check if a GuardDuty detector exists and is enabled. For enabled detectors, verify the status of S3 Protection, EKS Protection, RDS Protection, Lambda Network Protection, and Malware Protection. Report any region or feature that is disabled as a security gap.",
      },
      {
        icon: Bug,
        label: "Malware Scans",
        prompt: "Audit GuardDuty Malware Protection status using real AWS API calls. Check the malware scanning configuration on the primary detector. Identify any EC2 instances or EBS volumes that have generated 'Execution:EC2/MaliciousFile' or similar malware findings recently. Provide the exact resource IDs and the remediation steps to isolate them.",
      },
      {
        icon: ShieldAlert,
        label: "EKS & Container Threats",
        prompt: "Analyze GuardDuty for Kubernetes and container-specific threats using real AWS APIs. Query active findings specifically related to EKS clusters, such as 'PrivilegeEscalation:Kubernetes', 'CredentialAccess:Kubernetes', or 'Execution:Kubernetes'. List the affected cluster names, namespaces, and pod names involved in the suspicious activity.",
      },
      {
        icon: KeyRound,
        label: "IAM Credential Theft",
        prompt: "Investigate potential IAM credential compromise using GuardDuty findings via real AWS APIs. Query for findings like 'UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration', 'PenTest:IAMUser/KaliLinux', or 'Stealth:IAMUser/CloudTrailLoggingDisabled'. Identify the specific IAM users or roles involved and generate the CLI commands to immediately revoke their active sessions.",
      },
    ],
  },
  {
    label: "REMEDIATION",
    color: "text-yellow-400",
    actions: [
      {
        icon: Globe,
        label: "Close Public Access",
        prompt: "Identify and remediate all public access vectors using real AWS API calls. Query: S3 buckets with public access (get real bucket names), security groups with 0.0.0.0/0 (get real group IDs and rule details), RDS instances with PubliclyAccessible=true (get real DB identifiers), EC2 instances with public IPs attached to sensitive roles. For each real finding, provide the exact AWS CLI remediation command targeting that specific resource ID.",
      },
      {
        icon: AlertTriangle,
        label: "SG Preview 443",
        prompt: "Open port 443 to 0.0.0.0/0 on the security group prod-web-sg. Preview the exact rule change and risk level first, and do not apply anything until I confirm.",
      },
      {
        icon: Network,
        label: "SG-to-SG Preview",
        prompt: "Allow the security group app-sg to reach db-sg on TCP port 5432. Show the exact security group rule preview and wait for confirmation before applying.",
      },
      {
        icon: Ban,
        label: "SG Block Test",
        prompt: "Open port 22 to 0.0.0.0/0 on the security group prod-web-sg.",
      },
      {
        icon: Globe,
        label: "SG Egress Preview",
        prompt: "Allow outbound HTTPS traffic to 0.0.0.0/0 from the security group app-sg. Preview the exact egress rule and risk level first, and do not apply anything until I confirm.",
      },
      {
        icon: ShieldCheck,
        label: "SG Revoke Egress",
        prompt: "Remove outbound HTTPS access to 0.0.0.0/0 from the security group app-sg. Show the exact egress rule preview and wait for confirmation before applying.",
      },
      {
        icon: ShieldCheck,
        label: "Confirm Change",
        prompt: "Confirm",
      },
      {
        icon: Shield,
        label: "Enable GuardDuty",
        prompt: "Check GuardDuty status across regions and generate enablement commands. Use real AWS API calls to: query GuardDuty detector status in the current region and adjacent regions (us-east-1, us-west-2, eu-west-1), check if S3 protection, EKS protection, Lambda protection, and RDS protection are enabled on existing detectors. For each gap found, provide the exact AWS CLI command to enable that protection.",
      },
      {
        icon: Lock,
        label: "Enforce MFA",
        prompt: "Enforce MFA across all IAM users using real API calls. Query: all IAM users, list which have MFA devices (ListMFADevices), identify users with console access and no MFA. Generate: an IAM policy that denies all actions except MFA enrollment unless MFA is present (with exact JSON), and the AWS CLI commands to attach that policy. Show real usernames from the account that need MFA enforcement.",
      },
      {
        icon: Key,
        label: "IAM S3 Preview",
        prompt: "Give the IAM group dev-team read-only S3 access. Preview the exact IAM policy first, do not apply anything until I confirm.",
      },
      {
        icon: Users,
        label: "IAM Scoped Preview",
        prompt: "Prepare a least-privilege IAM policy to give the IAM group contractor-group read-only S3 access to arn:aws:s3:::example-bucket and arn:aws:s3:::example-bucket/* only. Show the preview and wait for confirmation.",
      },
      {
        icon: Cpu,
        label: "Harden IMDSv2",
        prompt: "Enforce IMDSv2 across all EC2 instances using real API calls. Query all instances and their MetadataOptions (HttpTokens setting). For each instance with HttpTokens=optional (IMDSv1 enabled), provide the exact AWS CLI command to enforce IMDSv2: aws ec2 modify-instance-metadata-options. Also check launch templates for IMDSv1 defaults and provide the commands to update them. Show real instance IDs.",
      },
      {
        icon: Bot,
        label: "Task Automator",
        prompt: "Automate remediation execution using real AWS API calls. Review findings from Security Hub or GuardDuty, map them to standard runbooks, and provide the exact AWS CLI automation commands to remediate the specific issues identified (e.g., closing public buckets, restricting security groups).",
      },
    ],
  },
  {
    label: "REPORTING & ALERTS",
    color: "text-purple-400",
    actions: [
      {
        icon: ClipboardList,
        label: "Report Builder",
        prompt: "Format security findings into detailed payload reports. Query recent assessments from Security Hub and GuardDuty, synthesize the results, and generate a structured HTML/Markdown report summarizing the current security posture.",
      },
      {
        icon: BellRing,
        label: "Severity Alerts",
        prompt: "Review severity-tiered alert configurations using real AWS APIs. Check SNS topics and Lambda trigger subscriptions associated with Security Hub or GuardDuty events to ensure Critical/High/Medium/Low alerts are routed correctly.",
      },
      {
        icon: Archive,
        label: "Audit Archive",
        prompt: "Check audit reporting infrastructure using real AWS APIs. Verify DynamoDB history tables for security audit logs and check S3 bucket policies for the report archive bucket to ensure write-once-read-many (WORM) or object lock configurations are active.",
      },
      {
        icon: Mail,
        label: "Email Engine",
        prompt: "Audit the email alert engine configuration using real AWS APIs. Check AWS SES (Simple Email Service) domain identities, verified email addresses, sending statistics, and review SNS-to-Email subscription configurations for escalation rules.",
      },
    ],
  },
  {
    label: "CLOUDWATCH",
    color: "text-cyan-400",
    actions: [
      {
        icon: Bell,
        label: "Security Alarms",
        prompt: "Create CloudWatch Alarms for critical security events using real AWS API calls. Set up alarms for: unauthorized API calls, root account usage, IAM policy changes, security group modifications, NACL changes, console sign-in failures, S3 bucket policy changes, CloudTrail configuration changes, and KMS key deletion. Create the corresponding metric filters on the CloudTrail log group and link alarms to the configured SNS topic for email notifications.",
      },
      {
        icon: Gauge,
        label: "Anomaly Detection",
        prompt: "Configure CloudWatch Anomaly Detection for security monitoring using real AWS API calls. Set up anomaly detectors for: API call volume per principal, EC2 instance launch frequency, IAM user creation rate, S3 data transfer volumes, and cross-region API activity. Create anomaly detection alarms that trigger when metrics exceed the expected band by 2+ standard deviations. Report the current anomaly detection configuration and any active anomalies detected.",
      },
      {
        icon: ScrollText,
        label: "Log Insights",
        prompt: "Run CloudWatch Logs Insights queries against CloudTrail logs using real AWS API calls. Execute queries for: top 10 denied API calls in the last 24 hours with source IPs, unusual console logins by geolocation, API calls from previously unseen IP addresses, resource deletion events across all services, and IAM credential usage patterns. Present results in structured tables with timestamps and affected resources.",
      },
      {
        icon: BarChart3,
        label: "Metric Filters",
        prompt: "Audit and create CloudWatch Metric Filters on CloudTrail log groups using real AWS API calls. Check existing metric filters and identify gaps. Create filters for: unauthorized access attempts, root account activity, IAM policy modifications, security group changes, S3 bucket exposure events, and failed authentication attempts. Show the filter patterns, metric namespaces, and linked alarms.",
      },
      {
        icon: LayoutDashboard,
        label: "Security Dashboard",
        prompt: "Design a CloudWatch Security Dashboard configuration using real AWS API calls. Query current alarms, metrics, and log groups to determine available data sources. Generate a dashboard JSON definition with widgets for: alarm status overview, API call volume trends, unauthorized access attempt graphs, top security findings, geographic API activity distribution, and resource change timeline. Provide the AWS CLI command to create the dashboard.",
      },
      {
        icon: Activity,
        label: "Alarm Status",
        prompt: "Query all CloudWatch Alarms related to security monitoring using real AWS API calls. List every alarm with its current state (OK, ALARM, INSUFFICIENT_DATA), the metric it monitors, threshold configuration, evaluation period, and linked SNS actions. Identify any alarms in ALARM state and provide the triggering metric data. Also identify critical security events that lack alarm coverage.",
      },
    ],
  },
];

const categoryBorderColors: Record<string, string> = {
  "AUDIT": "border-blue-500/20",
  "COMPLIANCE": "border-green-500/20",
  "ATTACK SIMULATION": "border-red-500/20",
  "INCIDENT RESPONSE": "border-orange-500/20",
  "REMEDIATION": "border-yellow-500/20",
  "GUARDDUTY": "border-pink-500/20",
  "REPORTING & ALERTS": "border-purple-500/20",
  "CLOUDWATCH": "border-cyan-500/20",
};

const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat.label} className={`rounded-lg border ${categoryBorderColors[cat.label] ?? "border-border"} bg-card/40 p-3`}>
          <p className={`text-[10px] font-mono tracking-widest uppercase mb-2.5 px-0.5 font-semibold ${cat.color}`}>
            {cat.label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {cat.actions.map((action) => (
              <Button
                key={action.label}
                variant="action"
                size="xs"
                onClick={() => onAction(action.prompt)}
                disabled={disabled}
                className="flex items-center gap-1.5 justify-start h-auto py-2 px-2.5 text-left"
              >
                <action.icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
