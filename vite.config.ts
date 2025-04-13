import { defineConfig } from "vite";
import { resolve } from "node:path";
import { copyFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";

function copyManifestPlugin() {
  return {
    name: "copy-manifest",
    buildStart: async () => {
      try {
        mkdirSync("dist", { recursive: true });
        await copyFile("manifests/firefox.json", "dist/manifest.json");
        console.log("Copied manifest.json to dist/");
      } catch (error) {
        console.error("Failed to copy manifest file:", error);
      }
    },
  };
}

function htmlLoaderPlugin() {
  return {
    name: "html-loader",
    transform(code, id) {
      if (id.endsWith(".html")) {
        return `export default ${JSON.stringify(code)};`;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  mode: "development",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: "inline",

    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/background.ts"),
        content: resolve(__dirname, "src/content/content.ts"),
      },
      output: {
        entryFileNames: "[name].bundle.js",
        format: "iife",
      },
    },

    minify: false,
  },

  plugins: [copyManifestPlugin(), htmlLoaderPlugin()],

  resolve: {
    extensions: [".ts", ".js"],
  },

  server: {
    open: false,
  },
});
