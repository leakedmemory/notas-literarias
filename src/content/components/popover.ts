import logger from "../../shared/logger";
import {
  setInnerTextWithoutRemovingChildElements,
  setAriaHidden,
} from "../../shared/dom";
import type { Reviews, Star } from "../../shared/messages";
import { generateStarClass } from "../styles";
import popoverBaseHTML from "../../templates/popover/base.html?raw";
import popoverStarItemHTML from "../../templates/popover/star-item.html?raw";

/**
 * Inserts the popover element into the page.
 */
export function insertPopover(reviews: Reviews) {
  logger.log("inserting goodreads popover");

  const parser = new DOMParser();
  const popoverBase = parser.parseFromString(popoverBaseHTML, "text/html").body
    .firstElementChild as HTMLDivElement;

  const starsFilled = popoverBase.querySelector(
    "i#notasliterarias-stars",
  ) as HTMLElement;
  starsFilled.classList.add(generateStarClass(reviews.rating, false));

  const ariaHidden = popoverBase.querySelector(
    "span#notasliterarias-ariaHidden",
  ) as HTMLSpanElement;
  ariaHidden.innerText = `${reviews.rating} de 5`;

  const aokOffscreen = popoverBase.querySelector(
    "span#notasliterarias-aokOffscreen",
  ) as HTMLSpanElement;
  aokOffscreen.innerText = `Classificação média: ${reviews.rating} de 5 estrelas`;

  const totalReviewCount = popoverBase.querySelector(
    "span#notasliterarias-total-review-count",
  ) as HTMLSpanElement;
  totalReviewCount.innerText = `${reviews.amount.toLocaleString().replace(",", ".")} classificações globais`;

  const allRatings = popoverBase.querySelector(
    "a#notasliterarias-acrPopoverLink",
  ) as HTMLAnchorElement;
  allRatings.href = reviews.sectionURL;
  allRatings.target = "_blank";
  allRatings.rel = "noopener noreferrer";

  const popoverStarItem = parser.parseFromString(
    popoverStarItemHTML,
    "text/html",
  ).body.firstElementChild as HTMLLIElement;

  const ul = popoverBase.querySelector(
    "ul#notasliterarias-histogramTable",
  ) as HTMLUListElement;

  for (let i = 0; i < 5; i++) {
    const base = popoverStarItem.cloneNode(true) as HTMLLIElement;
    createStarItem(base, reviews.stars as Star[], i, reviews.sectionURL);
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
  const anchor = base.querySelector(
    "a#notasliterarias-popoverRatingAnchor",
  ) as HTMLAnchorElement;
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.ariaLabel = `${stars[currentStarIdx].percentage}% de avaliações possuem ${stars[currentStarIdx].rank} estrelas`;

  const columnStars = base.querySelector(
    "div#notasliterarias-popoverRatingColumnStars",
  ) as HTMLDivElement;
  setInnerTextWithoutRemovingChildElements(
    columnStars,
    `${stars[currentStarIdx].rank} estrelas`,
  );

  const valueNow = base.querySelector(
    "div#notasliterarias-popoverAriaValueNow",
  ) as HTMLDivElement;
  valueNow.ariaValueNow = `${stars[currentStarIdx].percentage}`;

  const width = base.querySelector(
    "div#notasliterarias-popoverPercentageWidth",
  ) as HTMLDivElement;
  width.style.width = `${stars[currentStarIdx].percentage}%`;

  const histogramColumns = base.querySelector(
    "div#notasliterarias-histogramColumns",
  ) as HTMLDivElement;
  setInnerTextWithoutRemovingChildElements(
    histogramColumns,
    `${stars[currentStarIdx].percentage}%`,
  );

  const histogramColumnsChildren = Array.from(
    histogramColumns.children,
  ) as HTMLSpanElement[];
  for (const [i, child] of histogramColumnsChildren.entries()) {
    child.innerText = `${stars[i].percentage}%`;
  }
}

/**
 * Sets up event listeners for the popover.
 */
function setPopoverEventListeners() {
  const span = document.getElementById(
    "notasliterarias-acrPopover",
  ) as HTMLSpanElement;
  const popover = document.getElementById(
    "notasliterarias-popover",
  ) as HTMLDivElement;

  let hoverTimeout: number | null = null;

  span.addEventListener("mouseenter", () => {
    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

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
  });

  span.addEventListener("mouseleave", () => {
    popover.style.opacity = "0";
    hoverTimeout = window.setTimeout(() => {
      if (popover.style.opacity === "0") {
        popover.style.display = "none";
        popover.style.left = "auto";
        popover.style.top = "auto";
        setAriaHidden(popover, "true");
      }
    }, 200);
  });
}
