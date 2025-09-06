import { resolve } from "node:path";

import packageJson from "../package.json";

export const TARGETS = ["firefox", "chromium"];
export const TARGET = process.env.BROWSER || "firefox";
export const IS_DEV = process.env.NODE_ENV !== "prod";
export const PACKAGE_NAME = packageJson.name;
export const VERSION = packageJson.version;

export const SECONDS_IN_MS = 1000;
export const MINUTES_IN_MS = 60 * SECONDS_IN_MS;

export function res(...args: string[]): string {
  return resolve(process.cwd(), ...args);
}
