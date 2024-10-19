import browser from "webextension-polyfill";

import logger from "./logger.js";

const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

const productDetails = Array.from(
  document
    .querySelectorAll("#detailBullets_feature_div > ul > li > span > span")
    .values(),
);

(function main() {
  if (isKindle()) {
    logger.log(`found book with ${getASIN()} ASIN code`);
  } else if (isPrinted()) {
    const message = {
      type: "getRating",
      site: "goodreads",
      codeFormat: "isbn",
      code: getISBN(),
    };

    logger.log(`found book with ${message.code} ISBN-13 code`);

    insertCustomStyles();

    logger.log(`fetching ${message.site} rating`);
    browser.runtime.sendMessage(message).then((response) => {
      handleGetRatingResponse(message.site, response);
    });
  } else if (isProductPage()) {
    logger.log("product is not a book");
  }
})();

/**
 * @returns {boolean} Whether it is an ebook based on having an ASIN code.
 */
function isKindle() {
  return (
    productDetails.length > ASIN_INDEX &&
    productDetails[ASIN_INDEX - 1].innerText === "ASIN  : "
  );
}

/**
 * @returns {boolean} Whether it is a printed book based on having an ISBN-13 code.
 */
function isPrinted() {
  return (
    productDetails.length > ISBN13_INDEX &&
    productDetails[ISBN13_INDEX - 1].innerText === "ISBN-13  : "
  );
}

/**
 * @returns {boolean} Whether the current page is an amazon product one.
 */
function isProductPage() {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

/**
 * @returns {string} ASIN code of the ebook.
 */
function getASIN() {
  return productDetails[ASIN_INDEX].innerText;
}

/**
 * @returns {string} ISBN-13 code of the book.
 */
function getISBN() {
  return productDetails[ISBN13_INDEX].innerText;
}

/**
 * Modifies the default product page style to better fit other book ratings.
 *
 * @todo Books that are part of a collection for some reason shrink at 1193px
 */
function insertCustomStyles() {
  const css = `
    div#centerAttributesRightColumn {
      min-width: fit-content;
    }

    @media (max-width: 1183px) {
      div#centerAttributesColumns {
        flex-direction: column;
      }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting custom product page styles");
  document.head.appendChild(styleElement);
}

/**
 * Handles the response of a "getRating" message from the background.
 *
 * @param {string} site Site where the rating was obtained.
 * @param {{rating: string, err: null} | {rating: null, err: Error}} response Response from background.
 */
function handleGetRatingResponse(site, response) {
  if (response.err === null) {
    logger.log(`${site} rating: ${response.rating}`);
    insertBookRatingElement(site, response.rating);
  } else {
    logger.error(response.err);
  }
}

/**
 * Inserts `rating` from `site` by copying the rating element of the product
 * page and changing its properties.
 *
 * @todo Current approach still have problems when the book is part of a collection.
 *
 * @param {string} site Site where the rating was obtained.
 * @param {string} rating Rating with 1 decimal place.
 */
function insertBookRatingElement(site, rating) {
  const refElement = document.querySelector(
    "div#averageCustomerReviews_feature_div",
  );

  if (!refElement) {
    logger.error("amazon's rating element not found");
    return;
  }

  // boolean value whether to copy element subtree
  const clonedElement = refElement.cloneNode(true);
  clonedElement.id = `bookratings_${clonedElement.id}`;
  for (const child of clonedElement.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }

  const ratingSpan = clonedElement.querySelector("a > span");
  ratingSpan.innerText = rating;

  const stars = clonedElement.querySelector("a > i");
  const starClass = Array.from(stars.classList)[2];
  stars.classList.replace(starClass, generateStarClass(rating));

  const starsAlt = stars.firstElementChild;
  starsAlt.innerText = `${rating}${starsAlt.innerText.substring(3)}`;

  logger.log(`inserting ${site} rating element`);
  refElement.insertAdjacentElement("afterend", clonedElement);
}

/**
 * Generate the class responsible of controlling how many stars are
 * displayed in the stars element.
 *
 * @param {string} rating Rating with 1 decimal place.
 * @returns {string} Class to add to the stars element.
 */
function generateStarClass(rating) {
  const baseClass = "a-star-";

  // 4.8+ rating does not follow the pattern of half star and
  // goes directly to 5 stars
  if (Number.parseFloat(rating) >= 4.8) {
    return `${baseClass}5`;
  }

  // with half star
  if (Number.parseInt(rating[2]) >= 5) {
    return `${baseClass}${rating[0]}-5`;
  }

  return `${baseClass}${rating[0]}`;
}
