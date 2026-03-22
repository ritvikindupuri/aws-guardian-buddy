import CloudPilotLogo from "@/components/CloudPilotLogo";

const ThinkingIndicator = () => {
  return (
    <div className="animate-fade-in-up flex gap-3 px-5 py-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
          <CloudPilotLogo className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </div>
      <div className="rounded-xl px-5 py-4 bg-card border border-border/60 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[11px] font-mono text-muted-foreground tracking-wide">Agent is thinking...</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
