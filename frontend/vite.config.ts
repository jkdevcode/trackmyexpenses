import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { githubPagesSpa } from "@sctg/vite-plugin-github-pages-spa";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths(), tailwindcss(), githubPagesSpa()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    sourcemap: mode !== "production",
    cssCodeSplit: true,
  },
}));
