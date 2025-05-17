import {
  MessageType,
  type ContentMessage,
  type BackgroundResponse,
} from "../shared/types";
import { config, goodreadsURL } from "../shared/config";
import logger from "../shared/logger";

(function main() {
  logger.log("iniciando script de background da extensão notas literárias");
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
  const msg = message as ContentMessage;
  const messageHandlers = {
    [MessageType.SearchCode]: () => getPageFromSearchCode(msg.code),
    [MessageType.FetchURL]: () => getPageFromURL(msg.url),
  };

  const handler = messageHandlers[msg.msg];

  if (handler) {
    handler()
      .then(sendResponse)
      .catch((error) => sendResponse({ err: error }));
  } else {
    sendResponse({ err: "unhandled message type" });
  }

  return true;
}

async function fetchPage(url: string): Promise<BackgroundResponse> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return {
      pageHTML: html,
      url: response.url,
    };
  } catch (error) {
    return { err: error };
  }
}

async function getPageFromSearchCode(
  code: string,
): Promise<BackgroundResponse> {
  const url = goodreadsURL(`${config.goodreads.searchQuery}${code}`);
  return fetchPage(url);
}

async function getPageFromURL(url: string): Promise<BackgroundResponse> {
  return fetchPage(url);
}
