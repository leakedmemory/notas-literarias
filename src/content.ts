import browser from "webextension-polyfill";

import logger from "./logger";

import type {
  GetReviewsMessage,
  GetReviewsResponse,
  Reviews,
} from "./messages";

const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

(function main() {
  if (!isProductPage()) {
    return;
  }

  const details = Array.from(
    document.querySelectorAll(
      "div#detailBullets_feature_div > ul > li > span > span",
    ),
  ) as HTMLSpanElement[];
  if (!details) {
    logger.error("product details section not found");
    return;
  }

  if (isKindle(details)) {
    logger.log(`found book with ${getASIN(details)} ASIN code`);
  } else if (isPrinted(details)) {
    const message: GetReviewsMessage = {
      site: "goodreads",
      code: getISBN(details),
      format: "isbn",
    };

    logger.log(`found book with ${message.code} ISBN-13 code`);
    logger.log(`fetching ${message.site} rating`);

    browser.runtime
      .sendMessage(message)
      .then(handleGetReviewsResponse)
      .catch((err) => {
        logger.error(`${err} [while fetching ${message.site} rating]`);
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

function handleGetReviewsResponse(response: unknown) {
  const reviewsResponse = response as GetReviewsResponse;
  if (reviewsResponse.err) {
    throw reviewsResponse.err;
  }

  const reviews = reviewsResponse.reviews;

  logger.log(JSON.stringify(reviews, null, 2)); // NOTE: only for debug
  logger.log(`${reviews.site} rating: ${reviews.rating}`);

  insertBookRatingElement(reviews);
  insertCustomStyles();
}

/**
 * Inserts `reviews` by copying the review element of the product page and
 * changing its properties.
 *
 * @todo Current approach still have problems when the book is part of a collection.
 *
 * @throws When some element is not found in the DOM.
 */
function insertBookRatingElement(reviews: Reviews) {
  /**
   * Element containing the rating value, the starts representation,
   * and how many reviews the product has.
   */
  const reviewElementReference = document.querySelector(
    "div#averageCustomerReviews_feature_div",
  );
  if (!reviewElementReference) {
    throw new Error("rating reference element not found");
  }

  /**
   * Copy to be transformed and inserted.
   */
  const reviewElement = reviewElementReference.cloneNode(
    true,
  ) as HTMLDivElement;
  reviewElement.id = `bookratings_${reviewElement.id}`;
  for (const child of reviewElement.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }

  /** Rating value before the stars. */
  const rating = reviewElement.querySelector("a > span") as HTMLSpanElement;
  if (!rating) {
    throw new Error("literal rating element not found");
  }

  rating.innerText = reviews.rating;

  /** Rating's stars representation. */
  const stars = reviewElement.querySelector("a > i") as HTMLElement;
  if (!stars) {
    throw new Error("stars representation element not found");
  }

  /** Class that controls how many stars are filled. */
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.includes("a-star-")) {
    throw new Error("star class not found");
  }

  stars.classList.replace(starsFilledClass, generateStarClass(reviews.rating));

  /** Alt representation of the stars, which is a separate element. */
  const starsAlt = stars.firstElementChild as HTMLSpanElement;
  if (!starsAlt) {
    throw new Error("stars alt element not found");
  }

  starsAlt.innerText = `${reviews.rating}${starsAlt.innerText.substring(3)}`;

  const customerReviewsElement = reviewElement.querySelector(
    "a#bookratings_acrCustomerReviewLink",
  ) as HTMLAnchorElement;
  if (!customerReviewsElement) {
    throw new Error("customer reviews element not found");
  }

  customerReviewsElement.href = reviews.sectionLink;
  customerReviewsElement.target = "_blank";
  customerReviewsElement.rel = "noopener noreferrer";

  const customerReviewsCountElement =
    customerReviewsElement.firstElementChild as HTMLSpanElement;
  if (!customerReviewsCountElement) {
    throw new Error("customer reviews count element not found");
  }

  updateRatingsCountElement(
    customerReviewsCountElement,
    reviews.amount,
    reviews.site,
  );

  logger.log(`inserting ${reviews.site} rating element`);
  reviewElementReference.insertAdjacentElement("afterend", reviewElement);
}

/**
 * Generates the class responsible of controlling how many stars are
 * filled in the stars representation.
 *
 * @returns Class to add to the stars element.
 */
function generateStarClass(rating: string): string {
  const prefix = "a-star-";

  // 4.8+ rating does not follow the pattern of half star and
  // goes directly to 5 stars
  if (Number.parseFloat(rating) >= 4.8) {
    return `${prefix}5`;
  }

  // with half star
  if (Number.parseInt(rating[2]) >= 5) {
    return `${prefix}${rating[0]}-5`;
  }

  return `${prefix}${rating[0]}`;
}

function updateRatingsCountElement(
  element: HTMLElement,
  ratingsCount: number,
  site: string,
): void {
  const currentText = element.innerText;
  const match = currentText.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d)*)/);

  if (match) {
    const separator = match[0].includes(",") ? "," : ".";

    const formattedRatingsCount = ratingsCount
      .toLocaleString("en-US", {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/,/g, separator);

    element.innerText = `${currentText.replace(match[0], formattedRatingsCount)} (${site})`;
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

    @media (max-width: 1302px) {
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
