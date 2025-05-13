import logger from "../shared/logger";
import { CodeFormat } from "../shared/types";
import { config } from "../shared/config";
import { getElements } from "../shared/dom";

import { isBookPage, getBookInfo } from "./book";
import { fetchAndInsertReviews } from "./reviews";

(function main() {
  if (!isBookPage()) {
    return;
  }

  const details = getElements<HTMLSpanElement>(config.selectors.bookDetails);
  if (!details) {
    logger.error("book details section not found");
    return;
  }

  const bookInfo = getBookInfo(details);
  if (!bookInfo) {
    logger.error("failed to get book info");
    return;
  }

  if (CodeFormat.ISBN === bookInfo.format) {
    logger.log(`found book with ISBN-13 code ${bookInfo.code}`);
  } else {
    logger.log(`found book with ASIN code ${bookInfo.code}`);
  }

  fetchAndInsertReviews(bookInfo);
})();
