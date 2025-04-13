import browser from "webextension-polyfill";

import logger from "./logger";

import popoverBaseHTML from "./popover/base.html";
import popoverStarItemHTML from "./popover/star-item.html";

import type {
  Product,
  GetReviewsMessage,
  GetReviewsResponse,
  Reviews,
  Star,
} from "./messages";

import { CodeFormat } from "./messages";

(function main() {
  if (!isProductPage()) {
    return;
  }

  const details = Array.from(
    document.querySelectorAll(
      "div#detailBullets_feature_div > ul > li > span > span",
    ),
  ) as HTMLSpanElement[];
  if (!details) {
    logger.error("product details section not found");
    return;
  }

  const productInfo = getProductInfo(details);
  if (!productInfo) {
    logger.error("product does not have ISBN-13 or ASIN code");
    return;
  }

  if (CodeFormat.ISBN === productInfo.format) {
    logger.log(`found book with ${productInfo.code} ISBN-13 code`);
  } else {
    // NOTE: even if the product has an ASIN code, it does not mean it is a book
    logger.log(`found product with ${productInfo.code} ASIN code`);
  }

  fetchAndInsertReviews(productInfo);
})();

function isProductPage(): boolean {
  return document.querySelector("#detailBullets_feature_div") !== null;
}

/**
 * Gets the ISBN-13 or ASIN code of the product. If both are present,
 * the ISBN-13 will be returned.
 */
function getProductInfo(details: HTMLSpanElement[]): Product | null {
  const product: Product = { code: "", format: CodeFormat.ASIN };
  let foundASIN = false;
  for (const [i, detail] of details.entries()) {
    if (detail.innerText === "ISBN-13  : ") {
      product.code = details[i + 1].innerText;
      product.format = CodeFormat.ISBN;
      return product;
    }

    if (detail.innerText === "ASIN  : ") {
      product.code = details[i + 1].innerText;
      foundASIN = true;
    }
  }

  if (foundASIN) {
    return product;
  }

  return null;
}

/**
 * Inserts the loading spinner into the page
 */
function insertLoadingSpinner() {
  logger.log("inserting loading spinner");

  const ratingRef = getRatingReference();

  // Create spinner container
  const spinnerContainer = document.createElement("div");
  spinnerContainer.id = "bookratings_spinner_container";
  spinnerContainer.style.display = "flex";
  spinnerContainer.style.alignItems = "center";
  spinnerContainer.style.marginTop = "5px";
  spinnerContainer.style.marginBottom = "5px";

  // Create spinner element
  const spinner = document.createElement("div");
  spinner.id = "bookratings_spinner";
  spinner.className = "bookratings_loader";

  // Create loading text
  const loadingText = document.createElement("span");
  loadingText.id = "bookratings_loading_text";
  loadingText.innerText = "Buscando classificações do Goodreads...";
  loadingText.style.marginLeft = "10px";
  loadingText.style.fontSize = "14px";

  // Append elements
  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(loadingText);

  // Insert after rating reference
  ratingRef.insertAdjacentElement("afterend", spinnerContainer);
}

/**
 * Removes the loading spinner from the page
 */
function removeLoadingSpinner() {
  logger.log("removing loading spinner");
  const spinnerContainer = document.getElementById(
    "bookratings_spinner_container",
  );
  if (spinnerContainer) {
    spinnerContainer.remove();
  }
}

function fetchAndInsertReviews(product: Product) {
  logger.log("trying to fetch goodreads rating");

  // Insert loading spinner first
  insertLoadingSpinner();

  // Add spinner CSS
  insertSpinnerStyles();

  const msg: GetReviewsMessage = { msg: "fetchGoodreads", product: product };
  browser.runtime
    .sendMessage(msg)
    .then((response: unknown) => {
      // Remove the spinner when response is received
      removeLoadingSpinner();

      const reviewsResponse = response as GetReviewsResponse;
      if (reviewsResponse.err) {
        logger.error(
          `${reviewsResponse.err} [while fetching goodreads rating]`,
        );
        return;
      }

      const reviews = reviewsResponse.reviews;
      logger.log(`goodreads rating: ${reviews.rating}`);
      insertReviews(reviews);
    })
    .catch((error) => {
      // Also remove spinner on error
      removeLoadingSpinner();
      logger.error(`${error} [while fetching goodreads rating]`);
    });
}

/**
 * Inserts the CSS for the spinner
 */
function insertSpinnerStyles() {
  const css = `
    .bookratings_loader {
      width: 24px;
      aspect-ratio: 1;
      border-radius: 50%;
      background:
        radial-gradient(farthest-side,#ffa516 94%,#0000) top/8px 8px no-repeat,
        conic-gradient(#0000 30%,#ffa516);
      -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
      animation: bookratings_spinner 1s infinite linear;
    }

    @keyframes bookratings_spinner {
      100% { transform: rotate(1turn) }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting spinner styles");
  document.head.appendChild(styleElement);
}

function insertReviews(reviews: Reviews) {
  try {
    insertBookRatingElement(reviews);
    insertCustomStyles();
    insertPopover(reviews);
  } catch (err: unknown) {
    logger.error(`${err} [while inserting goodreads rating]`);
  }
}

/**
 * Inserts `reviews` by copying the review element of the product page and
 * changing its properties.
 *
 * @throws When some element is not found in the DOM.
 */
function insertBookRatingElement(reviews: Reviews) {
  const ratingRef = getRatingReference();
  const ratingElement = ratingRef.cloneNode(true) as HTMLDivElement;
  addExtensionPrefixToElementIDs(ratingElement);

  const popTitle = changePopTitle(ratingElement, reviews);
  changeRatingValue(ratingElement, popTitle);
  changeStarsRepresentation(ratingElement, reviews);
  changeCustomerReviewsRedirection(ratingElement, reviews);
  removeAmazonEventAttributes(ratingElement);

  logger.log("inserting goodreads rating element");

  ratingRef.insertAdjacentElement("afterend", ratingElement);
}

/**
 * Gets the element containing the rating value, the starts representation,
 * and how many reviews the product has.
 *
 * @throws On `null` query selection.
 */
function getRatingReference(): Element {
  const ref =
    document.querySelector("div#averageCustomerReviews") ||
    document.querySelector("div#averageCustomerReviews_feature_div");
  if (!ref) {
    throw new Error("rating reference element not found");
  }

  return ref;
}

/**
 * Adds "bookratings_" prefix to `element` and all of its children.
 */
function addExtensionPrefixToElementIDs(element: HTMLElement) {
  element.id = `bookratings_${element.id}`;
  for (const child of element.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }
}

/**
 * Changes the message that appears when hovering the rating.
 *
 * @throws On `null` query selection.
 *
 * @returns The new title.
 */
function changePopTitle(rating: HTMLElement, reviews: Reviews): string {
  const title = rating.querySelector(
    "span#bookratings_acrPopover",
  ) as HTMLSpanElement;
  if (!title) {
    throw new Error("title span element not found");
  }

  const newTitle = title.title.split(" ");
  newTitle[0] = reviews.rating.replace(".", ",");
  title.title = newTitle.join(" ");

  return title.title;
}

/**
 * Changes the rating value before the stars.
 *
 * @throws On `null` query selection.
 */
function changeRatingValue(rating: HTMLElement, title: string) {
  const ratingValue = rating.querySelector("a > span") as HTMLSpanElement;
  if (!ratingValue) {
    throw new Error("literal rating element not found");
  }

  ratingValue.innerText = title.split(" ")[0];
}

/**
 * @throws On `null` query selection.
 */
function changeStarsRepresentation(rating: HTMLElement, reviews: Reviews) {
  let isMini = false;
  let stars = rating.querySelector("a > i.a-icon-star") as HTMLElement;
  if (!stars) {
    stars = rating.querySelector("a > i.a-icon-star-mini") as HTMLElement;
    if (!stars) {
      throw new Error("stars representation element not found");
    }
    isMini = true;
  }

  /** Class that controls how many stars are filled. */
  const starsFilledClass = Array.from(stars.classList)[2];
  if (!starsFilledClass.startsWith("a-star-")) {
    throw new Error("star class not found");
  }

  stars.classList.replace(
    starsFilledClass,
    generateStarClass(reviews.rating, isMini),
  );

  /** Alt representation of the stars, which is a separate element. */
  const starsAlt = stars.firstElementChild as HTMLSpanElement;
  if (!starsAlt) {
    throw new Error("stars alt element not found");
  }

  starsAlt.innerText = `${reviews.rating}${starsAlt.innerText.substring(3)}`;
}

/**
 * Generates the class responsible of controlling how many stars are
 * filled in the stars representation.
 *
 * @returns Class to add to the stars element.
 */
function generateStarClass(rating: string, isMini: boolean): string {
  const prefix = isMini ? "a-star-mini-" : "a-star-";

  // 4.8+ rating does not follow the pattern of half star and
  // goes directly to 5 stars
  if (Number.parseFloat(rating) >= 4.8) {
    return `${prefix}5`;
  }

  // with half star
  if (Number.parseInt(rating[2]) >= 5) {
    return `${prefix}${rating[0]}-5`;
  }

  return `${prefix}${rating[0]}`;
}

/**
 * Changes the rating count and adds from which site it was taken.
 *
 * @throws On `null` query selection.
 */
function changeCustomerReviewsRedirection(
  rating: HTMLElement,
  reviews: Reviews,
) {
  const customerReviewsElement = rating.querySelector(
    "a#bookratings_acrCustomerReviewLink",
  ) as HTMLAnchorElement;
  if (!customerReviewsElement) {
    throw new Error("customer reviews element not found");
  }

  customerReviewsElement.href = reviews.sectionURL;
  customerReviewsElement.target = "_blank";
  customerReviewsElement.rel = "noopener noreferrer";

  const customerReviewsCountElement =
    customerReviewsElement.firstElementChild as HTMLSpanElement;
  if (!customerReviewsCountElement) {
    throw new Error("customer reviews count element not found");
  }

  changeRatingCount(customerReviewsCountElement, reviews.amount);
}

/**
 * Changes the rating count following the pattern of `separator` and adds
 * from which site the rating was taken.
 */
function changeRatingCount(rating: HTMLElement, ratingCount: number) {
  const currentText = rating.innerText;
  const match = currentText.match(/(\d{1,3}(?:[.,]\d{3})*(?:\d)*)/);

  if (match) {
    const separator = ".";
    const formattedRatingsCount = ratingCount
      .toLocaleString("en-US", {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/,/g, separator);

    rating.innerText = `${currentText.replace(match[0], formattedRatingsCount)} (goodreads)`;
  }
}

/**
 * Removes all Amazon-related event attributes that could trigger popups.
 */
function removeAmazonEventAttributes(element: HTMLElement) {
  const allElements = [element, ...Array.from(element.querySelectorAll("*"))];

  for (const el of allElements) {
    if (el instanceof HTMLElement) {
      for (const attr of Array.from(el.attributes)) {
        if (
          attr.name.startsWith("data-") ||
          attr.name.includes("aria") ||
          attr.name.includes("popup") ||
          attr.name.includes("hover") ||
          attr.name.includes("onmouse")
        ) {
          el.removeAttribute(attr.name);
        }
      }

      // remove amazon-specific classes that might be used as event selectors
      const classesToRemove = [];
      for (const cls of Array.from(el.classList)) {
        if (
          cls.includes("popup") ||
          cls.includes("hover") ||
          cls.includes("tooltip") ||
          cls.includes("a-popover")
        ) {
          classesToRemove.push(cls);
        }
      }

      for (const cls of classesToRemove) {
        el.classList.remove(cls);
      }
    }
  }
}

/**
 * Modifies the default product page style to better fit other book ratings.
 */
function insertCustomStyles() {
  const css = `
    /* KINDLE ONLY */
    div#reviewFeatureGroup {
      margin-bottom: 7px;
    }

    /* Popover Animation */
    #bookratings_popover {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      display: none;
    }

    #bookratings_popover.visible {
      opacity: 1;
      display: block;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting custom product page styles");
  document.head.appendChild(styleElement);
}

function insertPopover(reviews: Reviews) {
  logger.log("inserting goodreads popover");

  const parser = new DOMParser();
  const popoverBase = parser.parseFromString(popoverBaseHTML, "text/html").body
    .firstElementChild as HTMLDivElement;

  const starsFilled = popoverBase.querySelector(
    "i#bookratings_stars",
  ) as HTMLElement;
  starsFilled.classList.add(generateStarClass(reviews.rating, false));

  const ariaHidden = popoverBase.querySelector(
    "span#bookratings_ariaHidden",
  ) as HTMLSpanElement;
  ariaHidden.innerText = `${reviews.rating} de 5`;

  const aokOffscreen = popoverBase.querySelector(
    "span#bookratings_aokOffscreen",
  ) as HTMLSpanElement;
  aokOffscreen.innerText = `Classificação média: ${reviews.rating} de 5 estrelas`;

  const totalReviewCount = popoverBase.querySelector(
    "span#bookratings_total-review-count",
  ) as HTMLSpanElement;
  totalReviewCount.innerText = `${reviews.amount.toLocaleString().replace(",", ".")} classificações globais`;

  const allRatings = popoverBase.querySelector(
    "a#bookratings_acrPopoverLink",
  ) as HTMLAnchorElement;
  allRatings.href = reviews.sectionURL;
  allRatings.target = "_blank";
  allRatings.rel = "noopener noreferrer";

  const popoverStarItem = parser.parseFromString(
    popoverStarItemHTML,
    "text/html",
  ).body.firstElementChild as HTMLLIElement;

  const ul = popoverBase.querySelector(
    "ul#bookratings_histogramTable",
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

function createStarItem(
  base: HTMLLIElement,
  stars: Star[],
  currentStarIdx: number,
  url: string,
) {
  const anchor = base.querySelector(
    "a#bookratings_popoverRatingAnchor",
  ) as HTMLAnchorElement;
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.ariaLabel = `${stars[currentStarIdx].percentage}% de avaliações possuem ${stars[currentStarIdx].rank} estrelas`;

  const columnStars = base.querySelector(
    "div#bookratings_popoverRatingColumnStars",
  ) as HTMLDivElement;
  setInnerTextWithoutRemovingChildElements(
    columnStars,
    `${stars[currentStarIdx].rank} estrelas`,
  );

  const valueNow = base.querySelector(
    "div#bookratings_popoverAriaValueNow",
  ) as HTMLDivElement;
  valueNow.ariaValueNow = `${stars[currentStarIdx].percentage}`;

  const width = base.querySelector(
    "div#bookratings_popoverPercentageWidth",
  ) as HTMLDivElement;
  width.style.width = `${stars[currentStarIdx].percentage}%`;

  const histogramColumns = base.querySelector(
    "div#bookratings_histogramColumns",
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

function setInnerTextWithoutRemovingChildElements(
  el: HTMLElement,
  txt: string,
) {
  const clone = el.cloneNode(true) as HTMLElement;
  el.innerText = txt;
  // for some reason, using without wrapping into an Array will not
  // append all the children
  for (const c of Array.from(clone.children)) {
    el.appendChild(c);
  }
}

function setPopoverEventListeners() {
  const span = document.getElementById(
    "bookratings_acrPopover",
  ) as HTMLSpanElement;
  const popover = document.getElementById(
    "bookratings_popover",
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

function setAriaHidden(el: Element, value: "true" | "false") {
  if (el.ariaHidden !== null) {
    el.ariaHidden = value;
  }

  for (const c of el.children) {
    setAriaHidden(c, value);
  }
}
