import type { GetReviewsMessage } from "../shared/messages";

import { getGoodreadsReviews } from "./goodreads";

(function main() {
  browser.runtime.onMessage.addListener(messageHandler);
})();

/**
 * Handles incoming messages from the content script.
 *
 * @see Description of the function parameters: {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
 */
function messageHandler(
  message: unknown,
  // @ts-ignore Unused parameter
  sender: browser.Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): true {
  const reviewsMessage = message as GetReviewsMessage;
  if (reviewsMessage.msg === "fetchGoodreads") {
    getGoodreadsReviews(
      reviewsMessage.product.code,
      reviewsMessage.product.format,
    )
      .then((reviews) => {
        sendResponse({ reviews: reviews, err: null });
      })
      .catch((error) => {
        sendResponse({ reviews: null, err: error });
      });

    return true;
  }

  sendResponse({ reviews: null, err: "unhandled message type" });
  return true;
}
