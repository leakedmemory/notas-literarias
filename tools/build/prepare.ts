import { copyFile as fsCopyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { res, isDev, target } from "./utils";

(function main() {
  copyManifest();
})();

async function copyManifest() {
  try {
    const outDir = `dist/${isDev ? "dev" : "prod"}/${target}`;
    const manifestSrc = res("manifests", `${target}.json`);
    const manifestDest = res(outDir, "manifest.json");

    if (!existsSync(manifestSrc)) {
      console.error(`manifest not found for ${target}: ${manifestSrc}`);
      return;
    }

    const destDir = dirname(manifestDest);
    if (!existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
      console.log(`created directory: ${destDir}`);
    }

    await fsCopyFile(manifestSrc, manifestDest);
    console.log(`successfully copied manifest for ${target}`);
  } catch (error) {
    console.error(`error copying manifest for ${target}: ${error}`);
  }
}
