import { resolve } from "node:path";

export function res(...args: string[]): string {
  return resolve(process.cwd(), ...args);
}
