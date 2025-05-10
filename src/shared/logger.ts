import dayjs from "dayjs";

const PREFIX = "NOTAS LITERARIAS";
const DATETIME_FORMAT = "HH:mm:ss";

const logger = {
  /** Logs `msg` with the extension's prefix. */
  // biome-ignore lint: accept explicit `any` in this case
  log(msg: any) {
    const now = dayjs().format(DATETIME_FORMAT);
    console.log(`[${now}] ${PREFIX}: ${msg}`);
  },

  /** Logs `msg` with the extension's prefix at "error" level. */
  // biome-ignore lint: accept explicit `any` in this case
  error(msg: any) {
    const now = dayjs().format(DATETIME_FORMAT);
    console.error(`[${now}] ${PREFIX}: ${msg}`);
  },

  /**
   * Logs `obj`, identified by `name`, in JSON format and with
   * the extension's prefix.
   *
   * Should only be used for debugging purposes.
   */
  pretty(obj: object, name?: string) {
    const now = dayjs().format(DATETIME_FORMAT);
    console.debug(
      `[${now}] ${PREFIX}: ${name ?? "obj"} = ${JSON.stringify(obj, null, 2)}`,
    );
  },
};

export default logger;
