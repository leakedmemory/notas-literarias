import popoverBaseHTML from "../../templates/popover/base.html?raw";
import popoverStarItemHTML from "../../templates/popover/star-item.html?raw";

import logger from "../../shared/logger";
import {
  setInnerTextAndPreserveChildren,
  setAriaHidden,
  getElement,
  getElements,
} from "../../shared/dom";
import type { Reviews, Star } from "../../shared/types";
import { config } from "../../shared/config";

import { generateStarClass } from "../styles";

/**
 * Insere o popover de avaliações do Goodreads na página.
 * Cria um popover interativo que mostra detalhes das avaliações quando o usuário
 * passa o mouse sobre a avaliação principal. Inclui histograma de estrelas e links.
 *
 * @param reviews - Objeto contendo todas as informações de avaliação do Goodreads
 */
export function insertPopover(reviews: Reviews) {
  logger.log("inserindo popover de avaliações do goodreads");

  const parser = new DOMParser();
  const popoverBase = parser.parseFromString(popoverBaseHTML, "text/html").body
    .firstElementChild as HTMLDivElement;

  const starsFilled = getElement<HTMLElement>(
    config.selectors.popoverStarsFilled,
    popoverBase,
  );

  const starsClass = generateStarClass(reviews.rating, false);
  starsFilled.classList.add(starsClass);

  const ariaHidden = getElement<HTMLSpanElement>(
    config.selectors.popoverAriaHidden,
    popoverBase,
  );
  ariaHidden.innerText = `${reviews.rating} ${config.ui.ratingOf5}`;

  const aokOffscreen = getElement<HTMLSpanElement>(
    config.selectors.popoverAokOffscreen,
    popoverBase,
  );
  aokOffscreen.innerText = `${config.ui.averageRating}: ${reviews.rating} ${config.ui.ratingOf5} ${config.ui.stars}`;

  const totalReviewCount = getElement<HTMLSpanElement>(
    config.selectors.popoverTotalReviewCount,
    popoverBase,
  );
  totalReviewCount.innerText = `${reviews.amount.toLocaleString().replace(",", ".")} ${config.ui.globalRatings}`;

  const allRatings = getElement<HTMLAnchorElement>(
    config.selectors.popoverAcrLink,
    popoverBase,
  );
  allRatings.href = reviews.url;
  allRatings.target = "_blank";
  allRatings.rel = "noopener noreferrer";

  const popoverStarItem = parser.parseFromString(
    popoverStarItemHTML,
    "text/html",
  ).body.firstElementChild as HTMLLIElement;

  const ul = getElement<HTMLUListElement>(
    config.selectors.popoverHistogramTable,
    popoverBase,
  );

  for (let i = 0; i < 5; i++) {
    const base = popoverStarItem.cloneNode(true) as HTMLLIElement;
    createStarItem(base, reviews.stars as Star[], i, reviews.url);
    ul.appendChild(base);
  }

  const container = document.createElement("div");
  container.appendChild(popoverBase);
  document.body.appendChild(container);

  const trigger = getElement<HTMLSpanElement>(config.selectors.acrPopover);
  const popover = getElement<HTMLDivElement>(config.selectors.popover);

  setupPopoverStyles(popover);
  setEventListeners(trigger, popover);
}

/**
 * Configura os estilos iniciais do popover.
 * Define propriedades CSS necessárias para animações e posicionamento correto.
 *
 * @param popover - O elemento HTML do popover
 */
function setupPopoverStyles(popover: HTMLElement) {
  popover.style.opacity = "0";
  popover.style.display = "none";
  popover.style.transition = `opacity ${config.ui.popoverAnimationDurationInMs}ms linear`;
  popover.style.zIndex = "9999";
}

/**
 * Cria um item individual do histograma de estrelas no popover.
 * Configura links, porcentagens, textos e acessibilidade para cada nível de estrela.
 *
 * @param base - Elemento HTML base do item de estrela (será modificado)
 * @param stars - Array com informações de todas as estrelas
 * @param currentStarIdx - Índice da estrela atual sendo processada (0-4)
 * @param url - URL base para links do Goodreads
 */
function createStarItem(
  base: HTMLLIElement,
  stars: Star[],
  currentStarIdx: number,
  url: string,
) {
  const anchor = getElement<HTMLAnchorElement>(
    config.selectors.popoverRatingAnchor,
    base,
  );
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.ariaLabel = `${stars[currentStarIdx].percentage}% de avaliações possuem ${stars[currentStarIdx].rank} ${config.ui.stars}`;

  const columnStars = getElement<HTMLDivElement>(
    config.selectors.popoverRatingColumnStars,
    base,
  );
  setInnerTextAndPreserveChildren(
    columnStars,
    `${stars[currentStarIdx].rank} ${config.ui.stars}`,
  );

  const valueNow = getElement<HTMLDivElement>(
    config.selectors.popoverAriaValueNow,
    base,
  );
  valueNow.ariaValueNow = `${stars[currentStarIdx].percentage}`;

  const width = getElement<HTMLDivElement>(
    config.selectors.popoverPercentageWidth,
    base,
  );
  width.style.width = `${stars[currentStarIdx].percentage}%`;

  const histogramColumns = getElement<HTMLDivElement>(
    config.selectors.popoverHistogramColumns,
    base,
  );
  setInnerTextAndPreserveChildren(
    histogramColumns,
    `${stars[currentStarIdx].percentage}%`,
  );

  const histogramColumnsChildren = getElements<HTMLSpanElement>(
    "*",
    histogramColumns,
  );
  for (const [i, child] of histogramColumnsChildren.entries()) {
    child.innerText = `${stars[i].percentage}%`;
  }
}

/**
 * Configura todos os event listeners necessários para o funcionamento do popover.
 * Inclui eventos de hover, scroll e gerenciamento de estado.
 *
 * @param trigger - Elemento que dispara a exibição do popover
 * @param popover - Elemento do popover a ser exibido/ocultado
 */
function setEventListeners(trigger: HTMLElement, popover: HTMLElement) {
  const popoverState = createPopoverState();
  setupTriggerEventListeners(trigger, popover, popoverState);
  setupPopoverEventListeners(popover, popoverState);
  setupScrollEventListener(trigger, popover, popoverState);
}

/**
 * Cria e retorna um objeto de estado para controlar o comportamento do popover.
 * Gerencia timeouts, estados de hover e lógica de exibição/ocultação.
 *
 * @returns Objeto com propriedades e métodos para gerenciar o estado do popover
 */
function createPopoverState() {
  return {
    hoverTimeout: null as number | null,
    hideDelayTimeout: null as number | null,
    isTriggerOnHover: false,
    isPopoverOnHover: false,
    isPopoverActive: false,
    isHiding: false,

    shouldShowPopover() {
      return (
        this.isPopoverActive &&
        !this.isHiding &&
        (this.isTriggerOnHover || this.isPopoverOnHover)
      );
    },
  };
}

/**
 * Configura os event listeners para o elemento que dispara o popover.
 * Gerencia eventos de mouseenter e mouseleave no trigger.
 *
 * @param trigger - Elemento que dispara a exibição do popover
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function setupTriggerEventListeners(
  trigger: HTMLElement,
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  trigger.addEventListener("mouseenter", () => {
    state.isTriggerOnHover = true;
    showPopover(trigger, popover, state);
  });

  trigger.addEventListener("mouseleave", () => {
    state.isTriggerOnHover = false;
    considerHiding(popover, state);
  });
}

/**
 * Configura os event listeners para o próprio popover.
 * Permite que o usuário mova o mouse para dentro do popover sem que ele desapareça.
 *
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function setupPopoverEventListeners(
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  popover.addEventListener("mouseenter", () => {
    if (state.isHiding) return;

    if (state.hideDelayTimeout !== null) {
      clearTimeout(state.hideDelayTimeout);
      state.hideDelayTimeout = null;
    }

    if (state.hoverTimeout !== null) {
      clearTimeout(state.hoverTimeout);
      state.hoverTimeout = null;
    }

    state.isPopoverOnHover = true;
    popover.style.opacity = "1";
  });

  popover.addEventListener("mouseleave", () => {
    state.isPopoverOnHover = false;
    considerHiding(popover, state);
  });
}

/**
 * Configura listener para eventos de scroll da página.
 * Reposiciona o popover quando a página é rolada para manter a posição correta.
 *
 * @param trigger - Elemento que dispara o popover
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function setupScrollEventListener(
  trigger: HTMLElement,
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  const handleScroll = () => {
    if (state.isPopoverActive && !state.isHiding) {
      positionPopover(trigger, popover);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
}

/**
 * Exibe o popover com animação e posicionamento correto.
 * Cancela timeouts de ocultação e configura a posição relativa ao trigger.
 *
 * @param trigger - Elemento que dispara o popover
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function showPopover(
  trigger: HTMLElement,
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  if (state.isHiding) return;

  if (state.hideDelayTimeout !== null) {
    clearTimeout(state.hideDelayTimeout);
    state.hideDelayTimeout = null;
  }

  if (state.hoverTimeout !== null) {
    clearTimeout(state.hoverTimeout);
    state.hoverTimeout = null;
  }

  state.isPopoverActive = true;

  // display popover to get width, but maintain 0 opacity
  popover.style.display = "block";
  popover.style.position = "fixed";

  positionPopover(trigger, popover);

  popover.style.opacity = "1";
  setAriaHidden(popover, "false");
}

/**
 * Posiciona o popover relativo ao elemento trigger, considerando o scroll da página.
 * Centraliza horizontalmente o popover em relação ao trigger e o posiciona logo abaixo.
 *
 * @param trigger - Elemento de referência para posicionamento
 * @param popover - Elemento do popover a ser posicionado
 */
function positionPopover(trigger: HTMLElement, popover: HTMLElement) {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();

  const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  const top = triggerRect.bottom + 1;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

/**
 * Avalia se o popover deve ser ocultado após um delay.
 * Implementa lógica de debounce para evitar que o popover desapareça muito rapidamente.
 *
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function considerHiding(
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  if (state.isHiding) return;

  if (state.hideDelayTimeout !== null) {
    clearTimeout(state.hideDelayTimeout);
  }

  state.hideDelayTimeout = window.setTimeout(() => {
    if (!state.shouldShowPopover()) {
      hidePopover(popover, state);
    }
    state.hideDelayTimeout = null;
  }, config.ui.popoverDelayBeforeHidingInMs);
}

/**
 * Oculta o popover com animação e limpa o estado.
 * Gerencia a transição de posicionamento fixo para absoluto e restaura propriedades.
 *
 * @param popover - Elemento do popover
 * @param state - Estado compartilhado do popover
 */
function hidePopover(
  popover: HTMLElement,
  state: ReturnType<typeof createPopoverState>,
) {
  state.isHiding = true;

  if (state.hoverTimeout !== null) {
    clearTimeout(state.hoverTimeout);
  }

  const currentPosition = popover.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  popover.style.position = "absolute";
  popover.style.top = `${currentPosition.top + scrollY}px`;
  popover.style.left = `${currentPosition.left + scrollX}px`;

  popover.style.opacity = "0";

  state.hoverTimeout = window.setTimeout(() => {
    popover.style.display = "none";
    popover.style.position = "";
    popover.style.left = "auto";
    popover.style.top = "auto";

    setAriaHidden(popover, "true");

    state.isPopoverActive = false;
    state.isHiding = false;
  }, config.ui.popoverAnimationDurationInMs);
}
