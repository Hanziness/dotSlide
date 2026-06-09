import { defineConfig } from "vite";

export default defineConfig((env) => ({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: 'index',
      formats: ["es"],
    },
    sourcemap: env.isPreview,
    minify: 'oxc',
    rolldownOptions: {
        external: [/^@dotslide\//, /^lit/, /^@lit\//]
    }
  }
}));
