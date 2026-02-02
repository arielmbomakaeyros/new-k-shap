import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.log(`[${this.getTimestamp()}] [LOG] [${ctx}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    const ctx = context || this.context || 'Application';
    console.error(`[${this.getTimestamp()}] [ERROR] [${ctx}] ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.warn(`[${this.getTimestamp()}] [WARN] [${ctx}] ${message}`);
  }

  debug(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.debug(`[${this.getTimestamp()}] [DEBUG] [${ctx}] ${message}`);
  }

  verbose(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.log(`[${this.getTimestamp()}] [VERBOSE] [${ctx}] ${message}`);
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }
}
