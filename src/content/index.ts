import logger from "../shared/logger";
import { CodeFormat } from "../shared/types";
import { config } from "../shared/config";
import { getElements } from "../shared/dom";

import { getBookInfo } from "./book";
import { fetchAndInsertReviews } from "./reviews";

(function main() {
  if (!isProductPage()) {
    return;
  }

  const details = getElements<HTMLSpanElement>(config.selectors.productDetails);
  if (!details) {
    logger.log("seção de detalhes do produto não encontrada");
    return;
  }

  const bookInfo = getBookInfo(details);
  if (!bookInfo) {
    logger.warn(
      "produto não é um livro ou não foi possível obter as informações do livro",
    );
    return;
  }

  if (CodeFormat.ISBN === bookInfo.format) {
    logger.log(`encontrado livro com código ISBN-13: ${bookInfo.code}`);
  } else {
    logger.log(`encontrado livro com código ASIN: ${bookInfo.code}`);
  }

  fetchAndInsertReviews(bookInfo);
})();

function isProductPage(): boolean {
  return window.location.pathname.includes("/dp/");
}
