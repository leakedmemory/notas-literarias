import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import packageJson from "../package.json";
import chromiumManifest from "../platforms/chromium/manifest.json";
import firefoxManifest from "../platforms/firefox/manifest.json";
import { res } from "./utils";

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
  execCommand("pnpm run pack:source");
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
  updateVersions(version);
  return version;
}

function getBumpedVersion(): string {
  const args = "pnpm git-cliff --bumped-version -c .cliff.toml";
  const version = execCommand(args);
  return version.slice(1);
}

function updateVersions(version: string) {
  const packagePath = res("package.json");
  const firefoxPath = res("platforms", "firefox", "manifest.json");
  const chromiumPath = res("platforms", "chromium", "manifest.json");

  packageJson.version = version;
  firefoxManifest.version = version;
  chromiumManifest.version = version;

  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  writeFileSync(firefoxPath, JSON.stringify(firefoxManifest, null, 2));
  writeFileSync(chromiumPath, JSON.stringify(chromiumManifest, null, 2));
}

function commit(msg: string) {
  execCommand(`git add --all && git commit --no-verify -m "${msg}"`);
}

function execCommand(args: string): string {
  return execSync(args, { encoding: "utf-8" }).trim();
}
