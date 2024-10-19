import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(messageHandler);

/**
 * A better description of the function parameters: {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
 *
 * @returns {boolean} Wheter the function will respond asychronously.
 */
function messageHandler(message, sender, sendResponse) {
  if (message.type !== "getRating") {
    return false;
  }

  if (message.site === "goodreads") {
    if (message.codeFormat === "isbn") {
      getGoodreadsRatingByISBN(message.code)
        .then((rating) => {
          sendResponse({ rating: rating, err: null });
        })
        .catch((error) => {
          sendResponse({ rating: null, err: error });
        });

      return true;
    }
  }

  return false;
}

/**
 * Gets book rating on {@link https://goodreads.com|Goodreads} based on the ISBN-13 code.
 *
 * @throws On fetch errors and query selection `null` return.
 * @param {string} isbn ISBN-13 code of the book.
 * @returns {Promise<string>} Rating with 1 decimal place.
 */
async function getGoodreadsRatingByISBN(isbn) {
  const url = `https://www.goodreads.com/search?q=${isbn}/`;
  const qSelector = 'div.RatingStatistics__rating[aria-hidden="true"]';

  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const ratingElement = doc.querySelector(qSelector);

  if (!ratingElement) {
    throw new Error("rating element not found while fetching goodreads rating");
  }

  return ratingElement.innerText.trim().substring(0, 3);
}
