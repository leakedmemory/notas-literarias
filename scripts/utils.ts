import { resolve } from "node:path";

import packageJson from "../package.json";

export const TARGETS = ["firefox", "chromium"];
export const TARGET = process.env.BROWSER || "firefox";
export const IS_DEV = process.env.NODE_ENV !== "prod";
export const PACKAGE_NAME = packageJson.name;
export const VERSION = packageJson.version;

export function res(...args: string[]): string {
  return resolve(process.cwd(), ...args);
}
