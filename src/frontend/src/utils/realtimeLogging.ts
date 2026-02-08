import { POLLING_CONFIG } from '../config/polling';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEvent {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

class RealtimeLogger {
  private enabled: boolean;
  private level: LogLevel;

  constructor() {
    this.enabled = POLLING_CONFIG.logging.enabled;
    this.level = POLLING_CONFIG.logging.level;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;
    
    // Remove sensitive data
    const sanitized = { ...context };
    const sensitiveKeys = ['token', 'authorization', 'password', 'secret', 'jwt'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const event: LogEvent = {
      level,
      message,
      timestamp: Date.now(),
      context: this.sanitizeContext(context),
    };

    const prefix = `[RealTime:${level.toUpperCase()}]`;
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    
    if (event.context) {
      logFn(prefix, message, event.context);
    } else {
      logFn(prefix, message);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  // Lifecycle events
  logConnect(): void {
    this.info('Real-time service connected');
  }

  logDisconnect(reason?: string): void {
    this.warn('Real-time service disconnected', { reason });
  }

  logRetry(attempt: number, delay: number): void {
    this.info('Retrying connection', { attempt, delayMs: delay });
  }

  logReadingReceived(count: number): void {
    this.debug('Readings received', { count });
  }

  logError(error: unknown, category: 'unauthorized' | 'network' | 'parse' | 'unknown'): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error(`Error (${category})`, { message, category });
  }
}

export const realtimeLogger = new RealtimeLogger();
