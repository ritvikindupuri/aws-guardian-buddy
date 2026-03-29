import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { STSClient, GetCallerIdentityCommand, GetSessionTokenCommand, AssumeRoleCommand } from "npm:@aws-sdk/client-sts@3.744.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AWS_REGION_REGEX = /^[a-z]{2}(-[a-z]+-\d+)?$/;
const ACCESS_KEY_REGEX = /^[A-Z0-9]{16,128}$/;
const ROLE_ARN_REGEX = /^arn:aws:iam::\d{12}:role\/[\w+=,.@/-]+$/;

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return val.slice(0, maxLen).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credentials } = await req.json();

    if (!credentials || typeof credentials !== "object") {
      return new Response(
        JSON.stringify({ error: "AWS credentials are required." }),
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

    let tempCredentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken: string;
      expiration: string;
    };
    let identity: { account: string; arn: string; userId: string };

    if (credentials.method === "access_key") {
      const accessKeyId = sanitizeString(credentials.accessKeyId, 128);
      const secretAccessKey = sanitizeString(credentials.secretAccessKey, 256);

      if (!accessKeyId || !secretAccessKey) {
        return new Response(
          JSON.stringify({ error: "Access Key ID and Secret Access Key are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!ACCESS_KEY_REGEX.test(accessKeyId)) {
        return new Response(
          JSON.stringify({ error: "Invalid Access Key ID format." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sts = new STSClient({
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken: credentials.sessionToken
            ? sanitizeString(credentials.sessionToken, 2048)
            : undefined,
        },
        region,
      });

      // Validate by calling getCallerIdentity
      const callerIdentity = await sts.send(new GetCallerIdentityCommand({}));
      identity = {
        account: callerIdentity.Account || "",
        arn: callerIdentity.Arn || "",
        userId: callerIdentity.UserId || "",
      };

      // Exchange for temporary session token
      const sessionData = await sts.send(new GetSessionTokenCommand({ DurationSeconds: 3600 }));

      if (!sessionData.Credentials || !sessionData.Credentials.AccessKeyId || !sessionData.Credentials.SecretAccessKey || !sessionData.Credentials.SessionToken || !sessionData.Credentials.Expiration) {
        throw new Error("Failed to obtain temporary session credentials.");
      }

      tempCredentials = {
        accessKeyId: sessionData.Credentials.AccessKeyId,
        secretAccessKey: sessionData.Credentials.SecretAccessKey,
        sessionToken: sessionData.Credentials.SessionToken,
        expiration: sessionData.Credentials.Expiration.toISOString(),
      };
    } else if (credentials.method === "assume_role") {
      const roleArn = sanitizeString(credentials.roleArn, 256);
      if (!roleArn || !ROLE_ARN_REGEX.test(roleArn)) {
        return new Response(
          JSON.stringify({
            error:
              "Invalid Role ARN format. Expected: arn:aws:iam::<account-id>:role/<role-name>",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For assume role, we need either base credentials or rely on the edge function's own role
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stsConfig: any = { region };
      if (credentials.accessKeyId && credentials.secretAccessKey) {
        stsConfig.credentials = {
          accessKeyId: sanitizeString(credentials.accessKeyId, 128),
          secretAccessKey: sanitizeString(credentials.secretAccessKey, 256),
          sessionToken: credentials.sessionToken
            ? sanitizeString(credentials.sessionToken, 2048)
            : undefined,
        };
      }

      const sts = new STSClient(stsConfig);
      const assumedRole = await sts.send(new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: `CloudPilot-${Date.now()}`,
        DurationSeconds: 3600,
      }));

      if (!assumedRole.Credentials || !assumedRole.Credentials.AccessKeyId || !assumedRole.Credentials.SecretAccessKey || !assumedRole.Credentials.SessionToken || !assumedRole.Credentials.Expiration) {
        throw new Error("Failed to assume role.");
      }

      // Get identity from assumed role
      const assumedSts = new STSClient({
        credentials: {
          accessKeyId: assumedRole.Credentials.AccessKeyId,
          secretAccessKey: assumedRole.Credentials.SecretAccessKey,
          sessionToken: assumedRole.Credentials.SessionToken,
        },
        region,
      });
      const callerIdentity = await assumedSts.send(new GetCallerIdentityCommand({}));
      identity = {
        account: callerIdentity.Account || "",
        arn: callerIdentity.Arn || "",
        userId: callerIdentity.UserId || "",
      };

      tempCredentials = {
        accessKeyId: assumedRole.Credentials.AccessKeyId,
        secretAccessKey: assumedRole.Credentials.SecretAccessKey,
        sessionToken: assumedRole.Credentials.SessionToken,
        expiration: assumedRole.Credentials.Expiration.toISOString(),
      };
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported credentials method: ${credentials.method}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Pre-Flight IAM Boundary Checks ---
    const iam = new AWS.IAM({
      credentials: {
        accessKeyId: tempCredentials.accessKeyId,
        secretAccessKey: tempCredentials.secretAccessKey,
        sessionToken: tempCredentials.sessionToken,
      },
      region,
    });

    const actionsToTest = [
      "s3:ListAllMyBuckets",
      "ec2:DescribeInstances",
      "iam:ListUsers",
      "cloudtrail:DescribeTrails",
      "guardduty:ListDetectors",
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

    const permissions: Record<string, boolean> = {};

    try {
      const simResult = await iam.simulatePrincipalPolicy({
        PolicySourceArn: identity.arn,
        ActionNames: actionsToTest,
      }).promise();

      if (simResult.EvaluationResults) {
        simResult.EvaluationResults.forEach((result) => {
          if (result.EvalActionName) {
            permissions[result.EvalActionName] = result.EvalDecision === "allowed";
          }
        });
      }
    } catch (e) {
      console.warn("SimulatePrincipalPolicy failed", e);
      // If we cannot simulate, we just return empty or false
      actionsToTest.forEach(action => {
        permissions[action] = false;
      });
    }
    // --------------------------------------

    return new Response(
      JSON.stringify({
        sessionCredentials: {
          accessKeyId: tempCredentials.accessKeyId,
          secretAccessKey: tempCredentials.secretAccessKey,
          sessionToken: tempCredentials.sessionToken,
          expiration: tempCredentials.expiration,
          region,
        },
        identity,
        permissions,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message = err.message || "Credential validation failed.";
    const isAccessDenied =
      err.code === "AccessDeniedException" ||
      err.code === "AccessDenied" ||
      err.statusCode === 403;

    return new Response(
      JSON.stringify({
        error: isAccessDenied
          ? `Access Denied: ${message}. Ensure your IAM user/role has sts:GetCallerIdentity and sts:GetSessionToken permissions.`
          : message,
      }),
      {
        status: isAccessDenied ? 403 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
