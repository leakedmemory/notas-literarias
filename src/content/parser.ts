import logger from "../shared/logger";
import { config, goodreadsURL } from "../shared/config";
import { getElement, getElements } from "../shared/dom";
import type { Reviews, Star } from "../shared/types";

const parser = new DOMParser();

export function parseBookPage(html: string, url: string) {
  const doc = parser.parseFromString(html, "text/html");
  return parseReviews(doc, url);
}

export function parseSearchPage(html: string): string {
  const doc = parser.parseFromString(html, "text/html");
  const bookAnchorElement = getElement<HTMLAnchorElement>(
    config.selectors.bookAnchor,
    doc,
  );
  if (!bookAnchorElement) {
    logger.error(
      "livro não encontrado para o ASIN fornecido na página de resultados",
    );
    throw new Error("book not found for the given ASIN");
  }

  // href's origin is the extension
  const href = bookAnchorElement.href;
  const url = goodreadsURL(href.slice(href.indexOf("/book")));

  return url;
}

function parseReviews(doc: Document, url: string): Reviews {
  const rating = getRating(doc);
  const amount = getAmountOfReviews(doc);
  const stars = getStars(doc);

  const reviews: Reviews = {
    rating,
    amount,
    stars,
    url: `${url}${config.goodreads.communityReviewsFilter}`,
  };

  return reviews;
}

/**
 * Gets the rating from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns The rating as a string
 * @throws If the rating is not found
 */
function getRating(doc: Document): string {
  const ratingElement = getElement<HTMLDivElement>(
    config.selectors.rating,
    doc,
  );
  if (!ratingElement) {
    logger.error("elemento de classificação não encontrado no documento");
    throw new Error("rating not found");
  }

  const rawRating = ratingElement.innerText;
  const formattedRating = roundRating(rawRating).replace(".", ",");

  return formattedRating;
}

/**
 * Rounds a rating to a single decimal place.
 *
 * @param rating - The rating to round
 * @returns The rounded rating as a string
 */
function roundRating(rating: string): string {
  const num = Number.parseFloat(rating);
  const scaled = num * 10;
  const rounded = Math.round(scaled);
  const result = (rounded / 10).toFixed(1);

  return result;
}

/**
 * Gets the amount of reviews from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns The amount of reviews
 * @throws If the ratings count is not found
 */
function getAmountOfReviews(doc: Document): number {
  const ratingsCountElement = getElement<HTMLSpanElement>(
    config.selectors.ratingsCount,
    doc,
  );
  if (!ratingsCountElement) {
    logger.error("elemento de contagem de avaliações não encontrado");
    throw new Error("ratings count not found");
  }

  const innerHTML = ratingsCountElement.innerHTML;
  const rawAmount = innerHTML.slice(0, innerHTML.indexOf("<")).replace(",", "");
  const amount = Number.parseInt(rawAmount);

  return amount;
}

/**
 * Gets stars information from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns An array of Star objects
 * @throws If the star ranks are not found
 */
function getStars(doc: Document): Star[] {
  const starsElement = getElements<HTMLDivElement>(config.selectors.stars, doc);
  if (!starsElement) {
    logger.error("elementos de ranking de estrelas não encontrados");
    throw new Error("star ranks not found");
  }

  const stars: Star[] = starsElement.map((starRankElement, idx) => {
    const text = starRankElement.innerText;
    const [amount, percentage] = text.split(" ");
    const rank = 5 - idx;
    const parsedAmount = Number.parseInt(amount.replace(",", ""));
    const parsedPercentage = percentage.slice(1, percentage.indexOf("%"));

    return {
      rank,
      amount: parsedAmount,
      percentage: parsedPercentage,
    };
  });

  return stars;
}
