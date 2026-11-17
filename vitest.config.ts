import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias @/ identique à tsconfig.json, pour les tests.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
