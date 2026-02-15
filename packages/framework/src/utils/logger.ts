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

const noop = (..._args: unknown[]) => void 0;

const bindLog = (level: LogLevel) => {
  const method = console[level];
  if (typeof method !== "function") {
    return noop;
  }

  return method.bind(
    console,
    "%c[dotslide] %c",
    levelStyles[level],
    contentStyle,
  );
};

export const logger = {
  debug: shouldLogDev ? bindLog("debug") : noop,
  info: shouldLogDev ? bindLog("info") : noop,
  log: shouldLogDev ? bindLog("log") : noop,
  warn: bindLog("warn"),
  error: bindLog("error"),
};
