// Polling and streaming configuration for real-time telemetry
export const POLLING_CONFIG = {
  // Polling interval for live energy readings (milliseconds)
  liveReadingsPollInterval: 5000, // 5 seconds
  
  // Exponential backoff configuration for reconnection
  backoff: {
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    multiplier: 2,
    jitter: 0.1, // 10% random jitter
  },
  
  // Throttle window for batching updates to UI (milliseconds)
  throttleWindow: 500, // 500ms
  
  // Maximum number of readings to keep in rolling window for averages
  rollingWindowSize: 20,
  
  // Maximum payload size for incremental fetch (number of readings)
  maxIncrementalReadings: 100,
  
  // Logging configuration
  logging: {
    enabled: import.meta.env.DEV, // Enable in development, disable in production
    level: 'info' as 'debug' | 'info' | 'warn' | 'error',
  },
};
