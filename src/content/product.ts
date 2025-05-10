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
    if (detail.innerText === "ISBN-13  : ") {
      product.code = details[i + 1].innerText;
      product.format = CodeFormat.ISBN;
      return product;
    }

    if (detail.innerText === "ASIN  : ") {
      product.code = details[i + 1].innerText;
      foundASIN = true;
    }
  }

  if (foundASIN) {
    return product;
  }

  return null;
}
