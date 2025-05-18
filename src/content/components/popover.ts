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
 * Inserts the popover element into the page.
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

  const span = getElement<HTMLSpanElement>(config.selectors.acrPopover);
  const popover = getElement<HTMLDivElement>(config.selectors.popover);

  setupPopoverStyles(popover);
  setPopoverEventListeners(span, popover);
}

function setupPopoverStyles(popover: HTMLDivElement) {
  popover.style.opacity = "0";
  popover.style.display = "none";
  popover.style.transition = `opacity ${config.ui.popoverAnimationDurationInMs}ms linear`;
  popover.style.zIndex = "9999";
}

/**
 * Creates a star item for the popover.
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
 * Sets up event listeners for the popover.
 */
function setPopoverEventListeners(
  span: HTMLSpanElement,
  popover: HTMLDivElement,
) {
  const popoverState = createPopoverState();
  setupSpanEventListeners(span, popover, popoverState);
  setupPopoverEventListeners(popover, popoverState);
}

/**
 * Creates and returns the state object for the popover.
 */
function createPopoverState() {
  return {
    hoverTimeout: null as number | null,
    hideDelayTimeout: null as number | null,
    spanHover: false,
    popoverHover: false,
    popoverActive: false,
    isHiding: false,

    shouldShowPopover() {
      return (
        this.popoverActive &&
        !this.isHiding &&
        (this.spanHover || this.popoverHover)
      );
    },
  };
}

/**
 * Sets up event listeners for the span element.
 */
function setupSpanEventListeners(
  span: HTMLSpanElement,
  popover: HTMLDivElement,
  state: ReturnType<typeof createPopoverState>,
) {
  span.addEventListener("mouseenter", () => {
    state.spanHover = true;
    showPopover(popover, state);
  });

  span.addEventListener("mouseleave", () => {
    state.spanHover = false;
    considerHiding(popover, state);
  });
}

/**
 * Sets up event listeners for the popover element.
 */
function setupPopoverEventListeners(
  popover: HTMLDivElement,
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

    state.popoverHover = true;
    popover.style.opacity = "1";
  });

  popover.addEventListener("mouseleave", () => {
    state.popoverHover = false;
    considerHiding(popover, state);
  });
}

/**
 * Shows the popover.
 */
function showPopover(
  popover: HTMLDivElement,
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

  state.popoverActive = true;

  // make popover visible to get width, but with 0 opacity first
  popover.style.display = "block";
  popover.style.opacity = "0";

  positionPopover(popover);

  popover.style.opacity = "1";
  setAriaHidden(popover, "false");
}

/**
 * Positions the popover relative to the span.
 */
function positionPopover(popover: HTMLDivElement) {
  const span = getElement<HTMLSpanElement>(config.selectors.acrPopover);
  const spanRect = span.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();

  const left = spanRect.left + spanRect.width / 2 - popoverRect.width / 2;
  const top = spanRect.bottom + 1;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

/**
 * Considers hiding the popover after a delay.
 */
function considerHiding(
  popover: HTMLDivElement,
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
 * Hides the popover.
 */
function hidePopover(
  popover: HTMLDivElement,
  state: ReturnType<typeof createPopoverState>,
) {
  state.isHiding = true;

  if (state.hoverTimeout !== null) {
    clearTimeout(state.hoverTimeout);
  }

  popover.style.opacity = "0";

  state.hoverTimeout = window.setTimeout(() => {
    popover.style.display = "none";
    popover.style.left = "auto";
    popover.style.top = "auto";
    setAriaHidden(popover, "true");
    state.popoverActive = false;
    state.isHiding = false;
  }, config.ui.popoverAnimationDurationInMs);
}
