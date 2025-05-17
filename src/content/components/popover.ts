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
  logger.log("inserting goodreads popover");

  const parser = new DOMParser();
  const popoverBase = parser.parseFromString(popoverBaseHTML, "text/html").body
    .firstElementChild as HTMLDivElement;

  const starsFilled = getElement<HTMLElement>(
    config.selectors.popoverStarsFilled,
    popoverBase,
  );
  starsFilled.classList.add(generateStarClass(reviews.rating, false));

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

  setPopoverEventListeners();
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
function setPopoverEventListeners() {
  const span = getElement<HTMLSpanElement>(config.selectors.acrPopover);
  const popover = getElement<HTMLDivElement>(config.selectors.popover);

  // NOTE: this shouldn't be here, but I don't really care
  popover.style.transition = `opacity ${config.ui.popoverAnimationDurationInMs}ms linear`;

  let hoverTimeout: number | null = null;
  let hideDelayTimeout: number | null = null;
  let spanHover = false;
  let popoverHover = false;
  let popoverActive = false;
  let isHiding = false;

  const shouldShowPopover = () =>
    popoverActive && !isHiding && (spanHover || popoverHover);

  const showPopover = () => {
    if (isHiding) return;

    if (hideDelayTimeout !== null) {
      clearTimeout(hideDelayTimeout);
      hideDelayTimeout = null;
    }

    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    popoverActive = true;

    // make popover visible to get width, but with 0 opacity first
    popover.style.display = "block";
    popover.style.opacity = "0";

    const spanRect = span.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    const left = spanRect.left + spanRect.width / 2 - popoverRect.width / 2;
    const top = spanRect.bottom + 1;

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.style.opacity = "1";
    setAriaHidden(popover, "false");
  };

  const hidePopover = () => {
    isHiding = true;

    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
    }

    popover.style.opacity = "0";

    hoverTimeout = window.setTimeout(() => {
      popover.style.display = "none";
      popover.style.left = "auto";
      popover.style.top = "auto";
      setAriaHidden(popover, "true");
      popoverActive = false;
      isHiding = false;
    }, config.ui.popoverAnimationDurationInMs);
  };

  const considerHiding = () => {
    if (isHiding) return;

    if (hideDelayTimeout !== null) {
      clearTimeout(hideDelayTimeout);
    }

    hideDelayTimeout = window.setTimeout(() => {
      if (!shouldShowPopover()) {
        hidePopover();
      }
      hideDelayTimeout = null;
    }, config.ui.popoverDelayBeforeHidingInMs);
  };

  const handleSpanMouseEnter = () => {
    spanHover = true;
    showPopover();
  };

  const handleSpanMouseLeave = () => {
    spanHover = false;
    considerHiding();
  };

  const handlePopoverMouseEnter = () => {
    if (isHiding) return;

    if (hideDelayTimeout !== null) {
      clearTimeout(hideDelayTimeout);
      hideDelayTimeout = null;
    }

    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    popoverHover = true;
    popover.style.opacity = "1";
  };

  const handlePopoverMouseLeave = () => {
    popoverHover = false;
    considerHiding();
  };

  span.addEventListener("mouseenter", handleSpanMouseEnter);
  span.addEventListener("mouseleave", handleSpanMouseLeave);
  popover.addEventListener("mouseenter", handlePopoverMouseEnter);
  popover.addEventListener("mouseleave", handlePopoverMouseLeave);
}
