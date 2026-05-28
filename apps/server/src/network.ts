import * as os from "node:os";

const PRIVATE_HOST_PATTERNS = [
  "localhost",
  "127.0.0.1",
  "[::1]",
  "*.local",
  "10.*.*.*",
  "172.16.*.*",
  "172.17.*.*",
  "172.18.*.*",
  "172.19.*.*",
  "172.20.*.*",
  "172.21.*.*",
  "172.22.*.*",
  "172.23.*.*",
  "172.24.*.*",
  "172.25.*.*",
  "172.26.*.*",
  "172.27.*.*",
  "172.28.*.*",
  "172.29.*.*",
  "172.30.*.*",
  "172.31.*.*",
  "192.168.*.*",
] as const;

/**
 * Detect the first non-internal IPv4 address for this machine.
 */
export function getLocalIP(): string {
  const interfaces = Object.values(os.networkInterfaces()).flat();
  const local = interfaces.find((i) => i?.family === "IPv4" && !i?.internal);
  return local?.address ?? "localhost";
}

/**
 * Build an origin string from a host and port.
 */
export function buildOrigin(
  hostname: string,
  port: number,
  protocol = "http",
): string {
  return `${protocol}://${hostname}:${port}`;
}

/**
 * Build a URL by swapping the port on an existing URL.
 */
export function replacePort(url: string, port: number): string {
  const next = new URL(url);
  next.port = port.toString();
  return next.toString();
}

/**
 * Return true when an origin belongs to localhost or this machine's LAN IP.
 *
 * This is useful for development setups where the browser may run on a
 * different port, but still on the same host/network.
 */
export function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = normalizeHostname(parsed.hostname);
    const localIP = getLocalIP();

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === localIP
    );
  } catch {
    return false;
  }
}

/**
 * Return allowed host patterns for Better Auth baseURL host validation.
 */
export function getLocalHostPatterns(port: number): string[] {
  return PRIVATE_HOST_PATTERNS.map((pattern) => `${pattern}:${port}`);
}

/**
 * Return trusted origin patterns for local browser origins.
 */
export function getLocalOriginPatterns(port: number): string[] {
  return PRIVATE_HOST_PATTERNS.flatMap((pattern) => [
    `http://${pattern}:${port}`,
    `https://${pattern}:${port}`,
  ]);
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");
}
