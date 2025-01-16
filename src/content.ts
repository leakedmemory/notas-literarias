import browser from "webextension-polyfill";

import logger from "./logger";

import type {
  Product,
  GetReviewsMessage,
  GetReviewsResponse,
  Reviews,
} from "./messages";

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

  const productInfo = getProductInfo(details);
  if (!productInfo) {
    logger.error("product does not have ISBN-13 or ASIN code");
    return;
  }

  if (productInfo.codeFormat === "isbn") {
    logger.log(`found book with ${productInfo.code} ISBN-13 code`);

    fetchAndInsertReviews({
      site: "goodreads",
      product: productInfo,
    });
  } else {
    /** Even if the product has an ASIN code, it does not mean it is a book. */
    logger.log(`found product with ${productInfo.code} ASIN code`);
    /** @todo Reviews fetching using ASIN code. */
  }
})();

function isProductPage(): boolean {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

function getProductInfo(details: HTMLSpanElement[]): Product | null {
  for (const [i, detail] of details.entries()) {
    if (detail.innerText === "ISBN-13  : ") {
      return {
        code: details[i + 1].innerText,
        codeFormat: "isbn",
      };
    }

    if (detail.innerText === "ASIN  : ") {
      return {
        code: details[i + 1].innerText,
        codeFormat: "asin",
      };
    }
  }

  return null;
}

function fetchAndInsertReviews(msg: GetReviewsMessage) {
  logger.log(`fetching ${msg.site} rating`);

  browser.runtime.sendMessage(msg).then((response: unknown) => {
    const reviewsResponse = response as GetReviewsResponse;
    if (reviewsResponse.err) {
      logger.error(
        `${reviewsResponse.err} [while fetching ${msg.site} rating]`,
      );
      return;
    }

    const reviews = reviewsResponse.reviews;
    logger.log(`${reviews.site} rating: ${reviews.rating}`);
    insertReviews(reviews);
  });
}

/**
 * @todo: Also create the modal with the reviews.
 */
function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
  } catch (err: unknown) {
    logger.error(`${err} [while inserting ${reviews.site} rating]`);
  }
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
  const reviewElementRef = document.querySelector(
    "div#averageCustomerReviews_feature_div",
  );
  if (!reviewElementRef) {
    throw new Error("rating reference element not found");
  }

  const reviewElement = reviewElementRef.cloneNode(true) as HTMLDivElement;
  addExtensionPrefixToElementIDs(reviewElement);

  /**
   * Span with the rating value, stars, and arrow down icon.
   *
   * Currently used to remove the hover aspect, since the modal is not done yet.
   */
  const ratingSpan = reviewElement.querySelector(
    "div#bookratings_averageCustomerReviews > span",
  ) as HTMLSpanElement;
  if (!ratingSpan) {
    throw new Error("rating span element not found");
  }

  ratingSpan.style.pointerEvents = "none";

  const titleSpan = reviewElement.querySelector(
    "span#bookratings_acrPopover",
  ) as HTMLSpanElement;
  if (!titleSpan) {
    throw new Error("title span element not found");
  }

  const newTitle = titleSpan.title.split(" ");
  if (newTitle[0][1] === ".") {
    newTitle[0] = reviews.rating;
  } else {
    newTitle[0] = reviews.rating.replace(".", ",");
  }
  titleSpan.title = newTitle.join(" ");

  /** Rating value before the stars. */
  const ratingValue = reviewElement.querySelector(
    "a > span",
  ) as HTMLSpanElement;
  if (!ratingValue) {
    throw new Error("literal rating element not found");
  }

  ratingValue.innerText = titleSpan.title.split(" ")[0];

  /** Rating's stars representation. */
  const stars = reviewElement.querySelector("a > i.a-icon-star") as HTMLElement;
  if (!stars) {
    throw new Error("stars representation element not found");
  }

  /** Class that controls how many stars are filled. */
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.startsWith("a-star-")) {
    throw new Error("star class not found");
  }

  stars.classList.replace(starsFilledClass, generateStarClass(reviews.rating));

  /** Alt representation of the stars, which is a separate element. */
  const starsAlt = stars.firstElementChild as HTMLSpanElement;
  if (!starsAlt) {
    throw new Error("stars alt element not found");
  }

  starsAlt.innerText = `${reviews.rating}${starsAlt.innerText.substring(3)}`;

  /** Arrow down icon. */
  const arrowPopover = reviewElement.querySelector(
    "a > i.a-icon-popover",
  ) as HTMLElement;
  if (!arrowPopover) {
    throw new Error("arrow down popover element not found");
  }

  arrowPopover.style.visibility = "hidden";

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
  reviewElementRef.insertAdjacentElement("afterend", reviewElement);
}

/**
 * Adds "bookratings_" prefix to `element` and all of its children.
 */
function addExtensionPrefixToElementIDs(element: HTMLElement) {
  element.id = `bookratings_${element.id}`;
  for (const child of element.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }
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
