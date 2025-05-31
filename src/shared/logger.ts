import dayjs from "dayjs";

const PREFIX = "NOTAS LITERARIAS";
const DATETIME_FORMAT = "HH:mm:ss";

function now(): string {
  return dayjs().format(DATETIME_FORMAT);
}

const logger = {
  log(msg: string) {
    console.log(`[${now()}] ${PREFIX}: ${msg}`);
  },

  info(msg: string) {
    console.info(`[${now()}] ${PREFIX}: ${msg}`);
  },

  warn(msg: string) {
    console.warn(`[${now()}] ${PREFIX}: ${msg}`);
  },

  error(msg: string) {
    console.warn(`[${now()}] ${PREFIX}: ${msg}`);
  },

  debug(msg: string) {
    console.debug(`[${now()}] ${PREFIX}: ${msg}`);
  },

  pretty(obj: object, name = "obj") {
    console.debug(
      `[${now()}] ${PREFIX}: ${name} = ${JSON.stringify(obj, null, 2)}`,
    );
  },
};

export default logger;
