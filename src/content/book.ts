import { type Book, CodeFormat } from "../shared/types";
import logger from "../shared/logger";
import { config } from "../shared/config";
import { getElement } from "../shared/dom";

/**
 * Verifica se a página atual é uma página de livro na Amazon.
 * A verificação é feita procurando pela presença do elemento que contém
 * os detalhes do livro, que é específico das páginas de produto de livros.
 *
 * @returns true se a página atual for uma página de livro, false caso contrário
 */
export function isBookPage(): boolean {
  const isBook = getElement(config.selectors.bookPage) !== null;
  return isBook;
}

/**
 * Extrai as informações do livro (código ISBN-13 ou ASIN) dos detalhes da página.
 * A função prioriza o ISBN-13 quando ambos estão presentes, pois facilita na
 * busca no Goodreads. Processa a lista de detalhes em pares (chave, valor).
 *
 * @param details - Array de elementos HTML contendo os detalhes do livro
 * @returns Book ou null se nenhum código for encontrado
 */
export function getBookInfo(details: HTMLSpanElement[]): Book | null {
  const book: Book = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;

  for (const [i, detail] of details.entries()) {
    if (i % 2 !== 0) {
      continue;
    }

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

  logger.warn("nenhum código ISBN-13 ou ASIN encontrado nos detalhes do livro");
  return null;
}
