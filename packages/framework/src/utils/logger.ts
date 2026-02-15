type LogLevel = "debug" | "info" | "log" | "warn" | "error";

const levelStyles: Record<LogLevel, string> = {
  debug:
    "color: #d1d5db; background-color: #111827; border-radius: 2px; padding: 2px 4px; font-weight: bold;",
  info: "color: #bfdbfe; background-color: #1d4ed8; border-radius: 2px; padding: 2px 4px; font-weight: bold;",
  log: "color: #e5e7eb; background-color: #374151; border-radius: 2px; padding: 2px 4px; font-weight: bold;",
  warn: "color: #f97316; border-radius: 2px; padding: 2px 4px; font-weight: bold;",
  error:
    "color: #f87171; border-radius: 2px; padding: 2px 4px; font-weight: bold;",
};

const contentStyle =
  "color: inherit; background-color: transparent; font-weight: normal;";

const shouldLogDev = Boolean(import.meta.env.DEV);

const printLog = (level: LogLevel, args: unknown[]) => {
  const method = console[level] as typeof console.log;
  if (typeof method !== "function") {
    return;
  }

  method("%c[dotslide] %c", levelStyles[level], contentStyle, ...args);
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (!shouldLogDev) {
      return;
    }

    printLog("debug", args);
  },
  info: (...args: unknown[]) => {
    if (!shouldLogDev) {
      return;
    }

    printLog("info", args);
  },
  log: (...args: unknown[]) => {
    if (!shouldLogDev) {
      return;
    }

    printLog("log", args);
  },
  warn: (...args: unknown[]) => {
    printLog("warn", args);
  },
  error: (...args: unknown[]) => {
    printLog("error", args);
  },
};
