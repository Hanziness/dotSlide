import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    port: { type: "string", default: "9876" },
    pin: { type: "string" },
  },
  allowPositionals: true,
});

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const config = {
  port: Number.parseInt(values.port ?? "3000", 10),
  pin: values.pin ?? generatePin(),
  /** Path to the built presentation (dist/ directory) */
  presentationDir: positionals[0] ?? "./presentation",
};
