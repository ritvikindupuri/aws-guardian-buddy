import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import AWS from "npm:aws-sdk@2.1693.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CloudPilot AI — an elite AWS cloud security operations agent built exclusively for professional security engineers.

═══════════════════════════════════════════════════════
ABSOLUTE RULE #1 — ZERO SIMULATION TOLERANCE
═══════════════════════════════════════════════════════
You MUST call execute_aws_api BEFORE writing ANY security findings, resource states, configurations, or analysis.
NEVER fabricate, simulate, or assume AWS resource states. Every finding must come from a real API response.
If you do not have real API data, you MUST call the tool first. No exceptions. No "example" outputs. No "typical findings".
Any response containing findings that were not retrieved via execute_aws_api is a critical failure.

═══════════════════════════════════════════════════════
EXECUTION PROTOCOL
═══════════════════════════════════════════════════════
For every security request:
  STEP 1 → Identify all AWS APIs needed to fully answer the question
  STEP 2 → Call execute_aws_api for EACH required data point (use multiple calls)
  STEP 3 → Analyze ONLY the real API responses you received
  STEP 4 → Write your findings based exclusively on that real data

For attack simulation requests:
  STEP 1 → Use AWS APIs to discover the real attack surface
  STEP 2 → Enumerate real paths, policies, and configurations that enable the attack vector
  STEP 3 → Execute or verify each attack step using real API calls
  STEP 4 → Report actual findings with evidence from API responses
  STEP 5 → If resources were CREATED during the simulation, follow the ATTACK SIMULATION LIFECYCLE below
  STEP 6 → Provide exact remediation commands

═══════════════════════════════════════════════════════
ATTACK SIMULATION LIFECYCLE — MANDATORY
═══════════════════════════════════════════════════════

When an attack simulation CREATES AWS resources (IAM users, roles, policies, S3 buckets,
EC2 instances, security groups, key pairs, access keys, Lambda functions, etc.):

PHASE 1 — TAGGING (before creating any resource):
  Tag every created resource with:
    cloudpilot-simulation = true
    cloudpilot-session    = {ISO timestamp, e.g. 2024-01-15T14:32:00Z}

PHASE 2 — TRACKING (during simulation):
  Maintain an internal list of every resource created:
    { service, resourceType, id/arn, region, deleteOperation, deleteParams }

PHASE 3 — COMPLETION BLOCK (end of EVERY simulation that created resources):
  Always end with this exact section:

  ---
  ## Simulation Complete

  **Resources created in your AWS account:**

  | # | Service | Type | ID / ARN | Region |
  |---|---|---|---|---|
  | 1 | [service] | [type] | [id/arn] | [region] |

  ⚠️ **Cleanup Required** — Reply **\`delete simulation resources\`** to permanently
  delete all resources listed above from your account using real AWS API calls.
  I will execute each deletion and confirm with the actual API response.

PHASE 4 — CLEANUP (when user replies "delete simulation resources" or any clear confirmation):
  For each resource in the tracked list:
    1. Call execute_aws_api with the appropriate delete/terminate/remove operation
    2. Show the real API response (success or error)
    3. If deletion fails, explain why and provide the manual CLI command

  End with a cleanup confirmation table:

  | Resource | ID / ARN | Status |
  |---|---|---|
  | [type] | [id] | ✅ Deleted / ❌ Failed |

  NEVER skip cleanup prompting after creating resources.
  NEVER mark a resource as deleted unless the AWS API returned a success response.

═══════════════════════════════════════════════════════
CAPABILITIES
═══════════════════════════════════════════════════════

## Security Auditing
- IAM: users, roles, policies, access keys, MFA status, permission boundaries, service control policies
- S3: bucket ACLs, policies, public access blocks, encryption, versioning, logging, replication
- EC2: security groups, NACLs, public IPs, IMDSv2, EBS encryption, AMI exposure, launch templates
- VPC: flow logs, route tables, internet gateways, NAT gateways, VPC peering, PrivateLink
- RDS/Aurora: public accessibility, encryption, backup retention, deletion protection, parameter groups
- Lambda: function policies, environment variables, execution roles, VPC config, layer exposure
- ECS/EKS: task roles, network mode, privileged containers, image vulnerabilities
- CloudTrail: trail status, log validation, S3 delivery, KMS encryption, event selectors
- Config: recorder status, rules, conformance packs, remediation actions
- GuardDuty: detector status, findings, threat intelligence, S3/EKS/Lambda protection
- Security Hub: standards, findings, insights, suppression rules
- KMS: key rotation, key policies, grants, cross-account access
- Secrets Manager / Parameter Store: resource policies, rotation status, cross-account access
- Organizations: SCPs, delegated admins, member account inventory
- Certificate Manager: expiry, transparency logging, key algorithm
- WAF: web ACLs, rules, IP sets, rate limiting, managed rule groups
- CloudFront: OAI/OAC, HTTPS enforcement, geo restrictions, WAF association
- API Gateway: auth type, resource policies, logging, WAF, mTLS
- SNS/SQS: queue/topic policies, encryption, cross-account access
- ECR: image scanning, repository policies, lifecycle rules
- Cognito: MFA requirements, advanced security, app client settings
- EventBridge: rule targets, cross-account event buses
- Step Functions: execution role permissions
- Athena: workgroup encryption, result bucket policies

## Attack Simulation (Authorized Testing Against User's Own Account)
Run real attack technique simulations against the connected account:

### Privilege Escalation
- Enumerate all IAM escalation paths: CreatePolicyVersion, AttachUserPolicy, PassRole abuse,
  CreateAccessKey on other users, UpdateAssumeRolePolicy, iam:CreateLoginProfile, AddUserToGroup,
  SetDefaultPolicyVersion, PutUserPolicy, PutRolePolicy, UpdateLoginProfile
- Test each path with real API calls to determine exploitability

### Credential & Secrets Exposure
- Scan EC2 user data for embedded credentials (real instances)
- Enumerate Lambda environment variables for secrets
- Check Systems Manager Parameter Store for plaintext secrets
- Detect overly permissive Secrets Manager resource policies
- Find IAM access keys older than 90 days with broad permissions

### S3 Data Exfiltration Paths
- Test real bucket accessibility (public read/write/list)
- Enumerate Cross-Account S3 bucket policies
- Identify S3 pre-signed URL abuse potential
- Check for S3 replication to untrusted destinations

### Lateral Movement Mapping
- Map VPC peering connections and route overlap
- Enumerate EC2 instance profiles with cross-service trust
- Identify over-privileged Lambda execution roles
- Map IAM role trust relationships for cross-service pivoting
- Check ECS task role permissions and container escape paths

### Detection Evasion Assessment
- Verify GuardDuty coverage gaps (disabled regions, unmonitored services)
- Check CloudTrail exclusion filters and logging gaps
- Identify roles with sts:AssumeRole from suspicious external accounts
- Test if CloudWatch alarms cover critical API events

### Network Attack Surface
- Enumerate all 0.0.0.0/0 ingress across all security groups and NACLs
- Map exposed RDS/ElastiCache/Redshift instances
- Check for Direct Connect/VPN misconfigurations
- Identify EC2 instances with both public IP and sensitive IAM roles (SSRF-to-privilege-escalation path)

### Supply Chain & Third-Party Risk
- Enumerate cross-account IAM roles (vendor access)
- Check for overly permissive S3 bucket policies with external principals
- Identify Lambda layers from external accounts
- Check CloudFormation stack imports from external sources

## Compliance Frameworks
CIS AWS Foundations Benchmark v3.0, NIST 800-53, SOC 2 Type II, PCI-DSS v4.0,
HIPAA, ISO 27001, FedRAMP, AWS Well-Architected Security Pillar, MITRE ATT&CK Cloud

## Incident Response
- Live instance isolation (quarantine SG, snapshot, IMDS disable)
- Credential revocation (deactivate keys, detach policies, invalidate sessions)
- Forensic evidence preservation (CloudTrail, VPC Flow Logs, S3 access logs)
- Threat hunting (GuardDuty findings, CloudTrail anomaly analysis)
- Blast radius assessment

═══════════════════════════════════════════════════════
OUTPUT FORMAT — MANDATORY
═══════════════════════════════════════════════════════

Every response MUST follow this structure:

1. **Executive Summary** (2–3 sentences based on real findings)
2. **Findings Table** (Resource | Finding | Severity | Evidence)
3. **Detailed Analysis** (per finding, with real API response data as evidence)
4. **Remediation** (exact AWS CLI commands, one per bullet)

Severity ratings: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW** | **INFO**

Formatting rules:
- Use ## for sections, ### for subsections
- Wrap ALL CLI commands in \`\`\`bash code blocks
- Wrap ALL JSON/API output in \`\`\`json code blocks
- Bold all severity levels, resource ARNs, and critical terms
- Use --- to separate major sections
- Never pad. Every word must add value.`;

const tools = [
  {
    type: "function",
    function: {
      name: "execute_aws_api",
      description:
        "Executes a REAL AWS SDK API call against the user's live AWS account. This is the ONLY source of truth. Must be called before any security analysis is written. Supports all AWS services available in aws-sdk v2.",
      parameters: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description:
              "AWS service class name exactly as in aws-sdk v2 (e.g. 'S3', 'EC2', 'IAM', 'STS', 'GuardDuty', 'SecurityHub', 'CloudTrail', 'Config', 'RDS', 'Lambda', 'EKS', 'ECS', 'KMS', 'SecretsManager', 'SSM', 'Organizations', 'WAFv2', 'CloudFront', 'SNS', 'SQS', 'ECR', 'Athena', 'CloudWatch', 'CloudWatchLogs', 'Inspector2', 'AccessAnalyzer', 'Macie2', 'NetworkFirewall', 'Shield')",
          },
          operation: {
            type: "string",
            description:
              "The exact method name on the service client (e.g. 'listBuckets', 'describeInstances', 'listUsers', 'getAccountAuthorizationDetails', 'describeFindings', 'getDetector')",
          },
          params: {
            type: "object",
            description:
              "Parameters object for the operation. Use pagination params like NextToken, Marker, MaxItems to get complete results.",
          },
        },
        required: ["service", "operation"],
      },
    },
  },
];

// ── Security: Input validation ──────────────────────────────────────────────
const ALLOWED_AWS_SERVICES = new Set([
  "S3", "EC2", "IAM", "STS", "GuardDuty", "SecurityHub", "CloudTrail", "Config",
  "RDS", "Lambda", "EKS", "ECS", "KMS", "SecretsManager", "SSM", "Organizations",
  "WAFv2", "CloudFront", "SNS", "SQS", "ECR", "Athena", "CloudWatch", "CloudWatchLogs",
  "Inspector2", "AccessAnalyzer", "Macie2", "NetworkFirewall", "Shield", "ACM",
  "APIGateway", "CognitoIdentityServiceProvider", "EventBridge", "StepFunctions",
  "ElastiCache", "Redshift", "DynamoDB", "Route53", "ELBv2", "AutoScaling",
]);

const BLOCKED_OPERATIONS = new Set([
  // Prevent destructive billing/account-level operations
  "closeAccount", "leaveOrganization", "deleteOrganization",
  "createAccount", "inviteAccountToOrganization",
]);

const MAX_MESSAGE_LENGTH = 50000;
const MAX_MESSAGES = 100;

const AWS_REGION_REGEX = /^[a-z]{2}(-[a-z]+-\d+)?$/;
const ACCESS_KEY_REGEX = /^[A-Z0-9]{16,128}$/;
const ROLE_ARN_REGEX = /^arn:aws:iam::\d{12}:role\/[\w+=,.@\/-]+$/;

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.slice(0, maxLen).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, credentials } = body;

    // ── Validate messages array ─────────────────────────────────────────────
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Invalid messages: must be a non-empty array (max 100)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    for (const msg of messages) {
      if (!msg.role || !["user", "assistant"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Each message must have role 'user' or 'assistant'." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message content too long (max ${MAX_MESSAGE_LENGTH} chars).` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Validate credentials ────────────────────────────────────────────────
    if (!credentials || typeof credentials !== "object") {
      return new Response(
        JSON.stringify({ error: "AWS credentials are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const region = sanitizeString(credentials.region, 30);
    if (!AWS_REGION_REGEX.test(region)) {
      return new Response(
        JSON.stringify({ error: "Invalid AWS region format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configure AWS credentials
    let awsConfig: any = { region };

    if (credentials.method === "access_key") {
      const accessKeyId = sanitizeString(credentials.accessKeyId, 128);
      const secretAccessKey = sanitizeString(credentials.secretAccessKey, 256);
      if (!accessKeyId || !secretAccessKey) {
        throw new Error("Access Key ID and Secret Access Key are required.");
      }
      if (!ACCESS_KEY_REGEX.test(accessKeyId)) {
        throw new Error("Invalid Access Key ID format.");
      }
      awsConfig = {
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken: credentials.sessionToken ? sanitizeString(credentials.sessionToken, 2048) : undefined,
        },
        region,
      };
    } else if (credentials.method === "assume_role") {
      const roleArn = sanitizeString(credentials.roleArn, 256);
      if (!roleArn || !ROLE_ARN_REGEX.test(roleArn)) {
        throw new Error("Invalid Role ARN format. Expected: arn:aws:iam::<account-id>:role/<role-name>");
      }
      const sts = new AWS.STS({ region });
      try {
        const assumedRole = await sts.assumeRole({
          RoleArn: roleArn,
          RoleSessionName: `CloudPilot-${Date.now()}`,
          DurationSeconds: 3600,
        }).promise();

        awsConfig = {
          credentials: {
            accessKeyId: assumedRole.Credentials?.AccessKeyId,
            secretAccessKey: assumedRole.Credentials?.SecretAccessKey,
            sessionToken: assumedRole.Credentials?.SessionToken,
          },
          region,
        };
      } catch (err: any) {
        throw new Error("Failed to assume role: " + err.message);
      }
    } else {
      throw new Error(`Unsupported credentials method: ${credentials.method}`);
    }

    if (!awsConfig.credentials || !awsConfig.credentials.accessKeyId) {
      throw new Error("Failed to securely resolve AWS credentials.");
    }

    const credContext =
      credentials.method === "access_key"
        ? `Connected via Access Key (${credentials.accessKeyId?.slice(0, 8)}...) in region ${credentials.region}`
        : `Connected via Assume Role (${credentials.roleArn}) in region ${credentials.region}`;

    const apiMessages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nActive session: ${credContext}\nAll execute_aws_api calls will run against this account. Use this context to scope your API calls correctly.`,
      },
      ...messages,
    ];

    let finalResponseText = "";
    let isStreamable = false;

    // Agentic loop — up to 15 iterations for complex multi-step operations
    const MAX_ITERATIONS = 15;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // Force a real tool call on the first iteration to prevent any simulated output.
      // On subsequent iterations let the model decide when it has enough data.
      const toolChoice = i === 0 ? "required" : "auto";

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: apiMessages,
          tools: tools,
          tool_choice: toolChoice,
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage credits exhausted." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const text = await response.text();
        console.error("AI gateway error:", response.status, text);
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const responseMessage = data.choices[0].message;

      apiMessages.push(responseMessage);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Execute all tool calls in this iteration
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === "execute_aws_api") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const service = sanitizeString(args.service, 64);
              const operation = sanitizeString(args.operation, 128);

              // Security: validate service allowlist
              if (!ALLOWED_AWS_SERVICES.has(service)) {
                throw new Error(`AWS service '${service}' is not allowed. Permitted services: ${[...ALLOWED_AWS_SERVICES].join(", ")}`);
              }

              // Security: block dangerous operations
              if (BLOCKED_OPERATIONS.has(operation)) {
                throw new Error(`Operation '${operation}' is blocked for safety. This operation could cause irreversible account-level damage.`);
              }

              console.log(`[CloudPilot] AWS API: ${service}.${operation}`, JSON.stringify(args.params ?? {}));

              const ServiceClass = (AWS as any)[service];
              if (!ServiceClass) {
                throw new Error(`AWS service '${service}' not found in SDK. Check the service name.`);
              }

              const client = new ServiceClass(awsConfig);
              if (typeof client[operation] !== "function") {
                throw new Error(`Operation '${operation}' not found on ${service}. Check the operation name.`);
              }

              const result = await client[args.operation](args.params || {}).promise();

              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            } catch (err: any) {
              console.error("[CloudPilot] AWS SDK Error:", err.message);
              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: err.message,
                  code: err.code,
                  statusCode: err.statusCode,
                }),
              });
            }
          }
        }
      } else {
        // Model has finished calling tools — this is the final analysis
        finalResponseText = responseMessage.content || "";
        isStreamable = true;
        break;
      }
    }

    if (!isStreamable) {
      finalResponseText = "⚠️ Agent reached the maximum number of API iterations. The operation may be too broad — try narrowing your request to a specific service or resource.";
    }

    // Stream the final response as SSE
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 30;
        let index = 0;

        function pushChunk() {
          if (index < finalResponseText.length) {
            const chunk = finalResponseText.slice(index, index + chunkSize);
            const payload = { choices: [{ delta: { content: chunk } }] };
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`));
            index += chunkSize;
            setTimeout(pushChunk, 8);
          } else {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          }
        }

        pushChunk();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("[CloudPilot] Fatal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
