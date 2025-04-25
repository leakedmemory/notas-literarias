import { type UserConfig, mergeConfig } from "vite";

import { res } from "./utils";
import packageJson from "../../package.json";

export const targetBrowser = process.env.BROWSER || "firefox";
export const isDev = process.env.NODE_ENV !== "prod";
export const name = JSON.stringify(packageJson.name);

export const baseConfig: UserConfig = {
  define: {
    __DEV__: isDev,
    __NAME__: name,
    __BROWSER__: JSON.stringify(targetBrowser),
  },
  build: {
    outDir: `dist/${targetBrowser}`,
    emptyOutDir: false,
  },
  optimizeDeps: {
    include: ["webextension-polyfill"],
  },
};

export const devConfig: UserConfig = mergeConfig(baseConfig, {
  mode: "development",
  server: {
    port: 8080,
  },
  build: {
    watch: true,
    sourcemap: "inline",
    minify: false,
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
  },
});

export const prodConfig: UserConfig = mergeConfig(baseConfig, {
  mode: "production",
  build: {
    sourcemap: false,
    minify: "esbuild",
  },
});
