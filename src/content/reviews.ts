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
 * Busca avaliações do Goodreads e as insere na página da Amazon.
 * Esta é a função principal que coordena todo o processo de busca e inserção.
 * Gerencia diferentes fluxos dependendo se o livro tem ISBN ou ASIN.
 *
 * @param book - Objeto contendo as informações do livro
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
    logger.warn("erro ao buscar avaliação do goodreads", error);
  } finally {
    removeLoadingSpinner();
  }
}

/**
 * Envia uma mensagem para o script de background e aguarda a resposta.
 * Funciona como uma camada de abstração para comunicação entre content script e background script.
 *
 * @template T - Tipo da mensagem estendendo ContentMessage
 * @param message - A mensagem a ser enviada para o background script
 * @returns Promise com a resposta do background script
 * @throws Error se houver erro na comunicação ou resposta de erro do background
 */
async function sendMessageToBackground<T extends ContentMessage>(
  message: T,
): Promise<BackgroundResponse> {
  try {
    const response = (await browser.runtime.sendMessage(
      message,
    )) as BackgroundResponse;
    if (response.err) {
      throw new Error(`script de background: ${response.err}`);
    }
    return response;
  } catch (error) {
    throw new Error(`erro na comunicação com script de background: ${error}`);
  }
}

/**
 * Insere os dados de avaliações na página da Amazon.
 * Coordena a inserção do elemento de avaliação, estilos personalizados e popover.
 *
 * @param reviews - Objeto contendo todas as informações de avaliação do Goodreads
 */
function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
    insertPopover(reviews);
    logger.log("avaliações inseridas com sucesso");
  } catch (error) {
    logger.warn("erro ao tentar inserir avaliação do goodreads", error);
  }
}
