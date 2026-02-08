import { useContext } from 'react';
import { LiveTelemetryContext } from '../context/LiveTelemetryContext';

export function useLiveTelemetry() {
  const context = useContext(LiveTelemetryContext);
  
  if (!context) {
    throw new Error('useLiveTelemetry must be used within LiveTelemetryProvider');
  }
  
  return context;
}
