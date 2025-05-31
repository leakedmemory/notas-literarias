import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { res, IS_DEV, TARGET } from "./utils";

const OUT_DIR = res("dist", IS_DEV ? "dev" : "prod", TARGET);
const ICON_SIZES = [16, 32, 48, 64, 96, 128];

(function main() {
  copyManifest();
  copyIcons();
})();

function copyManifest() {
  try {
    const src = res("platforms", TARGET, "manifest.json");
    const dest = join(OUT_DIR, "manifest.json");

    if (!existsSync(src)) {
      console.error(`manifest not found for ${TARGET}: ${src}`);
      return;
    }

    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    copyFileSync(src, dest);
    console.log(`successfully copied manifest for ${TARGET}`);
  } catch (error) {
    console.error(`error copying manifest for ${TARGET}: ${error}`);
  }
}

function copyIcons() {
  try {
    const srcDir = res("icons");
    const destDir = join(OUT_DIR, "icons");

    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    for (const size of ICON_SIZES) {
      const iconFilename = `icon-${size}x${size}.png`;
      const src = join(srcDir, iconFilename);
      const dest = join(destDir, iconFilename);

      if (!existsSync(src)) {
        console.warn(`icon not found: ${src}`);
        continue;
      }

      copyFileSync(src, dest);
      console.log(`copied ${iconFilename} for ${TARGET}`);
    }

    console.log(
      `successfully copied ${ICON_SIZES.length} icon files to ${destDir}`,
    );
  } catch (error) {
    console.error(`copying icons: ${error}`);
  }
}
