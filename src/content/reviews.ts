import logger from "../shared/logger";
import type {
  Product,
  ContentMessage,
  SearchCodeMessage,
  FetchURLMessage,
  BackgroundResponse,
  Reviews,
  Star,
} from "../shared/messages";
import { MessageType, CodeFormat } from "../shared/messages";

import {
  insertLoadingSpinner,
  removeLoadingSpinner,
  insertSpinnerStyles,
} from "./components/spinner";
import { insertBookRatingElement } from "./components/rating";
import { insertPopover } from "./components/popover";
import { insertCustomStyles } from "./styles";
import { parseBookPage, parseSearchPage } from "./parser";

/**
 * Fetches reviews from Goodreads and inserts them into the page.
 */
export function fetchAndInsertReviews(product: Product) {
  logger.log("trying to fetch goodreads rating");

  insertLoadingSpinner();
  insertSpinnerStyles();

  const msg: SearchCodeMessage = {
    msg: MessageType.SearchCode,
    code: product.code,
  };
  sendSearchCodeMessage(msg, product.format);
}

function sendSearchCodeMessage(msg: SearchCodeMessage, codeFormat: CodeFormat) {
  browser.runtime
    .sendMessage(msg)
    .then((response: unknown) => {
      const resp = response as BackgroundResponse;
      if (resp.err) {
        removeLoadingSpinner();
        logger.error(`${resp.err} [while searching for book's code]`);
        return;
      }

      if (codeFormat === CodeFormat.ISBN) {
        const reviews = parseBookPage(resp.pageHTML, resp.url);
        logger.log(`goodreads rating: ${reviews.rating}`);
        removeLoadingSpinner();
        insertReviews(reviews);
      } else {
        const bookPageURL = parseSearchPage(resp.pageHTML);
        const newMsg: FetchURLMessage = {
          msg: MessageType.FetchURL,
          url: bookPageURL,
        };
        sendFetchURLMessage(newMsg);
      }
    })
    .catch((error) => {
      removeLoadingSpinner();
      logger.error(`${error} [while fetching goodreads rating]`);
    });
}

function sendFetchURLMessage(msg: FetchURLMessage) {
  browser.runtime
    .sendMessage(msg)
    .then((response: unknown) => {
      removeLoadingSpinner();

      const resp = response as BackgroundResponse;
      if (resp.err) {
        logger.error(`${resp.err} [while searching book's code]`);
        return;
      }

      const reviews = parseBookPage(resp.pageHTML, resp.url);
      logger.log(`goodreads rating: ${reviews.rating}`);
      insertReviews(reviews);
    })
    .catch((error) => {
      removeLoadingSpinner();
      logger.error(`${error} [while fetching goodreads book page]`);
    });
}

/**
 * Inserts reviews data into the page.
 */
function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
    insertPopover(reviews);
  } catch (err: unknown) {
    logger.error(`${err} [while inserting goodreads rating]`);
  }
}
