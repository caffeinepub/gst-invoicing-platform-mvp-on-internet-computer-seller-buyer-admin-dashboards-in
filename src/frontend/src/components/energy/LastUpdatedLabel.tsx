import { Clock } from 'lucide-react';
import type { ConnectionStatus } from '../../types/liveTelemetry';

interface LastUpdatedLabelProps {
  timestamp: number | null;
  status: ConnectionStatus;
  className?: string;
}

export default function LastUpdatedLabel({ timestamp, status, className = '' }: LastUpdatedLabelProps) {
  if (!timestamp) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Clock className="h-4 w-4" />
        <span>No data yet</span>
      </div>
    );
  }

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  let timeAgo = '';
  if (hours > 0) {
    timeAgo = `${hours}h ago`;
  } else if (minutes > 0) {
    timeAgo = `${minutes}m ago`;
  } else if (seconds > 0) {
    timeAgo = `${seconds}s ago`;
  } else {
    timeAgo = 'just now';
  }

  const isStale = status === 'DISCONNECTED' && diff > 30000; // 30 seconds

  return (
    <div className={`flex items-center gap-2 text-sm ${isStale ? 'text-warning' : 'text-muted-foreground'} ${className}`}>
      <Clock className="h-4 w-4" />
      <span>
        Last updated: {timeAgo}
        {isStale && <span className="ml-1 font-medium">(Stale)</span>}
      </span>
    </div>
  );
}
