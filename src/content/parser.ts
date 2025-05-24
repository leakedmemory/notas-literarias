import logger from "../shared/logger";
import { config, goodreadsURL } from "../shared/config";
import { getElement, getElements } from "../shared/dom";
import type { Reviews, Star } from "../shared/types";

const parser = new DOMParser();

/**
 * Processa o HTML de uma página de livro do Goodreads e extrai as informações de avaliação.
 *
 * @param html - String contendo o HTML da página do livro
 * @param url - URL da página do livro no Goodreads
 * @returns Reviews contendo todas as informações de avaliação extraídas
 */
export function parseBookPage(html: string, url: string) {
  const doc = parser.parseFromString(html, "text/html");
  return parseReviews(doc, url);
}

/**
 * Processa o HTML de uma página de busca do Goodreads e extrai a URL do primeiro livro encontrado.
 *
 * @param html - String contendo o HTML da página de resultados de busca
 * @returns URL completa do primeiro livro encontrado nos resultados
 * @throws Error se nenhum livro for encontrado na página de resultados
 */
export function parseSearchPage(html: string): string {
  const doc = parser.parseFromString(html, "text/html");
  const bookAnchorElement = getElement<HTMLAnchorElement>(
    config.selectors.bookAnchor,
    doc,
  );
  if (!bookAnchorElement) {
    logger.error(
      "livro não encontrado para o ASIN fornecido na página de resultados",
    );
    throw new Error("book not found for the given ASIN");
  }

  // origem de href não server pois é a extensão
  const href = bookAnchorElement.href;
  const url = goodreadsURL(href.slice(href.indexOf("/book")));

  return url;
}

/**
 * Extrai todas as informações de avaliação de um documento HTML do Goodreads.
 * Combina avaliação média, quantidade total de avaliações e distribuição por estrelas.
 *
 * @param doc - Documento HTML parseado da página do Goodreads
 * @param url - URL da página para construir o link das avaliações
 * @returns Reviews completo com todas as informações extraídas
 */
function parseReviews(doc: Document, url: string): Reviews {
  const rating = getRating(doc);
  const amount = getAmountOfReviews(doc);
  const stars = getStars(doc);

  const reviews: Reviews = {
    rating,
    amount,
    stars,
    url: `${url}${config.goodreads.communityReviewsFilter}`,
  };

  return reviews;
}

/**
 * Extrai a avaliação média de um documento HTML do Goodreads.
 *
 * @param doc - O documento HTML parseado para extrair a avaliação
 * @returns A avaliação formatada como string (com vírgula como separador decimal)
 * @throws Error se o elemento de avaliação não for encontrado
 */
function getRating(doc: Document): string {
  const ratingElement = getElement<HTMLDivElement>(
    config.selectors.rating,
    doc,
  );
  if (!ratingElement) {
    logger.error("elemento de classificação não encontrado no documento");
    throw new Error("rating not found");
  }

  const rawRating = ratingElement.innerText;
  const formattedRating = roundRating(rawRating).replace(".", ",");

  return formattedRating;
}

/**
 * Arredonda uma avaliação para uma casa decimal.
 * Utiliza arredondamento matemático padrão para garantir precisão.
 *
 * @param rating - A avaliação a ser arredondada (como string)
 * @returns A avaliação arredondada como string com uma casa decimal
 */
function roundRating(rating: string): string {
  const num = Number.parseFloat(rating);
  const scaled = num * 10;
  const rounded = Math.round(scaled);
  const result = (rounded / 10).toFixed(1);

  return result;
}

/**
 * Extrai a quantidade total de avaliações de um documento HTML do Goodreads.
 *
 * @param doc - O documento HTML parseado para extrair a contagem
 * @returns O número total de avaliações como inteiro
 * @throws Error se o elemento de contagem não for encontrado
 * ```
 */
function getAmountOfReviews(doc: Document): number {
  const ratingsCountElement = getElement<HTMLSpanElement>(
    config.selectors.ratingsCount,
    doc,
  );
  if (!ratingsCountElement) {
    logger.error("elemento de contagem de avaliações não encontrado");
    throw new Error("ratings count not found");
  }

  const innerHTML = ratingsCountElement.innerHTML;
  const rawAmount = innerHTML.slice(0, innerHTML.indexOf("<")).replace(",", "");
  const amount = Number.parseInt(rawAmount);

  return amount;
}

/**
 * Extrai as informações de distribuição de estrelas de um documento HTML do Goodreads.
 * Processa cada nível de estrelas (5 a 1) com sua quantidade e porcentagem correspondente.
 *
 * @param doc - O documento HTML parseado para extrair as informações das estrelas
 * @returns Array de objetos Star contendo rank, quantidade e porcentagem
 * @throws Error se os elementos de ranking de estrelas não forem encontrados
 */
function getStars(doc: Document): Star[] {
  const starsElement = getElements<HTMLDivElement>(config.selectors.stars, doc);
  if (!starsElement) {
    logger.error("elementos de ranking de estrelas não encontrados");
    throw new Error("star ranks not found");
  }

  const stars: Star[] = starsElement.map((starRankElement, idx) => {
    const text = starRankElement.innerText;
    const [amount, percentage] = text.split(" ");
    const rank = 5 - idx;
    const parsedAmount = Number.parseInt(amount.replace(",", ""));
    const parsedPercentage = percentage.slice(1, percentage.indexOf("%"));

    return {
      rank,
      amount: parsedAmount,
      percentage: parsedPercentage,
    };
  });

  return stars;
}
