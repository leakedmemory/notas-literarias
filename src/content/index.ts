import logger from "../shared/logger";
import { CodeFormat } from "../shared/types";
import { config } from "../shared/config";
import { getElements } from "../shared/dom";

import { isBookPage, getBookInfo } from "./book";
import { fetchAndInsertReviews } from "./reviews";

(function main() {
  logger.log("iniciando extensão notas literárias");

  if (!isBookPage()) {
    logger.warn("página atual não é uma página de livro, encerrando execução");
    return;
  }

  logger.log("página de livro detectada, processando informações");

  const details = getElements<HTMLSpanElement>(config.selectors.bookDetails);
  if (!details) {
    logger.error("seção de detalhes do livro não encontrada");
    return;
  }

  const bookInfo = getBookInfo(details);
  if (!bookInfo) {
    logger.error("falha ao obter informações do livro");
    return;
  }

  if (CodeFormat.ISBN === bookInfo.format) {
    logger.log(`encontrado livro com código ISBN-13: ${bookInfo.code}`);
  } else {
    logger.log(`encontrado livro com código ASIN: ${bookInfo.code}`);
  }

  fetchAndInsertReviews(bookInfo);
})();
