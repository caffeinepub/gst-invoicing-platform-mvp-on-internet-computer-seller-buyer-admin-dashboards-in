import React, { createContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { ExternalEnergyReading } from '../backend';
import { realTimeEnergyService } from '../services/realTimeEnergyService';
import { liveReadingsApi } from '../services/liveReadingsApi';
import { useActor } from '../hooks/useActor';
import { POLLING_CONFIG } from '../config/polling';
import type { LiveTelemetryState, ConnectionStatus, RollingAverages, MetricFreshness } from '../types/liveTelemetry';

type LiveTelemetryContextType = LiveTelemetryState;

export const LiveTelemetryContext = createContext<LiveTelemetryContextType | undefined>(undefined);

interface LiveTelemetryProviderProps {
  children: ReactNode;
}

export function LiveTelemetryProvider({ children }: LiveTelemetryProviderProps) {
  const { actor } = useActor();
  const [latest, setLatest] = useState<ExternalEnergyReading | null>(null);
  const [rollingWindow, setRollingWindow] = useState<ExternalEnergyReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [freshness, setFreshness] = useState<MetricFreshness | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Update actor in API client when it changes
  useEffect(() => {
    liveReadingsApi.setActor(actor);
  }, [actor]);

  // Calculate rolling averages from window
  const calculateRollingAverages = useCallback((window: ExternalEnergyReading[]): RollingAverages | null => {
    if (window.length === 0) return null;

    const sum = window.reduce(
      (acc, reading) => ({
        appliancePowerUsage: acc.appliancePowerUsage + reading.appliancePowerUsage,
        solarGeneration: acc.solarGeneration + reading.solarGeneration,
        batteryChargeLevel: acc.batteryChargeLevel + reading.batteryChargeLevel,
        gridImport: acc.gridImport + reading.gridImport,
        gridExport: acc.gridExport + reading.gridExport,
      }),
      {
        appliancePowerUsage: 0,
        solarGeneration: 0,
        batteryChargeLevel: 0,
        gridImport: 0,
        gridExport: 0,
      }
    );

    const count = window.length;
    return {
      appliancePowerUsage: sum.appliancePowerUsage / count,
      solarGeneration: sum.solarGeneration / count,
      batteryChargeLevel: sum.batteryChargeLevel / count,
      gridImport: sum.gridImport / count,
      gridExport: sum.gridExport / count,
    };
  }, []);

  // Handle incoming readings
  const handleReadings = useCallback(
    (readings: ExternalEnergyReading[]) => {
      if (readings.length === 0) return;

      // Sort by timestamp
      const sorted = [...readings].sort((a, b) => Number(a.timestamp - b.timestamp));

      // Update latest
      const mostRecent = sorted[sorted.length - 1];
      setLatest(mostRecent);

      // Update rolling window
      setRollingWindow(prev => {
        const updated = [...prev, ...sorted];
        // Keep only the most recent N readings
        return updated.slice(-POLLING_CONFIG.rollingWindowSize);
      });

      // Update freshness
      const now = Date.now();
      setFreshness({
        appliancePowerUsage: now,
        solarGeneration: now,
        batteryChargeLevel: now,
        gridImport: now,
        gridExport: now,
      });

      setLastUpdated(now);
    },
    []
  );

  // Subscribe to real-time service
  useEffect(() => {
    if (!actor) {
      // Reset state when actor is not available
      setLatest(null);
      setRollingWindow([]);
      setConnectionStatus('DISCONNECTED');
      setFreshness(null);
      setLastUpdated(null);
      return;
    }

    const unsubscribe = realTimeEnergyService.subscribe(handleReadings);

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(realTimeEnergyService.getStatus());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [actor, handleReadings]);

  // Calculate rolling averages
  const rollingAverages = calculateRollingAverages(rollingWindow);

  const value: LiveTelemetryContextType = {
    latest,
    rollingAverages,
    connectionStatus,
    freshness,
    lastUpdated,
  };

  return <LiveTelemetryContext.Provider value={value}>{children}</LiveTelemetryContext.Provider>;
}
