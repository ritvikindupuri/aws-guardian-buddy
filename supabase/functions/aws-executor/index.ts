import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── AWS SDK v3 Dynamic Module Loader ────────────────────────────────────────
const _awsModuleCache: Record<string, any> = {};

const _awsSvcMap: Record<string, string> = {
  IAM: "iam", EC2: "ec2", S3: "s3", STS: "sts",
  Organizations: "organizations", CloudWatch: "cloudwatch",
  CostExplorer: "cost-explorer", SNS: "sns",
  CloudTrail: "cloudtrail", CloudWatchLogs: "cloudwatch-logs",
  GuardDuty: "guardduty", SecurityHub: "securityhub",
  Config: "config-service", RDS: "rds", Lambda: "lambda",
  EKS: "eks", ECS: "ecs", KMS: "kms",
  SecretsManager: "secrets-manager", SSM: "ssm",
  WAFv2: "wafv2", CloudFront: "cloudfront", SQS: "sqs",
  ECR: "ecr", Athena: "athena", Inspector2: "inspector2",
  AccessAnalyzer: "accessanalyzer", Macie2: "macie2",
  NetworkFirewall: "network-firewall", Shield: "shield",
  ACM: "acm", APIGateway: "api-gateway",
  CognitoIdentityServiceProvider: "cognito-identity-provider",
  EventBridge: "eventbridge", StepFunctions: "sfn",
  ElastiCache: "elasticache", Redshift: "redshift",
  DynamoDB: "dynamodb", Route53: "route53",
  ELBv2: "elastic-load-balancing-v2", AutoScaling: "auto-scaling",
};

const V3_CLIENT_NAMES: Record<string, string> = {
  IAM: "IAMClient", EC2: "EC2Client", S3: "S3Client", STS: "STSClient",
  Organizations: "OrganizationsClient", CloudWatch: "CloudWatchClient",
  CostExplorer: "CostExplorerClient", SNS: "SNSClient", CloudTrail: "CloudTrailClient",
  CloudWatchLogs: "CloudWatchLogsClient", GuardDuty: "GuardDutyClient",
  SecurityHub: "SecurityHubClient", Config: "ConfigServiceClient",
  RDS: "RDSClient", Lambda: "LambdaClient", EKS: "EKSClient", ECS: "ECSClient",
  KMS: "KMSClient", SecretsManager: "SecretsManagerClient", SSM: "SSMClient",
  WAFv2: "WAFv2Client", CloudFront: "CloudFrontClient", SQS: "SQSClient",
  ECR: "ECRClient", Athena: "AthenaClient", Inspector2: "Inspector2Client",
  AccessAnalyzer: "AccessAnalyzerClient", Macie2: "Macie2Client",
  NetworkFirewall: "NetworkFirewallClient", Shield: "ShieldClient",
  ACM: "ACMClient", APIGateway: "APIGatewayClient",
  CognitoIdentityServiceProvider: "CognitoIdentityProviderClient",
  EventBridge: "EventBridgeClient", StepFunctions: "SFNClient",
  ElastiCache: "ElastiCacheClient", Redshift: "RedshiftClient",
  DynamoDB: "DynamoDBClient", Route53: "Route53Client",
  ELBv2: "ElasticLoadBalancingV2Client", AutoScaling: "AutoScalingClient",
};

async function loadAwsModule(service: string): Promise<any> {
  if (_awsModuleCache[service]) return _awsModuleCache[service];
  const pkg = _awsSvcMap[service];
  if (!pkg) throw new Error(`Unsupported AWS service: ${service}`);
  const specifier = "npm:@aws-sdk/client-" + pkg + "@3.744.0";
  const mod = await import(specifier);
  _awsModuleCache[service] = mod;
  return mod;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, commandName, config, params } = await req.json();

    if (!service || !commandName) {
      return new Response(JSON.stringify({ error: "service and commandName are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mod = await loadAwsModule(service);
    const clientName = V3_CLIENT_NAMES[service] || `${service}Client`;
    const ClientClass = mod[clientName];
    if (!ClientClass) throw new Error(`Client '${clientName}' not found for service '${service}'`);

    const CommandClass = mod[commandName];
    if (!CommandClass) throw new Error(`Command '${commandName}' not found for service '${service}'`);

    const client = new ClientClass({ ...config, maxAttempts: 4 });
    const result = await client.send(new CommandClass(params || {}));
    const { $metadata, ...data } = result as any;

    return new Response(JSON.stringify({ result: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[aws-executor] Error:", e.name, e.message);
    return new Response(JSON.stringify({
      error: e.message || "Execution failed",
      name: e.name || "Error",
      code: e.code || e.name || "UNKNOWN",
      statusCode: e.$metadata?.httpStatusCode || e.statusCode || 500,
    }), {
      status: 200, // Return 200 so caller can parse error details
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
