const PREFIX = "BOOK RATINGS";

module.exports = {
  /**
   * Logs `msg` with the extension's prefix.
   *
   * @param {string} msg - Message to be logged.
   */
  log(msg) {
    console.log(`${PREFIX}: ${msg}`);
  },

  /**
   * Logs `msg` with the extension's prefix at "error" level.
   *
   * @param {string} msg - Error message to be logged.
   */
  error(msg) {
    console.error(`${PREFIX}: ${msg}`);
  },
};
