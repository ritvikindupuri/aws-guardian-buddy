import { Activity, Clock, Wifi, WifiOff } from "lucide-react";

interface StatusBarProps {
  isConnected: boolean;
  region: string;
  messageCount: number;
}

const StatusBar = ({ isConnected, region, messageCount }: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-muted/40 border-t border-border text-[10px] font-mono text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              <span className="text-primary">connected</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span>no credentials</span>
            </>
          )}
        </div>
        {isConnected && (
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            <span>{region}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {messageCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{messageCount} msg{messageCount !== 1 ? "s" : ""}</span>
          </div>
        )}
        <span className="text-muted-foreground/50">CloudPilot AI</span>
      </div>
    </div>
  );
};

export default StatusBar;
