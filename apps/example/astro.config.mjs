// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "0.0.0.0"
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
