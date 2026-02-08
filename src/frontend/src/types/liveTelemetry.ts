import type { Time } from '../backend';

// Connection status for real-time telemetry
export type ConnectionStatus = 'LIVE' | 'DISCONNECTED' | 'CONNECTING';

// Canonical live reading structure matching backend
export interface LiveEnergyReading {
  appliancePowerUsage: number; // Watts
  solarGeneration: number; // kW
  batteryChargeLevel: number; // Percentage (0-100)
  gridImport: number; // kWh
  gridExport: number; // kWh
  timestamp: Time;
  source: string;
}

// Per-metric freshness timestamps
export interface MetricFreshness {
  appliancePowerUsage: number; // JS timestamp
  solarGeneration: number;
  batteryChargeLevel: number;
  gridImport: number;
  gridExport: number;
}

// Rolling average values computed from recent window
export interface RollingAverages {
  appliancePowerUsage: number;
  solarGeneration: number;
  batteryChargeLevel: number;
  gridImport: number;
  gridExport: number;
}

// Complete telemetry state
export interface LiveTelemetryState {
  latest: LiveEnergyReading | null;
  rollingAverages: RollingAverages | null;
  connectionStatus: ConnectionStatus;
  freshness: MetricFreshness | null;
  lastUpdated: number | null; // JS timestamp
}
