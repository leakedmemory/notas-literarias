import logger from "../lib/logger";
import { CodeFormat } from "../lib/messages";

import { isProductPage, getProductInfo } from "./product";
import { fetchAndInsertReviews } from "./reviews";

(function main() {
  if (!isProductPage()) {
    return;
  }

  const details = Array.from(
    document.querySelectorAll(
      "div#detailBullets_feature_div > ul > li > span > span",
    ),
  ) as HTMLSpanElement[];
  if (!details) {
    logger.error("product details section not found");
    return;
  }

  const productInfo = getProductInfo(details);
  if (!productInfo) {
    logger.error("product does not have ISBN-13 or ASIN code");
    return;
  }

  if (CodeFormat.ISBN === productInfo.format) {
    logger.log(`found book with ISBN-13 code ${productInfo.code}`);
  } else {
    // NOTE: even if the product has an ASIN code, it does not mean it is a book
    logger.log(`found product with ASIN code ${productInfo.code}`);
  }

  fetchAndInsertReviews(productInfo);
})();
