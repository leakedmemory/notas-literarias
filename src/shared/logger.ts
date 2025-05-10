import dayjs from "dayjs";

const PREFIX = "NOTAS LITERARIAS";
const DATETIME_FORMAT = "HH:mm:ss";

function now(): string {
  return dayjs().format(DATETIME_FORMAT);
}

const logger = {
  /** Logs `msg` with the extension's prefix. */
  // biome-ignore lint: accept explicit `any` in this case
  log(msg: any) {
    console.log(`[${now()}] ${PREFIX}: ${msg}`);
  },

  /** Logs `msg` with the extension's prefix at "error" level. */
  // biome-ignore lint: accept explicit `any` in this case
  error(msg: any) {
    console.error(`[${now()}] ${PREFIX}: ${msg}`);
  },

  /**
   * Logs `obj`, identified by `name` and at debug level, in JSON format and
   * with the extension's prefix.
   */
  pretty(obj: object, name?: string) {
    console.debug(
      `[${now()}] ${PREFIX}: ${name ?? "obj"} = ${JSON.stringify(obj, null, 2)}`,
    );
  },
};

export default logger;
