import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { githubPagesSpa } from "@sctg/vite-plugin-github-pages-spa";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

import _package from "./package.json" with { type: "json" };

/**
 * Package.json type definition for React project
 *
 * Provides TypeScript typing for package.json structure with
 * common fields used in React applications
 */
export type PackageJson = {
  name: string;
  private: boolean;
  version: string;
  type: string;
  scripts: {
    dev: string;
    build: string;
    lint: string;
    preview: string;
    [key: string]: string;
  };
  dependencies: {
    react: string;
    "react-dom": string;
    "react-router-dom": string;
    [key: string]: string;
  };
  devDependencies: {
    typescript: string;
    eslint: string;
    vite: string;
    [key: string]: string;
  };
};

const packageJson: PackageJson = _package;

/**
 * Extract dependencies with a specific vendor prefix
 *
 * @param packageJson - The package.json object
 * @param vendorPrefix - Vendor namespace prefix (e.g. "@heroui")
 * @returns Array of dependency names matching the vendor prefix
 *
 * Used for chunk optimization in the build configuration
 */
export function extractPerVendorDependencies(
  packageJson: PackageJson,
  vendorPrefix: string,
): string[] {
  const dependencies = Object.keys(packageJson.dependencies || {});

  return dependencies.filter((dependency) =>
    dependency.startsWith(`${vendorPrefix}/`),
  );
}

/**
 * Manual chunk strategy focused on long-term cacheability and route-level loading.
 * Splits heavy vendors by domain so users don't download everything on first paint.
 */
function createManualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;

  if (
    id.includes("/react/") ||
    id.includes("/react-dom/") ||
    id.includes("/scheduler/")
  ) {
    return "framework";
  }

  if (id.includes("react-router")) {
    return "router";
  }

  if (id.includes("@tanstack/react-query") || id.includes("/axios/")) {
    return "data";
  }

  if (id.includes("i18next") || id.includes("react-i18next")) {
    return "i18n";
  }

  if (id.includes("framer-motion")) {
    return "motion";
  }

  if (id.includes("recharts") || id.includes("d3-")) {
    return "charts";
  }

  if (id.includes("@sentry/")) {
    return "monitoring";
  }

  if (id.includes("@internationalized/") || id.includes("@react-aria/")) {
    return "ui-aria";
  }

  if (id.includes("@heroui/modal") || id.includes("@heroui/dropdown")) {
    return "ui-overlays";
  }

  if (
    id.includes("@heroui/input") ||
    id.includes("@heroui/select") ||
    id.includes("@heroui/date-picker") ||
    id.includes("@heroui/switch")
  ) {
    return "ui-forms";
  }

  if (
    id.includes("@heroui/table") ||
    id.includes("@heroui/pagination") ||
    id.includes("@heroui/chip")
  ) {
    return "ui-data-display";
  }

  if (id.includes("@heroui/")) {
    return "ui-core";
  }

  return "vendor";
}

/**
 * Vite configuration
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react(), tsconfigPaths(), tailwindcss(), githubPagesSpa()],
    build: {
      // Keep source maps only outside production.
      sourcemap: !isProd,
      assetsInlineLimit: 1024,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true,
      },
      rollupOptions: {
        output: {
          assetFileNames: `assets/${packageJson.name}-[name]-[hash][extname]`,
          entryFileNames: `js/${packageJson.name}-[hash].js`,
          chunkFileNames: `js/${packageJson.name}-[hash].js`,
          manualChunks: createManualChunks,
        },
      },
    },
  };
});
