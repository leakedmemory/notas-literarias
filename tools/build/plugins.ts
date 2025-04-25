import { copyFile as fsCopyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

import type { PluginOption } from "vite";

import { res } from "./utils";

export function copyFile(src: string, dest: string): PluginOption {
  return {
    name: "copy-file",
    async closeBundle() {
      try {
        if (!existsSync(src)) {
          console.error(`source file not found: ${src}`);
          return;
        }

        const destDir = dirname(dest);
        if (!existsSync(destDir)) {
          await mkdir(destDir, { recursive: true });
          console.log(`created directory: ${destDir}`);
        }

        await fsCopyFile(src, dest);
        console.log(`successfully copied ${src} to ${dest}`);
      } catch (error) {
        console.error(`error copying file from ${src} to ${dest}: ${error}`);
      }
    },
  };
}

/**
 * A Vite plugin that copies browser-specific manifest file to the build output directory
 * Assumes manifests are located at manifests/[browser].json
 * and should be copied to dist/[browser]/manifest.json
 */
export function copyManifest(browser: string): PluginOption {
  return {
    name: "copy-manifest",
    async closeBundle() {
      try {
        const manifestSrc = res("manifests", `${browser}.json`);
        const manifestDest = res("dist", browser, "manifest.json");

        if (!existsSync(manifestSrc)) {
          console.error(`manifest not found for ${browser}: ${manifestSrc}`);
          return;
        }

        const destDir = dirname(manifestDest);
        if (!existsSync(destDir)) {
          await mkdir(destDir, { recursive: true });
          console.log(`created directory: ${destDir}`);
        }

        await fsCopyFile(manifestSrc, manifestDest);
        console.log(`successfully copied manifest for ${browser}`);
      } catch (error) {
        console.error(`error copying manifest for ${browser}: ${error}`);
      }
    },
  };
}
