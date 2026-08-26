type LogLevel = "debug" | "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug(message: string): void {
    console.debug(formatMessage("debug", message));
  },
  info(message: string): void {
    console.info(formatMessage("info", message));
  },
  warn(message: string): void {
    console.warn(formatMessage("warn", message));
  },
  error(message: string): void {
    console.error(formatMessage("error", message));
  },
};
