import { copyFile, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { res, IS_DEV, TARGET } from "./utils";

const OUT_DIR = res("dist", IS_DEV ? "dev" : "prod", TARGET);
const ICON_SIZES = [16, 32, 48, 64, 96, 128];

(async function main() {
  await copyManifest();
  await copyIcons();
})();

async function copyManifest() {
  try {
    const src = res("platforms", TARGET, "manifest.json");
    const dest = res(OUT_DIR, "manifest.json");

    if (!existsSync(src)) {
      console.error(`manifest not found for ${TARGET}: ${src}`);
      return;
    }

    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    await copyFile(src, dest);
    console.log(`successfully copied manifest for ${TARGET}`);
  } catch (error) {
    console.error(`error copying manifest for ${TARGET}: ${error}`);
  }
}

async function copyIcons() {
  try {
    const srcDir = res("icons");
    const destDir = res(OUT_DIR, "icons");

    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    for (const size of ICON_SIZES) {
      const iconFilename = `icon-${size}x${size}.png`;
      const src = res(srcDir, iconFilename);
      const dest = res(destDir, iconFilename);

      if (!existsSync(src)) {
        console.warn(`icon not found: ${src}`);
        continue;
      }

      await copyFile(src, dest);
      console.log(`copied ${iconFilename} for ${TARGET}`);
    }

    console.log(
      `successfully copied ${ICON_SIZES.length} icon files to ${destDir}`,
    );
  } catch (error) {
    console.error(`copying icons: ${error}`);
  }
}
