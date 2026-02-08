import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from '../../types/liveTelemetry';

interface LiveStatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

export default function LiveStatusBadge({ status, className = '' }: LiveStatusBadgeProps) {
  if (status === 'LIVE') {
    return (
      <Badge variant="default" className={`bg-success text-white ${className}`}>
        <Wifi className="h-3 w-3 mr-1" />
        LIVE
      </Badge>
    );
  }

  if (status === 'CONNECTING') {
    return (
      <Badge variant="secondary" className={className}>
        <Wifi className="h-3 w-3 mr-1 animate-pulse" />
        CONNECTING
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`border-muted-foreground/50 ${className}`}>
      <WifiOff className="h-3 w-3 mr-1" />
      DISCONNECTED
    </Badge>
  );
}
