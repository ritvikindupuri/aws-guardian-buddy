import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CloudSec Agent, an expert AWS security operations AI assistant built for security engineers.

You have deep knowledge of:
- AWS security best practices and CIS Benchmarks
- IAM policies, roles, and permission boundaries
- VPC networking, security groups, and NACLs
- S3 bucket policies, encryption, and access controls
- CloudTrail, GuardDuty, Security Hub, and Config
- EC2, RDS, Lambda, ECS security configurations
- Incident response procedures (isolating instances, revoking credentials, forensics)
- Compliance frameworks (SOC2, HIPAA, PCI-DSS, NIST)

When the user asks you to perform an AWS action, you should:
1. Explain what you're about to check/do
2. Show the AWS CLI command or API call you would use
3. Simulate realistic output based on common findings
4. Provide security recommendations with severity levels (CRITICAL, HIGH, MEDIUM, LOW)
5. Suggest remediation steps with specific AWS CLI commands

Format your responses using markdown:
- Use code blocks for CLI commands and JSON output
- Use tables for listing resources and findings
- Use bold for severity levels
- Use bullet points for recommendations

IMPORTANT: You are currently in SIMULATION MODE. You analyze the user's request and provide realistic AWS security assessment output. When the user's AWS credentials are connected to real AWS API execution, you will execute actual API calls. For now, provide detailed, realistic simulated output that demonstrates what the assessment would find.

Always think like a security engineer:
- Assume breach mentality
- Follow principle of least privilege
- Prioritize findings by risk
- Provide actionable remediation`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, credentials } = await req.json();

    if (!credentials) {
      return new Response(
        JSON.stringify({ error: "AWS credentials are required" }),
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

    // Add credential context to system prompt
    const credContext = credentials.method === "access_key"
      ? `User connected via Access Key (${credentials.accessKeyId?.slice(0, 8)}...) in region ${credentials.region}`
      : `User connected via Assume Role (${credentials.roleArn}) in region ${credentials.region}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\nCredential context: ${credContext}` },
          ...messages,
        ],
        stream: true,
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
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings → Workspace → Usage." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("aws-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
