import type { backendInterface, ExternalEnergyReading, Time } from '../backend';
import { realtimeLogger } from '../utils/realtimeLogging';

export class LiveReadingsApiError extends Error {
  constructor(
    message: string,
    public category: 'unauthorized' | 'network' | 'parse' | 'unknown',
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'LiveReadingsApiError';
  }
}

export class LiveReadingsApi {
  private actor: backendInterface | null = null;

  setActor(actor: backendInterface | null): void {
    this.actor = actor;
  }

  async getLatestReadings(): Promise<ExternalEnergyReading | null> {
    if (!this.actor) {
      throw new LiveReadingsApiError('Actor not available', 'network');
    }

    try {
      const result = await this.actor.getLatestReadings();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Categorize error
      let category: 'unauthorized' | 'network' | 'parse' | 'unknown' = 'unknown';
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('permission')) {
        category = 'unauthorized';
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
        category = 'network';
      } else if (message.toLowerCase().includes('parse') || message.toLowerCase().includes('json')) {
        category = 'parse';
      }

      realtimeLogger.logError(error, category);
      throw new LiveReadingsApiError(message, category, error);
    }
  }

  async getReadingsSince(timestamp: Time): Promise<ExternalEnergyReading[]> {
    if (!this.actor) {
      throw new LiveReadingsApiError('Actor not available', 'network');
    }

    try {
      const result = await this.actor.getReadingsSince(timestamp);
      realtimeLogger.logReadingReceived(result.length);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Categorize error
      let category: 'unauthorized' | 'network' | 'parse' | 'unknown' = 'unknown';
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('permission')) {
        category = 'unauthorized';
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
        category = 'network';
      } else if (message.toLowerCase().includes('parse') || message.toLowerCase().includes('json')) {
        category = 'parse';
      }

      realtimeLogger.logError(error, category);
      throw new LiveReadingsApiError(message, category, error);
    }
  }
}

export const liveReadingsApi = new LiveReadingsApi();
