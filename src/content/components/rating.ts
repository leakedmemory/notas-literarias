import { config } from "../../shared/config";
import {
  addExtensionPrefixToElementIDs,
  getElement,
  removeAmazonEventAttributes,
} from "../../shared/dom";
import logger from "../../shared/logger";
import type { Reviews } from "../../shared/types";
import { generateStarClass } from "../styles";

/**
 * Obtém o elemento de referência que contém a avaliação da Amazon.
 * Procura por diferentes seletores de container de avaliação para garantir compatibilidade
 * com diferentes layouts da Amazon.
 *
 * @returns O elemento que contém as informações de avaliação da Amazon
 * @throws Error se nenhum elemento de referência for encontrado
 */
export function getRatingReference(): Element {
  const selectors = config.selectors.ratingContainer.split(", ");
  let ref: Element | null = null;

  for (const selector of selectors) {
    ref = document.querySelector(selector);
    if (ref) break;
  }

  if (!ref) {
    throw new Error("elemento de referência de avaliação não encontrado");
  }

  return ref;
}

/**
 * Insere o elemento de avaliação do Goodreads na página da Amazon.
 * Clona o elemento de avaliação existente da Amazon, modifica suas propriedades
 * para exibir dados do Goodreads e o insere logo após o elemento original.
 *
 * @param reviews - Objeto contendo todas as informações de avaliação do Goodreads
 * @throws Error quando algum elemento necessário não é encontrado no DOM
 */
export function insertBookRatingElement(reviews: Reviews) {
  logger.log("inserindo elemento de avaliação do livro");

  const ratingRef = getRatingReference();
  const ratingElement = ratingRef.cloneNode(true) as HTMLDivElement;

  addExtensionPrefixToElementIDs(ratingElement);

  const popTitle = changePopTitle(ratingElement, reviews);
  changeRatingValue(ratingElement, popTitle);
  changeStarsRepresentation(ratingElement, reviews);
  changeCustomerReviewsRedirection(ratingElement, reviews);

  removeAmazonEventAttributes(ratingElement);

  ratingRef.insertAdjacentElement("afterend", ratingElement);
  logger.log("elemento de avaliação do goodreads inserido com sucesso");
}

/**
 * Altera a mensagem que aparece quando o usuário passa o mouse sobre a avaliação.
 * Modifica o atributo title do elemento para mostrar a avaliação do Goodreads.
 *
 * @param rating - Elemento HTML da avaliação
 * @param reviews - Objeto contendo as informações de avaliação do Goodreads
 * @returns O novo título configurado no elemento
 * @throws Error se o elemento de título não for encontrado
 */
function changePopTitle(rating: HTMLElement, reviews: Reviews): string {
  const title = getElement<HTMLSpanElement>(config.selectors.popTitle, rating);
  if (!title) {
    throw new Error("elemento de título não encontrado");
  }

  const newTitle = title.title.split(" ");
  newTitle[0] = reviews.rating.replace(".", ",");
  title.title = newTitle.join(" ");

  return title.title;
}

/**
 * Altera o valor numérico da avaliação exibido antes das estrelas.
 *
 * @param rating - Elemento HTML da avaliação
 * @param title - String contendo o título com a nova avaliação
 * @throws Error se o elemento de valor da avaliação não for encontrado
 */
function changeRatingValue(rating: HTMLElement, title: string) {
  const ratingValue = getElement<HTMLSpanElement>(
    config.selectors.ratingValue,
    rating,
  );
  if (!ratingValue) {
    throw new Error("elemento de valor de avaliação não encontrado");
  }

  ratingValue.innerText = title.split(" ")[0];
}

/**
 * Altera a representação visual das estrelas para corresponder à avaliação do Goodreads.
 * Substitui a classe CSS que controla quantas estrelas são preenchidas e atualiza
 * o texto alternativo para acessibilidade.
 *
 * @param rating - Elemento HTML da avaliação
 * @param reviews - Objeto contendo as informações de avaliação do Goodreads
 * @throws Error se o elemento de representação de estrelas não for encontrado
 *
 */
function changeStarsRepresentation(rating: HTMLElement, reviews: Reviews) {
  let isMini = false;
  let stars = getElement<HTMLElement>(config.selectors.ratingStars, rating);

  if (!stars) {
    stars = getElement<HTMLElement>(config.selectors.ratingStarsMini, rating);
    if (!stars) {
      throw new Error("elemento de representação de estrelas não encontrado");
    }
    isMini = true;
  }

  // classe que controla quantas estrelas estão preenchidas
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.startsWith("a-star-")) {
    throw new Error("classe de estrelas não encontrada");
  }

  const newStarsClass = generateStarClass(reviews.rating, isMini);
  stars.classList.replace(starsFilledClass, newStarsClass);

  // representação alternativa do elemento (neste caso, outro elemento)
  const selector = isMini
    ? config.selectors.ratingStarsMiniAlt
    : config.selectors.ratingStarsAlt;

  const starsAlt =
    getElement<HTMLSpanElement>(selector, stars) ||
    (stars.firstElementChild as HTMLSpanElement);

  if (!starsAlt) {
    throw new Error("elemento alt de estrelas não encontrado");
  }

  starsAlt.innerText = `${reviews.rating}${starsAlt.innerText.substring(3)}`;
}

/**
 * Altera o texto de contagem de avaliações e adiciona indicação da fonte (Goodreads).
 * Substitui o número original de avaliações pelo número do Goodreads e adiciona
 * a indicação "(goodreads)" para deixar claro a origem dos dados.
 *
 * @param rating - Elemento HTML contendo o texto da contagem
 * @param ratingCount - Número total de avaliações do Goodreads
 */
function changeRatingCount(rating: HTMLElement, ratingCount: number) {
  const currentText = rating.innerText;
  const match = currentText.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d)*)/);

  if (match) {
    const oldValue = match[0];
    const formattedRatingsCount = ratingCount
      .toLocaleString()
      .replace(",", ".");

    const newText = `${currentText.replace(oldValue, formattedRatingsCount)} ${config.ui.goodreadsSource}`;
    rating.innerText = newText;
  } else {
    logger.error(
      `padrão de contagem não encontrado no texto atual: "${currentText}"`,
    );
  }
}

/**
 * Altera o redirecionamento do link de avaliações de clientes para o Goodreads.
 * Modifica o link que normalmente levaria às avaliações da Amazon para que
 * leve às avaliações do Goodreads, abrindo em nova aba com segurança.
 *
 * @param rating - Elemento HTML da avaliação
 * @param reviews - Objeto contendo as informações de avaliação do Goodreads
 * @throws Error se o elemento de avaliações de clientes não for encontrado
 */
function changeCustomerReviewsRedirection(
  rating: HTMLElement,
  reviews: Reviews,
) {
  const customerReviewsElement = getElement<HTMLAnchorElement>(
    config.selectors.customerReviews,
    rating,
  );
  if (!customerReviewsElement) {
    throw new Error("elemento de avaliações de clientes não encontrado");
  }

  customerReviewsElement.href = reviews.url;
  customerReviewsElement.target = "_blank";
  customerReviewsElement.rel = "noopener noreferrer";

  const customerReviewsCountElement =
    getElement<HTMLSpanElement>(":scope > span", customerReviewsElement) ||
    (customerReviewsElement.firstElementChild as HTMLSpanElement);

  if (!customerReviewsCountElement) {
    throw new Error(
      "elemento de contagem de avaliações de clientes não encontrado",
    );
  }

  changeRatingCount(customerReviewsCountElement, reviews.amount);
}
