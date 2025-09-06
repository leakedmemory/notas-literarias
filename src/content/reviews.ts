import logger from "../shared/logger";
import type {
  BackgroundResponse,
  Book,
  ContentMessage,
  FetchURLMessage,
  Reviews,
  SearchCodeMessage,
} from "../shared/types";
import { CodeFormat, MessageType } from "../shared/types";
import { insertPopover } from "./components/popover";
import {
  getRatingReference,
  insertBookRatingElement,
} from "./components/rating";
import {
  insertLoadingSpinner,
  insertSpinnerStyles,
  removeLoadingSpinner,
} from "./components/spinner";
import { parseBookPage, parseSearchPage } from "./parser";
import { insertCustomStyles } from "./styles";

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
    logger.info(`ao buscar avaliação do goodreads: ${error.message}`);
    insertNotFoundMessage();
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
    logger.error(`ao tentar inserir avaliação do goodreads: ${error.message}`);
  }
}

/**
 * Insere uma mensagem informando que o livro não foi encontrado no Goodreads.
 */
function insertNotFoundMessage() {
  try {
    logger.log("inserindo mensagem de livro não encontrado");
    const messageEl = createNotFoundMessageElement();
    const ratingRef = getRatingReference();
    ratingRef.insertAdjacentElement("afterend", messageEl);
  } catch (error) {
    logger.error(
      `ao tentar inserir mensagem de não encontrado: ${error.message}`,
    );
  }
}

/**
 * Cria o elemento HTML da mensagem de "livro não encontrado".
 *
 * @returns HTMLElement contendo a mensagem formatada
 */
function createNotFoundMessageElement(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.marginTop = "5px";

  const iconSrc = "icons/icon-16x16.png";
  const iconSize = "16px";

  const img = document.createElement("img");
  img.src = browser.runtime.getURL(iconSrc);
  img.style.marginRight = "5px";
  container.appendChild(img);

  const message = document.createElement("span");
  message.innerText = "Livro não encontrado no Goodreads";
  message.style.lineHeight = iconSize;
  container.appendChild(message);

  return container;
}
