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
  logger.log(
    `iniciando busca de avaliações do goodreads para ${book.format === CodeFormat.ISBN ? "ISBN" : "ASIN"}: ${book.code}`,
  );

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

    logger.log(
      `avaliação do goodreads obtida: ${reviews.rating} (${reviews.amount} avaliações)`,
    );
    insertReviews(reviews);
  } catch (error) {
    logger.error(`erro ao buscar avaliação do goodreads: ${error}`);
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
      logger.error(`erro retornado pelo script de background: ${response.err}`);
      throw new Error(`${response.err}`);
    }
    return response;
  } catch (error) {
    logger.error(`erro ao comunicar com script de background: ${error}`);
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
        logger.error(`erro ao buscar código do livro: ${resp.err}`);
        return;
      }

      if (codeFormat === CodeFormat.ISBN) {
        const reviews = parseBookPage(resp.pageHTML, resp.url);
        logger.log(
          `avaliação do goodreads obtida: ${reviews.rating} (${reviews.amount} avaliações)`,
        );
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
      logger.error(`erro ao buscar avaliação do goodreads: ${error}`);
    });
}

function sendFetchURLMessage(msg: FetchURLMessage) {
  browser.runtime
    .sendMessage(msg)
    .then((response: unknown) => {
      removeLoadingSpinner();

      const resp = response as BackgroundResponse;
      if (resp.err) {
        logger.error(`erro ao buscar código do livro: ${resp.err}`);
        return;
      }

      const reviews = parseBookPage(resp.pageHTML, resp.url);
      logger.log(
        `avaliação do goodreads obtida: ${reviews.rating} (${reviews.amount} avaliações)`,
      );
      insertReviews(reviews);
    })
    .catch((error) => {
      removeLoadingSpinner();
      logger.error(`erro ao buscar página do goodreads: ${error}`);
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
    logger.log("avaliações inseridas com sucesso");
  } catch (err: unknown) {
    logger.error(`erro ao inserir avaliação do goodreads: ${err}`);
  }
}
