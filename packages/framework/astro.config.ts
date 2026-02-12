import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

export default defineConfig({
  experimental: {
    preserveScriptOrder: true
  },
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
});
