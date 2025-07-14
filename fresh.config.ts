import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

export default defineConfig({
  plugins: [
    twindPlugin(twindConfig)
  ],
  build: {
    outDir: "./_fresh_prod", // Custom output directory if desired
    target: ["esnext"], // Optional: compile targets
  },
});