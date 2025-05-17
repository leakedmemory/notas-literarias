import logger from "../../shared/logger";
import type { Reviews } from "../../shared/types";
import { getElement } from "../../shared/dom";
import { config } from "../../shared/config";
import {
  addExtensionPrefixToElementIDs,
  removeAmazonEventAttributes,
} from "../../shared/dom";
import { generateStarClass } from "../styles";

/**
 * Gets the element containing the rating value, the stars representation,
 * and how many reviews the book has.
 *
 * @throws On `null` query selection.
 */
export function getRatingReference(): Element {
  const selectors = config.selectors.ratingContainer.split(", ");
  let ref: Element | null = null;

  for (const selector of selectors) {
    ref = document.querySelector(selector);
    if (ref) break;
  }

  if (!ref) {
    logger.error("elemento de referência de avaliação não encontrado");
    throw new Error("Rating reference element not found");
  }

  return ref;
}

/**
 * Inserts `reviews` by copying the review element of the book page and
 * changing its properties.
 *
 * @throws When some element is not found in the DOM.
 */
export function insertBookRatingElement(reviews: Reviews) {
  logger.log("inserindo elemento de avaliação do livro");

  const ratingRef = getRatingReference();
  const ratingElement = ratingRef.cloneNode(true) as HTMLDivElement;

  addExtensionPrefixToElementIDs(ratingElement);

  const popTitle = changePopTitle(ratingElement, reviews);
  changeRatingValue(ratingElement, popTitle);
  changeStarsRepresentation(ratingElement, reviews);
  changeCustomerReviewsRedirection(ratingElement, reviews);

  removeAmazonEventAttributes(ratingElement);

  ratingRef.insertAdjacentElement("afterend", ratingElement);
  logger.log("elemento de avaliação do goodreads inserido com sucesso");
}

/**
 * Changes the message that appears when hovering the rating.
 *
 * @throws On `null` query selection.
 *
 * @returns The new title.
 */
function changePopTitle(rating: HTMLElement, reviews: Reviews): string {
  const title = getElement<HTMLSpanElement>(config.selectors.popTitle, rating);
  if (!title) {
    logger.error("elemento de título não encontrado");
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
  const ratingValue = getElement<HTMLSpanElement>(
    config.selectors.ratingValue,
    rating,
  );
  if (!ratingValue) {
    logger.error("elemento de valor de avaliação não encontrado");
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
  let stars = getElement<HTMLElement>(config.selectors.ratingStars, rating);

  if (!stars) {
    stars = getElement<HTMLElement>(config.selectors.ratingStarsMini, rating);
    if (!stars) {
      logger.error("elemento de representação de estrelas não encontrado");
      throw new Error("Stars representation element not found");
    }
    isMini = true;
  }

  // Class that controls how many stars are filled
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.startsWith("a-star-")) {
    logger.error("classe de estrelas não encontrada");
    throw new Error("Star class not found");
  }

  const newStarsClass = generateStarClass(reviews.rating, isMini);
  stars.classList.replace(starsFilledClass, newStarsClass);

  // Alt representation of the stars, which is a separate element
  const selector = isMini
    ? config.selectors.ratingStarsMiniAlt
    : config.selectors.ratingStarsAlt;

  const starsAlt =
    getElement<HTMLSpanElement>(selector, stars) ||
    (stars.firstElementChild as HTMLSpanElement);

  if (!starsAlt) {
    logger.error("elemento alt de estrelas não encontrado");
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
    const oldValue = match[0];
    const formattedRatingsCount = ratingCount
      .toLocaleString()
      .replace(",", ".");

    const newText = `${currentText.replace(oldValue, formattedRatingsCount)} ${config.ui.goodreadsSource}`;
    rating.innerText = newText;
  } else {
    logger.warn(
      `padrão de contagem não encontrado no texto atual: "${currentText}"`,
    );
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
  const customerReviewsElement = getElement<HTMLAnchorElement>(
    config.selectors.customerReviews,
    rating,
  );
  if (!customerReviewsElement) {
    logger.error("elemento de avaliações de clientes não encontrado");
    throw new Error("customer reviews element not found");
  }

  customerReviewsElement.href = reviews.url;
  customerReviewsElement.target = "_blank";
  customerReviewsElement.rel = "noopener noreferrer";

  const customerReviewsCountElement =
    getElement<HTMLSpanElement>(":scope > span", customerReviewsElement) ||
    (customerReviewsElement.firstElementChild as HTMLSpanElement);

  if (!customerReviewsCountElement) {
    logger.error(
      "elemento de contagem de avaliações de clientes não encontrado",
    );
    throw new Error("customer reviews count element not found");
  }

  changeRatingCount(customerReviewsCountElement, reviews.amount);
}
