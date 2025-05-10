import { resolve } from "node:path";

import packageJson from "../../package.json";

export const target = process.env.BROWSER || "firefox";
export const isDev = process.env.NODE_ENV !== "prod";
export const packageName = JSON.stringify(packageJson.name);

export function res(...args: string[]): string {
  return resolve(process.cwd(), ...args);
}
