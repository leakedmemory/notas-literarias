const PREFIX = "BOOK RATINGS";

const logger = {
  /** Logs `msg` with the extension's prefix. */
  log(msg: string) {
    console.log(`${PREFIX}: ${msg}`);
  },

  /** Logs `msg` with the extension's prefix at "error" level. */
  error(msg: string | Error) {
    console.error(`${PREFIX}: ${msg}`);
  },
};

export default logger;
