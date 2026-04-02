import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, Shield, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Billing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">Billing & Subscriptions</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Plans that scale with your security team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get complete visibility into your cloud environments without worrying about meter charges.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
          {/* Pro Plan */}
          <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-lg text-xs font-semibold tracking-wider">
              CURRENT PLAN
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="w-6 h-6" />
                <h3 className="text-xl font-bold">Pro</h3>
              </div>
              <p className="text-sm text-muted-foreground">Perfect for individual engineers and small teams.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground text-sm">/ seat / mo</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 flex-1">
              {["Unlimited API Execution", "Basic Policy Sets", "Real-time SSE Streaming", "Single Account Audit", "Email Notifications"].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full mt-8" variant="outline">
              Manage Subscription
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card border-2 border-primary/50 shadow-lg shadow-primary/5 rounded-xl p-8 relative flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">Enterprise</h3>
              </div>
              <p className="text-sm text-muted-foreground">Advanced security operations for large organizations.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-muted-foreground text-sm">/ seat / mo</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 flex-1">
              {[
                "Everything in Pro",
                "SSO & SAML Integration",
                "Cross-Account Role Auditing",
                "Custom Event Policies",
                "Priority Support",
                "Immutable Audit Trails",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              Upgrade to Enterprise
            </Button>
          </div>
        </div>

        <div className="mt-8 bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3 text-sm text-muted-foreground">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p>
            You are currently billed via Stripe. Need custom invoicing or annual contracts? Contact our sales team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Billing;
