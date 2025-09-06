import { type Book, CodeFormat } from "../shared/types";

/**
 * Extrai as informações do produto (código ISBN-13 ou ASIN) dos detalhes da página.
 * A função prioriza o ISBN-13 quando ambos estão presentes, pois facilita na
 * busca no Goodreads.
 *
 * @param details - Array de elementos HTML contendo os detalhes do produto
 * @returns Book ou null se nenhum código for encontrado ou produto não um livro
 */
export function getBookInfo(details: HTMLSpanElement[]): Book | null {
  const book: Book = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;
  let foundPublisher = false;

  for (const [i, detail] of details.entries()) {
    if (i % 2 !== 0) {
      continue;
    }

    const normalizedText = detail.innerText.replace(/[^A-Za-z0-9-]/g, "");
    if (normalizedText === "ISBN-13") {
      book.code = details[i + 1].innerText.trim();
      book.format = CodeFormat.ISBN;
      return book;
    }

    if (normalizedText === "ASIN") {
      book.code = details[i + 1].innerText.trim();
      foundASIN = true;
    } else if (normalizedText === "Editora") {
      foundPublisher = true;
    }
  }

  if (foundPublisher && foundASIN) {
    return book;
  }

  return null;
}
