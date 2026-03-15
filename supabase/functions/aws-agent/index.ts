import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import AWS from "npm:aws-sdk@2.1693.0";

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

IMPORTANT: You now have access to a real AWS environment via the \`execute_aws_api\` tool. When the user asks you to perform an AWS action, you must use this tool to execute actual AWS API calls. Do NOT simulate output. Analyze the user's request, use the tool to query their real AWS account, and then provide a detailed, realistic assessment based on the actual API response.

The \`execute_aws_api\` tool accepts three parameters:
- \`service\`: The AWS service name (e.g. "S3", "EC2", "IAM")
- \`operation\`: The operation to perform (e.g. "listBuckets", "describeInstances", "listUsers")
- \`params\`: An optional object containing parameters for the operation (e.g. { "MaxItems": 10 })

Use the tool as many times as necessary to gather the required information before providing your final response.

Always think like a security engineer:
- Assume breach mentality
- Follow principle of least privilege
- Prioritize findings by risk
- Provide actionable remediation`;

const tools = [
  {
    type: "function",
    function: {
      name: "execute_aws_api",
      description: "Executes an AWS SDK API call against the user's connected AWS account.",
      parameters: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "The AWS service name (e.g. 'S3', 'EC2', 'IAM')",
          },
          operation: {
            type: "string",
            description: "The AWS operation to perform (e.g. 'listBuckets', 'describeInstances')",
          },
          params: {
            type: "object",
            description: "Optional parameters for the operation (e.g. { MaxItems: 10 })",
          },
        },
        required: ["service", "operation"],
      },
    },
  },
];

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

    // Configure AWS credentials (do not use AWS.config.update to avoid global state pollution)
    let awsConfig: any = { region: credentials.region };

    if (credentials.method === "access_key") {
      if (!credentials.accessKeyId || !credentials.secretAccessKey) {
        throw new Error("Access Key ID and Secret Access Key are required for access_key method.");
      }
      awsConfig = {
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
        region: credentials.region,
      };
    } else if (credentials.method === "assume_role") {
      if (!credentials.roleArn) {
        throw new Error("Role ARN is required for assume_role method.");
      }
      const sts = new AWS.STS({ region: credentials.region });
      try {
        const assumedRole = await sts.assumeRole({
          RoleArn: credentials.roleArn,
          RoleSessionName: "CloudSecAgentSession"
        }).promise();

        awsConfig = {
          credentials: {
            accessKeyId: assumedRole.Credentials?.AccessKeyId,
            secretAccessKey: assumedRole.Credentials?.SecretAccessKey,
            sessionToken: assumedRole.Credentials?.SessionToken,
          },
          region: credentials.region,
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

    // Add credential context to system prompt
    const credContext = credentials.method === "access_key"
      ? `User connected via Access Key (${credentials.accessKeyId?.slice(0, 8)}...) in region ${credentials.region}`
      : `User connected via Assume Role (${credentials.roleArn}) in region ${credentials.region}`;

    const apiMessages = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nCredential context: ${credContext}` },
      ...messages,
    ];

    let finalResponseText = "";
    let isStreamable = false;

    // Agentic Loop (max 5 iterations to prevent infinite loops)
    const MAX_ITERATIONS = 5;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
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
          stream: false, // Don't stream during tool usage loop
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

      const data = await response.json();
      const responseMessage = data.choices[0].message;

      apiMessages.push(responseMessage);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === "execute_aws_api") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log(`Executing AWS API: ${args.service}.${args.operation}`, args.params);

              const ServiceClass = (AWS as any)[args.service];
              if (!ServiceClass) {
                throw new Error(`AWS Service '${args.service}' not found in SDK`);
              }

              const client = new ServiceClass(awsConfig);
              if (typeof client[args.operation] !== "function") {
                throw new Error(`Operation '${args.operation}' not found on AWS service '${args.service}'`);
              }

              // Promisify the AWS SDK call
              const result = await client[args.operation](args.params || {}).promise();

              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            } catch (err: any) {
              console.error("AWS SDK Error:", err);
              apiMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: err.message }),
              });
            }
          }
        }
      } else {
        // No tool calls, we have the final text response
        finalResponseText = responseMessage.content || "";
        isStreamable = true;
        break;
      }
    }

    if (!isStreamable) {
       finalResponseText = "Agent reached maximum iterations without completing the task.";
    }

    // Wrap the final response text in an SSE stream to keep frontend compatibility
    const stream = new ReadableStream({
      start(controller) {
        // Send a few chunks for the final message to simulate streaming
        const chunkSize = 20;
        let index = 0;

        function pushChunk() {
          if (index < finalResponseText.length) {
            const chunk = finalResponseText.slice(index, index + chunkSize);
            const payload = {
              choices: [
                {
                  delta: { content: chunk }
                }
              ]
            };
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`));
            index += chunkSize;
            setTimeout(pushChunk, 10);
          } else {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            controller.close();
          }
        }

        pushChunk();
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("aws-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});