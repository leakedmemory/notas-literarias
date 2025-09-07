import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
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

function commit(msg: string) {
  execCommand(`git add --all && git commit -m "${msg}"`);
}

function execCommand(args: string): string {
  return execSync(args, { encoding: "utf-8" }).trim();
}
