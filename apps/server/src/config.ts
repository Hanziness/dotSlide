import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    port: { type: "string", default: "9876" },
  },
  allowPositionals: true,
});

export const config = {
  port: Number.parseInt(values.port ?? "3000", 10),
  /** Path to the built presentation (dist/ directory) */
  presentationDir: positionals[0] ?? "./presentation",
};
