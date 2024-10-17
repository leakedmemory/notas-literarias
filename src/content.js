const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

const logger = {
  prefix: "BOOK RATINGS",

  /**
   * Logs `msg` with the extension's prefix.
   *
   * @param {string} msg - Message to be logged.
   */
  log(msg) {
    console.log(`${this.prefix}: ${msg}`);
  },

  /**
   * Logs `msg` with the extension's prefix at "error" level.
   *
   * @param {string} msg - Error message to be logged.
   */
  error(msg) {
    console.error(`${this.prefix}: ${msg}`);
  },
};

const product_details = Array.from(
  document
    .querySelectorAll("#detailBullets_feature_div > ul > li > span > span")
    .values(),
);

(async function main() {
  if (product_details.length > 1 && isKindle()) {
    logger.log(`found book with ${getASIN()} ASIN code`);
  } else if (product_details.length > 1 && isPrinted()) {
    logger.log(`found book with ${getISBN()} ISBN-13 code`);
  } else {
    logger.log("product is not a book");
  }
})();

/**
 * @returns {boolean} If it is an ebook or not based on whether it has an ASIN code.
 */
function isKindle() {
  return product_details[ASIN_INDEX - 1].innerText === "ASIN  : ";
}

/**
 * @returns {string} ASIN code of the ebook.
 */
function getASIN() {
  return product_details[ASIN_INDEX].innerText;
}

/**
 * @returns {boolean} If it is a printed book or not based on whether it has an ISBN-13 code.
 */
function isPrinted() {
  return product_details[ISBN13_INDEX - 1].innerText === "ISBN-13  : ";
}

/**
 * @returns {string} ISBN-13 code of the book.
 */
function getISBN() {
  return product_details[ISBN13_INDEX].innerText;
}
