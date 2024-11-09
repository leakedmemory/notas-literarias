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
};

export default logger;
