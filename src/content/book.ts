import { type Book, CodeFormat } from "../shared/types";
import { config } from "../shared/config";
import { getElement } from "../shared/dom";

/**
 * Checks if the current page is a book page.
 */
export function isBookPage(): boolean {
  return getElement(config.selectors.bookPage) !== null;
}

/**
 * Gets the ISBN-13 or ASIN code of the book. If both are present, the
 * ISBN-13 will be returned.
 */
export function getBookInfo(details: HTMLSpanElement[]): Book | null {
  const book: Book = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;

  for (const [i, detail] of details.entries()) {
    if (i % 2 !== 0) {
      continue;
    }

    // normalize the text by removing all non-alphanumeric characters
    // (looking at you `&rlm;` on chromium)
    const normalizedText = detail.innerText.replace(/[^A-Z0-9-]/g, "");

    if (normalizedText === "ISBN-13") {
      book.code = details[i + 1].innerText.trim();
      book.format = CodeFormat.ISBN;
      return book;
    }

    if (normalizedText === "ASIN") {
      book.code = details[i + 1].innerText.trim();
      foundASIN = true;
    }
  }

  if (foundASIN) {
    return book;
  }

  return null;
}
