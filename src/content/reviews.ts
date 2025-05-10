import logger from "../lib/logger";
import type {
  Product,
  GetReviewsMessage,
  GetReviewsResponse,
  Reviews,
} from "../lib/messages";

import {
  insertLoadingSpinner,
  removeLoadingSpinner,
  insertSpinnerStyles,
} from "./elements/spinner";
import { insertBookRatingElement } from "./elements/rating";
import { insertPopover } from "./elements/popover";
import { insertCustomStyles } from "./styles";

/**
 * Fetches reviews from Goodreads and inserts them into the page.
 */
export function fetchAndInsertReviews(product: Product) {
  logger.log("trying to fetch goodreads rating");

  insertLoadingSpinner();
  insertSpinnerStyles();

  const msg: GetReviewsMessage = { msg: "fetchGoodreads", product: product };
  browser.runtime
    .sendMessage(msg)
    .then((response: unknown) => {
      removeLoadingSpinner();

      const reviewsResponse = response as GetReviewsResponse;
      if (reviewsResponse.err) {
        logger.error(
          `${reviewsResponse.err} [while fetching goodreads rating]`,
        );
        return;
      }

      const reviews = reviewsResponse.reviews;

      logger.log(`goodreads rating: ${reviews.rating}`);

      insertReviews(reviews);
    })
    .catch((error) => {
      logger.error(`${error} [while fetching goodreads rating]`);

      removeLoadingSpinner();
    });
}

/**
 * Inserts reviews data into the page.
 */
export function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
    insertPopover(reviews);
  } catch (err: unknown) {
    logger.error(`${err} [while inserting goodreads rating]`);
  }
}
