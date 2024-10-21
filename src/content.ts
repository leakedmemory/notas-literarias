import browser from "webextension-polyfill";

import logger from "./logger";
import { type SupportedSite, createGetReviewsMessage } from "./messages";

const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

(function main() {
  if (!isProductPage()) {
    return;
  }

  const details = Array.from(
    document
      .querySelectorAll("#detailBullets_feature_div > ul > li > span > span")
      .values(),
  ) as HTMLSpanElement[];
  if (!details) {
    logger.error("product details section not found");
    return;
  }

  if (isKindle(details)) {
    logger.log(`found book with ${getASIN(details)} ASIN code`);
  } else if (isPrinted(details)) {
    const message = createGetReviewsMessage(
      "goodreads",
      getISBN(details),
      "isbn",
    );

    logger.log(`found book with ${message.code} ISBN-13 code`);
    logger.log(`fetching ${message.site} rating`);

    browser.runtime
      .sendMessage(message)
      .then((response) => {
        handleGetReviewsResponse(message.site, response);
      })
      .catch((err) => {
        logger.error(err);
      });
  } else {
    logger.log("product is not a book");
  }
})();

function isKindle(details: HTMLSpanElement[]): boolean {
  return (
    details.length > ASIN_INDEX &&
    details[ASIN_INDEX - 1].innerText === "ASIN  : "
  );
}

function isPrinted(details: HTMLSpanElement[]): boolean {
  return (
    details.length > ISBN13_INDEX &&
    details[ISBN13_INDEX - 1].innerText === "ISBN-13  : "
  );
}

function isProductPage(): boolean {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

function getASIN(details: HTMLSpanElement[]): string {
  return details[ASIN_INDEX].innerText;
}

function getISBN(details: HTMLSpanElement[]): string {
  return details[ISBN13_INDEX].innerText;
}

type GetReviewsResponse =
  | {
      rating: string;
      err: null;
    }
  | {
      rating: null;
      err: Error;
    };

function handleGetReviewsResponse(site: SupportedSite, response: unknown) {
  const reviewsResponse = response as GetReviewsResponse;

  if (!reviewsResponse.err) {
    logger.log(`${site} rating: ${reviewsResponse.rating}`);

    insertCustomStyles();
    insertBookRatingElement(site, reviewsResponse.rating);
  } else {
    logger.error(reviewsResponse.err);
  }
}

/**
 * Modifies the default product page style to better fit other book ratings.
 *
 * @todo Books that are part of a collection for some reason shrink at 1193px.
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
 * Inserts `rating` from `site` by copying the rating element of the product
 * page and changing its properties.
 *
 * @todo Current approach still have problems when the book is part of a collection.
 *
 * @throws When some element is not found in the DOM.
 */
function insertBookRatingElement(site: SupportedSite, rating: string) {
  /**
   * Element containing the literal rating value, the starts representation,
   * and how many reviews the product has.
   */
  const refElement = document.querySelector(
    "div#averageCustomerReviews_feature_div",
  );
  if (!refElement) {
    throw new Error("rating reference element not found");
  }

  const clonedElement = refElement.cloneNode(true) as HTMLDivElement;
  clonedElement.id = `bookratings_${clonedElement.id}`;
  for (const child of clonedElement.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }

  /** Literal rating value before the stars. */
  const literalRating = clonedElement.querySelector(
    "a > span",
  ) as HTMLSpanElement;
  if (!literalRating) {
    throw new Error("literal rating element not found");
  }

  literalRating.innerText = rating;

  /** Rating's stars representation. */
  const stars = clonedElement.querySelector("a > i") as HTMLElement;
  if (!stars) {
    throw new Error("stars representation element not found");
  }

  /** Class that controls how many stars are filled. */
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.includes("a-star-")) {
    throw new Error("star class not found");
  }

  stars.classList.replace(starsFilledClass, generateStarClass(rating));

  /** Alt representation of the stars, which is a separate element. */
  const starsAlt = stars.firstElementChild as HTMLSpanElement;
  if (!starsAlt) {
    throw new Error("stars alt element not found");
  }

  starsAlt.innerText = `${rating}${starsAlt.innerText.substring(3)}`;

  logger.log(`inserting ${site} rating element`);
  refElement.insertAdjacentElement("afterend", clonedElement);
}

/**
 * Generate the class responsible of controlling how many stars are
 * filled in the stars representation.
 *
 * @returns Class to add to the stars element.
 */
function generateStarClass(rating: string): string {
  const base = "a-star-";

  // 4.8+ rating does not follow the pattern of half star and
  // goes directly to 5 stars
  if (Number.parseFloat(rating) >= 4.8) {
    return `${base}5`;
  }

  // with half star
  if (Number.parseInt(rating[2]) >= 5) {
    return `${base}${rating[0]}-5`;
  }

  return `${base}${rating[0]}`;
}
