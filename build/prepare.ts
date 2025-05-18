import { copyFile, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { res, isDev, target } from "./utils";

const OUT_DIR = res("dist", isDev ? "dev" : "prod", target);

(async function main() {
  await copyManifest();
  await copyIcons();
})();

async function copyManifest() {
  try {
    const src = res("platforms", target, "manifest.json");
    const dest = res(OUT_DIR, "manifest.json");

    if (!existsSync(src)) {
      console.error(`manifest not found for ${target}: ${src}`);
      return;
    }

    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    await copyFile(src, dest);
    console.log(`successfully copied manifest for ${target}`);
  } catch (error) {
    console.error(`error copying manifest for ${target}: ${error}`);
  }
}

async function copyIcons() {
  try {
    const src = res("icons");
    const dest = res(OUT_DIR, "icons");

    if (!existsSync(OUT_DIR)) {
      await mkdir(OUT_DIR, { recursive: true });
      console.log(`created directory: ${OUT_DIR}`);
    }

    await cp(src, dest, { recursive: true });
    console.log(`successfully copied icons directory to ${dest}`);
  } catch (error) {
    console.error(`error copying icons directory: ${error}`);
  }
}
