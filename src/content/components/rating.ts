import logger from "../../shared/logger";
import type { Reviews } from "../../shared/messages";
import {
  addExtensionPrefixToElementIDs,
  removeAmazonEventAttributes,
} from "../../shared/dom";
import { generateStarClass } from "../styles";

/**
 * Gets the element containing the rating value, the stars representation,
 * and how many reviews the product has.
 *
 * @throws On `null` query selection.
 */
export function getRatingReference(): Element {
  const ref =
    document.querySelector("div#averageCustomerReviews") ||
    document.querySelector("div#averageCustomerReviews_feature_div");
  if (!ref) {
    throw new Error("rating reference element not found");
  }

  return ref;
}

/**
 * Inserts `reviews` by copying the review element of the product page and
 * changing its properties.
 *
 * @throws When some element is not found in the DOM.
 */
export function insertBookRatingElement(reviews: Reviews) {
  const ratingRef = getRatingReference();
  const ratingElement = ratingRef.cloneNode(true) as HTMLDivElement;
  addExtensionPrefixToElementIDs(ratingElement);

  const popTitle = changePopTitle(ratingElement, reviews);
  changeRatingValue(ratingElement, popTitle);
  changeStarsRepresentation(ratingElement, reviews);
  changeCustomerReviewsRedirection(ratingElement, reviews);
  removeAmazonEventAttributes(ratingElement);

  logger.log("inserting goodreads rating element");

  ratingRef.insertAdjacentElement("afterend", ratingElement);
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
    "span#notasliterarias-acrPopover",
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
 * Changes the stars representation to match the review rating.
 *
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
 * Changes the rating count and adds from which site the rating was taken.
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
 * Changes the rating count and adds from which site it was taken.
 *
 * @throws On `null` query selection.
 */
function changeCustomerReviewsRedirection(
  rating: HTMLElement,
  reviews: Reviews,
) {
  const customerReviewsElement = rating.querySelector(
    "a#notasliterarias-acrCustomerReviewLink",
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
