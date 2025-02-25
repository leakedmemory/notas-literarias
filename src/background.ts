import browser from "webextension-polyfill";

import type { GetReviewsMessage } from "./messages";
import { GoodreadsParser } from "./goodreads";

(function main() {
  browser.runtime.onMessage.addListener(messageHandler);
})();

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
  if (reviewsMessage.msg === "fetchGoodreads") {
    const parser = new GoodreadsParser();
    parser
      .getReviews(reviewsMessage.product.code, reviewsMessage.product.format)
      .then((reviews) => {
        sendResponse({ reviews: reviews, err: null });
      })
      .catch((error) => {
        sendResponse({ reviews: null, err: error });
      });

    return true;
  }
}
