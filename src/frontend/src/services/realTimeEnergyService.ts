import type { ExternalEnergyReading, Time } from '../backend';
import { POLLING_CONFIG } from '../config/polling';
import { liveReadingsApi, LiveReadingsApiError } from './liveReadingsApi';
import { realtimeLogger } from '../utils/realtimeLogging';

type ConnectionStatus = 'LIVE' | 'DISCONNECTED' | 'CONNECTING';
type Subscriber = (readings: ExternalEnergyReading[]) => void;

export class RealTimeEnergyService {
  private subscribers: Set<Subscriber> = new Set();
  private status: ConnectionStatus = 'DISCONNECTED';
  private pollIntervalId: number | null = null;
  private lastSeenTimestamp: Time | null = null;
  private retryCount = 0;
  private retryTimeoutId: number | null = null;
  private pendingUpdates: ExternalEnergyReading[] = [];
  private throttleTimeoutId: number | null = null;

  constructor() {
    // Service is ready but not started
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    
    // Start polling when first subscriber is added
    if (this.subscribers.size === 1 && this.status === 'DISCONNECTED') {
      this.start();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      
      // Stop polling when last subscriber is removed
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  private emit(readings: ExternalEnergyReading[]): void {
    if (readings.length === 0) return;

    // Add to pending updates
    this.pendingUpdates.push(...readings);

    // Throttle emissions
    if (this.throttleTimeoutId !== null) {
      return; // Already scheduled
    }

    this.throttleTimeoutId = window.setTimeout(() => {
      const batch = [...this.pendingUpdates];
      this.pendingUpdates = [];
      this.throttleTimeoutId = null;

      // Emit to all subscribers
      this.subscribers.forEach(callback => {
        try {
          callback(batch);
        } catch (error) {
          realtimeLogger.error('Subscriber callback error', { error });
        }
      });
    }, POLLING_CONFIG.throttleWindow);
  }

  private async poll(): Promise<void> {
    try {
      if (this.lastSeenTimestamp === null) {
        // First poll - get latest reading
        const latest = await liveReadingsApi.getLatestReadings();
        if (latest) {
          this.lastSeenTimestamp = latest.timestamp;
          this.emit([latest]);
          this.onConnectSuccess();
        }
      } else {
        // Incremental poll - get readings since last seen
        const readings = await liveReadingsApi.getReadingsSince(this.lastSeenTimestamp);
        
        if (readings.length > 0) {
          // Update last seen timestamp to the most recent reading
          const sortedReadings = [...readings].sort((a, b) => 
            Number(a.timestamp - b.timestamp)
          );
          this.lastSeenTimestamp = sortedReadings[sortedReadings.length - 1].timestamp;
          
          this.emit(readings);
          this.onConnectSuccess();
        }
      }
    } catch (error) {
      this.onPollError(error);
    }
  }

  private onConnectSuccess(): void {
    if (this.status !== 'LIVE') {
      this.status = 'LIVE';
      this.retryCount = 0;
      realtimeLogger.logConnect();
    }
  }

  private onPollError(error: unknown): void {
    const wasLive = this.status === 'LIVE';
    this.status = 'DISCONNECTED';

    if (wasLive) {
      const reason = error instanceof LiveReadingsApiError ? error.category : 'unknown';
      realtimeLogger.logDisconnect(reason);
    }

    // Schedule retry with exponential backoff
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    if (this.retryTimeoutId !== null) {
      return; // Already scheduled
    }

    const { initialDelay, maxDelay, multiplier, jitter } = POLLING_CONFIG.backoff;
    
    // Calculate delay with exponential backoff
    let delay = initialDelay * Math.pow(multiplier, this.retryCount);
    delay = Math.min(delay, maxDelay);
    
    // Add jitter
    const jitterAmount = delay * jitter * (Math.random() * 2 - 1);
    delay = Math.max(0, delay + jitterAmount);

    this.retryCount++;
    realtimeLogger.logRetry(this.retryCount, delay);

    this.retryTimeoutId = window.setTimeout(() => {
      this.retryTimeoutId = null;
      this.poll();
    }, delay);
  }

  start(): void {
    if (this.pollIntervalId !== null) {
      return; // Already started
    }

    this.status = 'CONNECTING';
    realtimeLogger.info('Starting real-time service');

    // Initial poll
    this.poll();

    // Set up polling interval
    this.pollIntervalId = window.setInterval(() => {
      this.poll();
    }, POLLING_CONFIG.liveReadingsPollInterval);
  }

  stop(): void {
    realtimeLogger.info('Stopping real-time service');

    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    if (this.throttleTimeoutId !== null) {
      clearTimeout(this.throttleTimeoutId);
      this.throttleTimeoutId = null;
    }

    this.status = 'DISCONNECTED';
    this.lastSeenTimestamp = null;
    this.retryCount = 0;
    this.pendingUpdates = [];
  }

  reset(): void {
    this.stop();
    this.lastSeenTimestamp = null;
    this.retryCount = 0;
  }
}

export const realTimeEnergyService = new RealTimeEnergyService();
