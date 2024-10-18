import browser from "webextension-polyfill";

import logger from "./logger.js";

const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

const product_details = Array.from(
  document
    .querySelectorAll("#detailBullets_feature_div > ul > li > span > span")
    .values(),
);

(function main() {
  if (product_details.length > 1 && isKindle()) {
    logger.log(`found book with ${getASIN()} ASIN code`);
  } else if (product_details.length > 1 && isPrinted()) {
    const isbn = getISBN();
    const message = {
      type: "getRating",
      isbn: isbn,
    };

    logger.log(`found book with ${isbn} ISBN-13 code`);
    browser.runtime.sendMessage(message).then(handleGetRatingMessageResponse);
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

/**
 * @param {{rating: string, err: null} | {rating: null, err: Error}} response
 */
function handleGetRatingMessageResponse(response) {
  if (response.err === null) {
    logger.log(response.rating);
  } else {
    logger.error(response.err);
  }
}
