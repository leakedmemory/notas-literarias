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

function setupPopoverStyles(popover: HTMLElement) {
  popover.style.opacity = "0";
  popover.style.display = "none";
  popover.style.transition = `opacity ${config.ui.popoverAnimationDurationInMs}ms linear`;
  popover.style.zIndex = "9999";
}

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

function setEventListeners(trigger: HTMLElement, popover: HTMLElement) {
  const popoverState = createPopoverState();
  setupTriggerEventListeners(trigger, popover, popoverState);
  setupPopoverEventListeners(popover, popoverState);
  setupScrollEventListener(trigger, popover, popoverState);
}

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
 * Positions the popover relative to the span, accounting for page scroll.
 */
function positionPopover(trigger: HTMLElement, popover: HTMLElement) {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();

  const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
  const top = triggerRect.bottom + 1;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

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
