import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(messageHandler);

/**
 * A better description of the function parameters: {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
 *
 * @returns {boolean} Wheter the function will respond asychronously.
 */
function messageHandler(message, sender, sendResponse) {
  if (message.type === "getRating") {
    getGoodreadsRatingByISBN(message.isbn).then((response) => {
      sendResponse(response);
    });

    return true;
  }

  return false;
}

async function getGoodreadsRatingByISBN(isbn) {
  try {
    return { rating: "4.72", err: null };
  } catch (error) {
    return { rating: null, err: error };
  }
}
