export {};

const resultServer = await Bun.build({
  entrypoints: ["src/index.ts"],
  target: "bun",
  outdir: "./dist",
  format: "esm",
});

const resultClient = await Bun.build({
  entrypoints: ["src/client.ts"],
  target: "browser",
  outdir: "./dist",
  format: "esm",
});

if (!resultServer.success) {
  throw new Error("Failed to build server app", { cause: resultServer });
}

if (!resultClient.success) {
  throw new Error("Failed to build server client", { cause: resultClient });
}
