const PREFIX = "BOOK RATINGS";

const logger = {
  /** Logs `msg` with the extension's prefix. */
  // biome-ignore lint: accept explicit `any` in this case
  log(msg: any) {
    console.log(`${PREFIX}: ${msg}`);
  },

  /** Logs `msg` with the extension's prefix at "error" level. */
  // biome-ignore lint: accept explicit `any` in this case
  error(msg: any) {
    console.error(`${PREFIX}: ${msg}`);
  },

  /**
   * Logs `obj`, identified by `name`, in JSON format and with
   * the extension's prefix.
   *
   * Should only be used for debugging purposes.
   */
  pretty(obj: object, name: string) {
    console.log(`${PREFIX}: ${name} = ${JSON.stringify(obj, null, 2)}`);
  },
};

export default logger;
