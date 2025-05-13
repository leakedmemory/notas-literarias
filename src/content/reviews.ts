import logger from "../shared/logger";
import type {
  Book,
  ContentMessage,
  SearchCodeMessage,
  FetchURLMessage,
  BackgroundResponse,
  Reviews,
  Star,
} from "../shared/types";
import { MessageType, CodeFormat } from "../shared/types";

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
export async function fetchAndInsertReviews(book: Book) {
  logger.log("trying to fetch goodreads rating");

  insertLoadingSpinner();
  insertSpinnerStyles();

  try {
    const searchMsg: SearchCodeMessage = {
      msg: MessageType.SearchCode,
      code: book.code,
    };

    const searchResponse = await sendMessageToBackground(searchMsg);

    let reviews: Reviews;

    if (book.format === CodeFormat.ISBN) {
      reviews = parseBookPage(searchResponse.pageHTML, searchResponse.url);
    } else {
      const bookPageURL = parseSearchPage(searchResponse.pageHTML);
      const fetchMsg: FetchURLMessage = {
        msg: MessageType.FetchURL,
        url: bookPageURL,
      };

      const fetchResponse = await sendMessageToBackground(fetchMsg);
      reviews = parseBookPage(fetchResponse.pageHTML, fetchResponse.url);
    }

    logger.log(`goodreads rating: ${reviews.rating}`);
    insertReviews(reviews);
  } catch (error) {
    logger.error(`${error} [while fetching goodreads rating]`);
  } finally {
    removeLoadingSpinner();
  }
}

async function sendMessageToBackground<T extends ContentMessage>(
  message: T,
): Promise<BackgroundResponse> {
  try {
    const response = (await browser.runtime.sendMessage(
      message,
    )) as BackgroundResponse;
    if (response.err) {
      throw new Error(`${response.err}`);
    }
    return response;
  } catch (error) {
    logger.error(`${error} [while communicating with background script]`);
    throw error;
  }
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
