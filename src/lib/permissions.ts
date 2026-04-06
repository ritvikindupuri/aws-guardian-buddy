export const permissionsMap: Record<string, string[]> = {
  "S3 Buckets": ["s3:ListAllMyBuckets", "s3:GetBucketPublicAccessBlock", "s3:GetBucketAcl", "s3:GetBucketPolicy", "s3:GetEncryptionConfiguration", "s3:GetBucketVersioning", "s3:GetBucketLogging", "s3:GetBucketReplication"],
  "Unified Audit": ["iam:GetAccountAuthorizationDetails", "s3:ListAllMyBuckets", "ec2:DescribeSecurityGroups", "ec2:DescribeInstances", "ce:GetCostAndUsage"],
  "Cost Anomalies": ["ce:GetCostAndUsage", "ec2:DescribeInstances"],
  "Drift Digest": ["ec2:DescribeSecurityGroups", "iam:GetAccountAuthorizationDetails", "s3:ListAllMyBuckets"],
  "Org MFA Gaps": ["organizations:ListAccounts", "iam:ListUsers", "iam:ListMFADevices"],
  "Org SCP Inventory": ["organizations:ListPolicies", "organizations:ListTargetsForPolicy"],
  "Runbook Dry Run": ["ce:GetCostAndUsage", "ec2:DescribeInstances"],
  "IAM Posture": ["iam:GetAccountAuthorizationDetails", "iam:ListUsers", "iam:ListAccessKeys", "iam:GetAccountPasswordPolicy", "iam:ListMFADevices", "iam:GetCredentialReport"],
  "Security Groups": ["ec2:DescribeSecurityGroups", "ec2:DescribeNetworkInterfaces"],
  "EC2 Instances": ["ec2:DescribeInstances", "ec2:DescribeVolumes", "ec2:DescribeLaunchTemplates"],
  "RDS / Aurora": ["rds:DescribeDBInstances", "rds:DescribeDBClusters"],
  "Lambda Security": ["lambda:ListFunctions", "lambda:GetFunction", "lambda:GetPolicy"],
  "IP Safety Check": ["ec2:DescribeSecurityGroups", "ec2:DescribeNetworkAcls", "wafv2:ListIPSets", "wafv2:GetIPSet"],
  "Log Analyst": ["cloudtrail:LookupEvents", "logs:FilterLogEvents"],
  "CIS Benchmark": ["iam:GetAccountPasswordPolicy", "iam:GetCredentialReport", "cloudtrail:DescribeTrails", "config:DescribeConfigurationRecorders", "s3:GetAccountPublicAccessBlock", "guardduty:ListDetectors", "securityhub:DescribeHub"],
  "CloudTrail": ["cloudtrail:DescribeTrails", "cloudtrail:GetTrailStatus", "cloudtrail:GetEventSelectors"],
  "GuardDuty": ["guardduty:ListDetectors", "guardduty:ListFindings", "guardduty:GetFindings"],
  "Security Hub": ["securityhub:GetEnabledStandards", "securityhub:GetFindings"],
  "Privilege Escalation": ["iam:GetAccountAuthorizationDetails", "iam:ListUsers", "iam:ListRoles"],
  "Secrets Exposure": ["lambda:ListFunctions", "lambda:GetFunctionConfiguration", "ec2:DescribeInstances", "ssm:DescribeParameters", "ssm:GetParameters", "secretsmanager:ListSecrets", "secretsmanager:GetResourcePolicy"],
  "S3 Exfil Paths": ["s3:ListAllMyBuckets", "s3:GetBucketAcl", "s3:GetBucketPolicy", "s3:GetBucketReplication"],
  "Lateral Movement": ["ec2:DescribeVpcPeeringConnections", "ec2:DescribeRouteTables", "ec2:DescribeInstances", "ecs:ListTaskDefinitions", "ecs:DescribeTaskDefinitions", "lambda:ListFunctions"],
  "Detection Gaps": ["guardduty:ListDetectors", "cloudtrail:DescribeTrails", "cloudwatch:DescribeAlarms", "config:DescribeConfigurationRecorders"],
  "Network Exposure": ["ec2:DescribeSecurityGroups", "ec2:DescribeInstances", "rds:DescribeDBInstances", "elasticloadbalancing:DescribeLoadBalancers", "apigateway:GetRestApis", "ec2:DescribeVpcEndpoints"],
  "Threat Detector": ["guardduty:ListFindings", "wafv2:GetSampledRequests", "cloudtrail:LookupEvents"],
  "Auto Pen Test": ["ec2:CreateVpc", "ec2:CreateSubnet", "ec2:CreateSecurityGroup", "ec2:RunInstances", "ec2:TerminateInstances"],
  "AI vs AI Sim": ["iam:GetAccountAuthorizationDetails", "cloudtrail:LookupEvents", "iam:SimulatePrincipalPolicy"],
  "Evasion Test": ["cloudtrail:LookupEvents", "guardduty:ListFindings"],
  "Auto Defense": ["iam:GetAccountAuthorizationDetails"],
  "Isolate Instance": ["ec2:DescribeInstances", "ec2:CreateSecurityGroup", "ec2:ModifyInstanceAttribute", "ec2:CreateSnapshot"],
  "Credential Audit": ["iam:ListUsers", "iam:ListAccessKeys", "cloudtrail:LookupEvents"],
  "Forensic Snapshot": ["ec2:DescribeInstances", "ec2:CreateSnapshot", "cloudtrail:DescribeTrails"],
  "Blast Radius": ["iam:ListRoles", "cloudtrail:LookupEvents", "s3:ListAllMyBuckets", "rds:DescribeDBInstances"],
  "Block IPs": ["wafv2:ListIPSets", "wafv2:UpdateIPSet", "ec2:DescribeNetworkAcls", "ec2:ReplaceNetworkAclEntry"],
  "Revoke IAM": ["iam:ListAccessKeys", "iam:UpdateAccessKey", "iam:ListAttachedUserPolicies", "iam:DetachUserPolicy"],
  "Threat Hunting": ["guardduty:ListDetectors", "guardduty:ListFindings", "guardduty:GetFindings"],
  "Coverage Gap Analysis": ["guardduty:ListDetectors", "guardduty:GetDetector"],
  "Malware Scans": ["guardduty:ListDetectors", "guardduty:GetMalwareScanSettings", "guardduty:ListFindings"],
  "EKS & Container Threats": ["guardduty:ListDetectors", "guardduty:ListFindings", "guardduty:GetFindings"],
  "IAM Credential Theft": ["guardduty:ListDetectors", "guardduty:ListFindings", "guardduty:GetFindings", "iam:UpdateAccessKey"],
  "Close Public Access": ["s3:ListAllMyBuckets", "ec2:DescribeSecurityGroups", "rds:DescribeDBInstances", "ec2:DescribeInstances"],
  "SG Preview 443": ["ec2:DescribeSecurityGroups"],
  "SG-to-SG Preview": ["ec2:DescribeSecurityGroups"],
  "SG Block Test": ["ec2:AuthorizeSecurityGroupIngress"],
  "SG Egress Preview": ["ec2:DescribeSecurityGroups"],
  "SG Revoke Egress": ["ec2:DescribeSecurityGroups", "ec2:RevokeSecurityGroupEgress"],
  "Confirm Change": [],
  "Capture Baseline": ["ec2:DescribeSecurityGroups", "iam:GetAccountAuthorizationDetails", "s3:ListAllMyBuckets"],
  "Org SCP Preview": ["organizations:ListAccounts"],
  "Guardian Role Status": ["organizations:ListAccounts", "sts:AssumeRole"],
  "S3 Lockdown Runbook": ["s3:GetBucketPublicAccessBlock"],
  "Enable GuardDuty": ["guardduty:ListDetectors", "guardduty:CreateDetector"],
  "Enforce MFA": ["iam:ListUsers", "iam:ListMFADevices", "iam:CreatePolicy", "iam:AttachUserPolicy"],
  "IAM S3 Preview": ["iam:GetGroup"],
  "IAM Scoped Preview": ["iam:GetGroup"],
  "Harden IMDSv2": ["ec2:DescribeInstances", "ec2:ModifyInstanceMetadataOptions"],
  "Task Automator": ["securityhub:GetFindings", "guardduty:ListFindings"],
  "Set $200 Budget Rule": ["budgets:CreateBudget", "budgets:CreateNotification"],
  "Auto-Stop Idle EC2": ["ce:GetCostAndUsage", "ec2:StopInstances"],
  "Report Builder": ["securityhub:GetFindings", "guardduty:ListFindings"],
  "Severity Alerts": ["sns:ListTopics", "sns:ListSubscriptionsByTopic", "lambda:ListFunctions"],
  "Audit Archive": ["dynamodb:ListTables", "s3:GetBucketObjectLockConfiguration"],
  "Email Engine": ["ses:ListIdentities", "ses:GetIdentityVerificationAttributes", "sns:ListSubscriptions"],
  "Security Alarms": ["cloudwatch:PutMetricAlarm", "logs:PutMetricFilter"],
  "Anomaly Detection": ["cloudwatch:PutAnomalyDetector", "cloudwatch:PutMetricAlarm"],
  "Log Insights": ["logs:StartQuery", "logs:GetQueryResults"],
  "Metric Filters": ["logs:DescribeMetricFilters", "logs:PutMetricFilter"],
  "Security Dashboard": ["cloudwatch:PutDashboard"],
  "Alarm Status": ["cloudwatch:DescribeAlarms"]
};

// Extracted keyword rules for custom prompt inference
const inferenceRules: Array<{ keywords: string[]; perms: string[] }> = [
  { keywords: ["s3", "bucket"], perms: ["s3:ListAllMyBuckets", "s3:GetBucketPublicAccessBlock", "s3:GetBucketAcl", "s3:GetBucketPolicy"] },
  { keywords: ["iam", "user", "role", "policy", "permissions"], perms: ["iam:GetAccountAuthorizationDetails", "iam:ListUsers", "iam:ListRoles"] },
  { keywords: ["ec2", "instance", "vm", "server"], perms: ["ec2:DescribeInstances"] },
  { keywords: ["sg", "security group", "port"], perms: ["ec2:DescribeSecurityGroups"] },
  { keywords: ["rds", "database", "aurora"], perms: ["rds:DescribeDBInstances"] },
  { keywords: ["lambda", "function"], perms: ["lambda:ListFunctions", "lambda:GetFunction"] },
  { keywords: ["cost", "spend", "budget", "billing"], perms: ["ce:GetCostAndUsage"] },
  { keywords: ["cloudtrail", "logs", "events"], perms: ["cloudtrail:DescribeTrails", "cloudtrail:LookupEvents"] },
  { keywords: ["guardduty", "threats", "findings"], perms: ["guardduty:ListDetectors", "guardduty:ListFindings"] },
  { keywords: ["vpc", "subnet", "network"], perms: ["ec2:DescribeVpcs", "ec2:DescribeSubnets"] },
];

export function getPermissionsForPrompt(prompt: string, knownLabel?: string): string[] {
  // First, check if it's a known quick action label
  if (knownLabel && permissionsMap[knownLabel]) {
    return permissionsMap[knownLabel];
  }

  // Find exact quick action matching prompt text
  // Let's assume the caller can pass the known label if it was a quick action

  // Custom prompt inference
  const lowerPrompt = prompt.toLowerCase();
  const inferredPerms = new Set<string>();

  for (const rule of inferenceRules) {
    if (rule.keywords.some((kw) => lowerPrompt.includes(kw))) {
      rule.perms.forEach(p => inferredPerms.add(p));
    }
  }

  // If we couldn't infer any, we default to some basic ones for the audit agent
  if (inferredPerms.size === 0) {
    inferredPerms.add("sts:GetCallerIdentity");
  }

  return Array.from(inferredPerms);
}
