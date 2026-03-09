import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ['./src/db/auth.ts', './src/db/dotslide.ts'],
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "sqlite.db",
  },
});
