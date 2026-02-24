import { defineConfig, presetIcons, presetWind4 } from "unocss";

export default defineConfig({
  cli: {
    entry: [
      {
        patterns: ["src/**/*.astro", "src/index.ts"],
        outFile: "dist/styles.css",
      },
    ],
  },
  content: {
    filesystem: ["src/**/*.astro"],
  },
  presets: [presetWind4({
    preflights: {
      reset: false
    }
  }), presetIcons()],
});
