import browser from "webextension-polyfill";

import logger from "./logger";

import type {
  Product,
  GetReviewsMessage,
  GetReviewsResponse,
  Reviews,
} from "./messages";

import { CodeFormat } from "./messages";

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

  if (CodeFormat.ISBN === productInfo.format) {
    logger.log(`found book with ${productInfo.code} ISBN-13 code`);
  } else {
    // NOTE: even if the product has an ASIN code, it does not mean it is a book
    logger.log(`found product with ${productInfo.code} ASIN code`);
  }

  fetchAndInsertReviews(productInfo);
})();

function isProductPage(): boolean {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

/**
 * Gets the ISBN-13 or ASIN code of the product. If both are present,
 * the ISBN-13 will be returned.
 */
function getProductInfo(details: HTMLSpanElement[]): Product | null {
  const product: Product = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;
  for (const [i, detail] of details.entries()) {
    if (detail.innerText === "ISBN-13  : ") {
      product.code = details[i + 1].innerText;
      product.format = CodeFormat.ISBN;
      return product;
    }

    if (detail.innerText === "ASIN  : ") {
      product.code = details[i + 1].innerText;
      foundASIN = true;
    }
  }

  if (foundASIN) {
    return product;
  }

  return null;
}

function fetchAndInsertReviews(product: Product) {
  logger.log("trying to fetch goodreads rating");

  const msg: GetReviewsMessage = { msg: "fetchGoodreads", product: product };
  browser.runtime.sendMessage(msg).then((response: unknown) => {
    const reviewsResponse = response as GetReviewsResponse;
    if (reviewsResponse.err) {
      logger.error(`${reviewsResponse.err} [while fetching goodreads rating]`);
      return;
    }

    const reviews = reviewsResponse.reviews;
    logger.log(`goodreads rating: ${reviews.rating}`);
    insertReviews(reviews);
  });
}

/**
 * @todo Create the modal with the reviews.
 */
function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
  } catch (err: unknown) {
    logger.error(`${err} [while inserting goodreads rating]`);
  }
}

/**
 * Inserts `reviews` by copying the review element of the product page and
 * changing its properties.
 *
 * @throws When some element is not found in the DOM.
 */
function insertBookRatingElement(reviews: Reviews) {
  const ratingRef = getRatingReference();
  const ratingElement = ratingRef.cloneNode(true) as HTMLDivElement;
  addExtensionPrefixToElementIDs(ratingElement);

  // delete following function after creating modal
  removeHover(ratingElement);
  // poptitle not shown since hover is disabled
  const popTitle = changePopTitle(ratingElement, reviews);
  changeRatingValue(ratingElement, popTitle);
  changeStarsRepresentation(ratingElement, reviews);
  // delete following function after creating modal
  deleteArrowPopover(ratingElement);
  changeCustomerReviewsRedirection(ratingElement, reviews);

  logger.log("inserting goodreads rating element");

  ratingRef.insertAdjacentElement("afterend", ratingElement);
}

/**
 * Gets the element containing the rating value, the starts representation,
 * and how many reviews the product has.
 *
 * @throws On `null` query selection.
 */
function getRatingReference(): Element {
  const ref =
    document.querySelector("div#averageCustomerReviews") ||
    document.querySelector("div#averageCustomerReviews_feature_div");
  if (!ref) {
    throw new Error("rating reference element not found");
  }

  return ref;
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
 * @throws On `null` query selection.
 */
function removeHover(rating: HTMLElement) {
  const ratingSpan = rating.querySelector(
    "div#bookratings_averageCustomerReviews > span",
  ) as HTMLSpanElement;
  if (!ratingSpan) {
    throw new Error("rating span element not found");
  }

  ratingSpan.style.pointerEvents = "none";
}

/**
 * Changes the message that appears when hovering the rating.
 *
 * @throws On `null` query selection.
 *
 * @returns The new title.
 */
function changePopTitle(rating: HTMLElement, reviews: Reviews): string {
  const title = rating.querySelector(
    "span#bookratings_acrPopover",
  ) as HTMLSpanElement;
  if (!title) {
    throw new Error("title span element not found");
  }

  const newTitle = title.title.split(" ");
  newTitle[0] = reviews.rating.replace(".", ",");
  title.title = newTitle.join(" ");

  return title.title;
}

/**
 * Changes the rating value before the stars.
 *
 * @throws On `null` query selection.
 */
function changeRatingValue(rating: HTMLElement, title: string) {
  const ratingValue = rating.querySelector("a > span") as HTMLSpanElement;
  if (!ratingValue) {
    throw new Error("literal rating element not found");
  }

  ratingValue.innerText = title.split(" ")[0];
}

/**
 * @throws On `null` query selection.
 */
function changeStarsRepresentation(rating: HTMLElement, reviews: Reviews) {
  let isMini = false;
  let stars = rating.querySelector("a > i.a-icon-star") as HTMLElement;
  if (!stars) {
    stars = rating.querySelector("a > i.a-icon-star-mini") as HTMLElement;
    if (!stars) {
      throw new Error("stars representation element not found");
    }
    isMini = true;
  }

  /** Class that controls how many stars are filled. */
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.startsWith("a-star-")) {
    throw new Error("star class not found");
  }

  stars.classList.replace(
    starsFilledClass,
    generateStarClass(reviews.rating, isMini),
  );

  /** Alt representation of the stars, which is a separate element. */
  const starsAlt = stars.firstElementChild as HTMLSpanElement;
  if (!starsAlt) {
    throw new Error("stars alt element not found");
  }

  starsAlt.innerText = `${reviews.rating}${starsAlt.innerText.substring(3)}`;
}

/**
 * Generates the class responsible of controlling how many stars are
 * filled in the stars representation.
 *
 * @returns Class to add to the stars element.
 */
function generateStarClass(rating: string, isMini: boolean): string {
  const prefix = isMini ? "a-star-mini-" : "a-star-";

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

/**
 * @throws On `null` query selection.
 */
function deleteArrowPopover(rating: HTMLElement) {
  const arrowPopover = rating.querySelector(
    "a > i.a-icon-popover",
  ) as HTMLElement;
  if (!arrowPopover) {
    throw new Error("arrow down popover element not found");
  }

  arrowPopover.style.visibility = "hidden";
}

/**
 * Changes the rating count and adds from which site it was taken.
 *
 * @throws On `null` query selection.
 */
function changeCustomerReviewsRedirection(
  rating: HTMLElement,
  reviews: Reviews,
) {
  const customerReviewsElement = rating.querySelector(
    "a#bookratings_acrCustomerReviewLink",
  ) as HTMLAnchorElement;
  if (!customerReviewsElement) {
    throw new Error("customer reviews element not found");
  }

  customerReviewsElement.href = reviews.sectionURL;
  customerReviewsElement.target = "_blank";
  customerReviewsElement.rel = "noopener noreferrer";

  const customerReviewsCountElement =
    customerReviewsElement.firstElementChild as HTMLSpanElement;
  if (!customerReviewsCountElement) {
    throw new Error("customer reviews count element not found");
  }

  changeRatingCount(customerReviewsCountElement, reviews.amount);
}

/**
 * Changes the rating count following the pattern of `separator` and adds
 * from which site the rating was taken.
 */
function changeRatingCount(rating: HTMLElement, ratingCount: number) {
  const currentText = rating.innerText;
  const match = currentText.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d)*)/);

  if (match) {
    const separator = ".";
    const formattedRatingsCount = ratingCount
      .toLocaleString("en-US", {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/,/g, separator);

    rating.innerText = `${currentText.replace(match[0], formattedRatingsCount)} (goodreads)`;
  }
}

/**
 * Modifies the default product page style to better fit other book ratings.
 */
function insertCustomStyles() {
  const css = `
    /* KINDLE ONLY */
    div#reviewFeatureGroup {
      margin-bottom: 7px;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting custom product page styles");
  document.head.appendChild(styleElement);
}
