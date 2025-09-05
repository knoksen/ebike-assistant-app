// Lightweight logger with level control and lazy formatting
// Usage: import { log } from './logger'; log.debug('msg', data)

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  level: LogLevel;
  setLevel: (lvl: LogLevel) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const levelOrder: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const currentLevel: LogLevel = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LOG_LEVEL) || 'info';

function createLogger(): Logger {
  let level: LogLevel = currentLevel as LogLevel;
  const should = (lvl: LogLevel) => levelOrder[level] >= levelOrder[lvl];
  return {
    level,
    setLevel: (l: LogLevel) => { level = l; },
  /* eslint-disable no-console */
  error: (...args) => should('error') && console.error('[EBIKE]', ...args),
  warn: (...args) => should('warn') && console.warn('[EBIKE]', ...args),
  info: (...args) => should('info') && console.log('[EBIKE]', ...args),
  debug: (...args) => should('debug') && console.debug('[EBIKE]', ...args)
  };
}

export const log = createLogger();
