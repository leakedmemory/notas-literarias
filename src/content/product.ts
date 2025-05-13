import { type Product, CodeFormat } from "../shared/messages";

/**
 * Checks if the current page is a product page.
 */
export function isProductPage(): boolean {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

/**
 * Gets the ISBN-13 or ASIN code of the product. If both are present, the
 * ISBN-13 will be returned.
 */
export function getProductInfo(details: HTMLSpanElement[]): Product | null {
  const product: Product = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;

  for (const [i, detail] of details.entries()) {
    if (i % 2 !== 0) {
      continue;
    }

    // normalize the text by removing all non-alphanumeric characters
    // (looking at you `&rlm;` on chromium)
    const normalizedText = detail.innerText.replace(/[^A-Z0-9-]/g, "");

    if (normalizedText === "ISBN-13") {
      product.code = details[i + 1].innerText.trim();
      product.format = CodeFormat.ISBN;
      return product;
    }

    if (normalizedText === "ASIN") {
      product.code = details[i + 1].innerText.trim();
      foundASIN = true;
    }
  }

  if (foundASIN) {
    return product;
  }

  return null;
}
