import browser from "webextension-polyfill";

import type { GetReviewsMessage } from "./messages";

browser.runtime.onMessage.addListener(messageHandler);

/**
 * @see Description of the function parameters: {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
 */
function messageHandler(
  message: unknown,
  // @ts-ignore Unused parameter
  sender: browser.Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): true | Promise<unknown> | undefined {
  const reviewsMessage = message as GetReviewsMessage;

  if (reviewsMessage.site === "goodreads" && reviewsMessage.format === "isbn") {
    getGoodreadsReviewsByISBN(reviewsMessage.code)
      .then((rating) => {
        sendResponse({ rating: rating, err: null });
      })
      .catch((error) => {
        sendResponse({ rating: null, err: error });
      });

    return true;
  }
}

/**
 * @throws On fetch errors and query selection `null` return.
 */
async function getGoodreadsReviewsByISBN(isbn: string): Promise<string> {
  const url = `https://www.goodreads.com/search?q=${isbn}/`;
  const qSelector = 'div.RatingStatistics__rating[aria-hidden="true"]';

  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const ratingElement = doc.querySelector(qSelector) as HTMLDivElement;

  if (!ratingElement) {
    throw new Error("rating element not found while fetching goodreads rating");
  }

  return ratingElement.innerText.substring(0, 3);
}
