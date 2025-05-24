import dayjs from "dayjs";

const PREFIX = "NOTAS LITERARIAS";
const DATETIME_FORMAT = "HH:mm:ss";

function now(): string {
  return dayjs().format(DATETIME_FORMAT);
}

const logger = {
  // biome-ignore lint: accept explicit `any` in this case
  log(msg: any) {
    console.log(`[${now()}] ${PREFIX}: ${msg}`);
  },

  // biome-ignore lint: accept explicit `any` in this case
  info(msg: any) {
    console.log(`[${now()}] ${PREFIX}: ${msg}`);
  },

  // biome-ignore lint: accept explicit `any` in this case
  warn(msg: any) {
    console.warn(`[${now()}] ${PREFIX}: ${msg}`);
  },

  // biome-ignore lint: accept explicit `any` in this case
  error(msg: any) {
    console.error(`[${now()}] ${PREFIX}: ${msg}`);
  },

  // biome-ignore lint: accept explicit `any` in this case
  debug(msg: any) {
    console.debug(`[${now()}] ${PREFIX}: ${msg}`);
  },

  pretty(obj: object, name = "obj") {
    console.debug(
      `[${now()}] ${PREFIX}: ${name} = ${JSON.stringify(obj, null, 2)}`,
    );
  },
};

export default logger;
