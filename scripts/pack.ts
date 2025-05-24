import { createWriteStream, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

import archiver from "archiver";

import { res, VERSION, TARGETS } from "./utils";

const OUT_DIR = res("dist", "prod");

(async function main() {
  for (const target of TARGETS) {
    const targetDir = resolve(OUT_DIR, target);
    if (existsSync(targetDir)) {
      await packExtension(target, targetDir);
    } else {
      console.log(`build for target ${target} not found`);
    }
  }
})();

async function packExtension(target: string, srcDir: string) {
  let outputFile: string;
  if (target === "firefox") {
    outputFile = resolve(
      OUT_DIR,
      `notas-literarias-${target}-unsigned-${VERSION}.xpi`,
    );
  } else {
    outputFile = resolve(OUT_DIR, `notas-literarias-${target}-${VERSION}.zip`);
  }

  console.log(`packaging ${target} extension to ${outputFile}...`);

  const output = createWriteStream(outputFile);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(
      `successfully created ${target} package: ${archive.pointer()} total bytes`,
    );
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  const files = await readdir(srcDir, { recursive: true });
  for (const f of files) {
    const filePath = resolve(srcDir, f.toString());
    const archivePath = f.toString();
    archive.file(filePath, { name: archivePath });
  }

  await archive.finalize();
}
