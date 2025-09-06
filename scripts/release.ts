import { execSync } from "node:child_process";
import { readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chromiumManifest from "../platforms/chromium/manifest.json";
import firefoxManifest from "../platforms/firefox/manifest.json";
import { res } from "./utils";

const OUT_DIR = res("dist", "prod");
const SIGN_TIMEOUT = 600000; // 10 minutos

(function main() {
  checkCurrentBranch();
  checkStatus();

  const version = bumpVersion();
  commit(`chore: aumenta versão para ${version}`);
  execCommand("pnpm run changelog");
  commit("doc: atualiza changelog");
  execCommand(`git tag v${version} -m "versão ${version}"`);
  execCommand("pnpm run build");
  execCommand("pnpm run pack");
  signFirefox(version);
})();

function checkCurrentBranch() {
  const branch = execCommand("git rev-parse --abbrev-ref HEAD");
  if (branch !== "main") {
    throw new Error("not in main branch");
  }
}

function checkStatus() {
  const status = execCommand("git status --porcelain");
  if (status) {
    throw new Error("there are uncommitted changes");
  }
}

function bumpVersion(): string {
  const version = getBumpedVersion();
  updateManifestsVersions(version);
  return version;
}

function getBumpedVersion(): string {
  const args = "pnpm git-cliff --bumped-version -c .cliff.toml";
  const version = execCommand(args);
  return version.slice(1);
}

function updateManifestsVersions(version: string) {
  const firefoxPath = res("platforms", "firefox", "manifest.json");
  const chromiumPath = res("platforms", "chromium", "manifest.json");

  firefoxManifest.version = version;
  chromiumManifest.version = version;

  writeFileSync(firefoxPath, JSON.stringify(firefoxManifest, null, 2));
  writeFileSync(chromiumPath, JSON.stringify(chromiumManifest, null, 2));
}

function signFirefox(version: string) {
  if (!process.env.WEB_EXT_API_KEY || !process.env.WEB_EXT_API_SECRET) {
    console.log(
      "skipping firefox signing: AMO credentials not found in environment",
    );
    return;
  }

  const signCommand = [
    "web-ext sign",
    `--source-dir ${join(OUT_DIR, "firefox")}`,
    `--artifacts-dir ${OUT_DIR}`,
    `--api-key ${process.env.WEB_EXT_API_KEY}`,
    `--api-secret ${process.env.WEB_EXT_API_SECRET}`,
    "--channel unlisted",
    `--timeout ${SIGN_TIMEOUT}`,
  ].join(" ");
  execCommand(signCommand);
  renameSignedFile(version);
}

function renameSignedFile(version: string) {
  const xpiFiles = readdirSync(OUT_DIR).filter((file) => file.endsWith(".xpi"));
  if (xpiFiles.length !== 2) {
    throw new Error(`more than 2 .xpi files found in ${OUT_DIR}`);
  }

  const unsignedFileName = `notas-literarias-firefox-unsigned-${version}.xpi`;
  const unsignedIndex = xpiFiles.indexOf(unsignedFileName);
  if (unsignedIndex === -1) {
    throw new Error(`unsigned file ${unsignedFileName} not found`);
  }

  xpiFiles.splice(unsignedIndex, 1);

  const newName = `notas-literarias-firefox-signed-${version}.xpi`;
  const newPath = join(OUT_DIR, newName);
  const originalPath = join(OUT_DIR, xpiFiles[0]);
  renameSync(originalPath, newPath);
}

function commit(msg: string) {
  execCommand(`git add --all && git commit -m "${msg}"`);
}

function execCommand(args: string): string {
  return execSync(args, { encoding: "utf-8" }).trim();
}
