import {
  GOODREADS_ORIGIN,
  MessageType,
  type ContentMessage,
  type BackgroundResponse,
} from "../shared/messages";

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
  const msg = message as ContentMessage;
  switch (msg.msg) {
    case MessageType.SearchCode:
      getPageFromSearchCode(msg.code)
        .then((resp) => {
          sendResponse(resp);
        })
        .catch((error) => {
          sendResponse({ err: error });
        });
      return true;
    case MessageType.FetchURL:
      getPageFromURL(msg.url)
        .then((resp) => {
          sendResponse(resp);
        })
        .catch((error) => {
          sendResponse({ err: error });
        });
      return true;
    default:
      sendResponse({ err: "unhandled message type" });
      return true;
  }
}

async function getPageFromSearchCode(
  code: string,
): Promise<BackgroundResponse> {
  const url = `${GOODREADS_ORIGIN}/search?q=${code}`;
  const response = await fetch(url);
  const html = await response.text();
  const resp: BackgroundResponse = {
    pageHTML: html,
    url: response.url,
  };
  return resp;
}

async function getPageFromURL(url: string): Promise<BackgroundResponse> {
  const response = await fetch(url);
  const html = await response.text();
  const resp: BackgroundResponse = {
    pageHTML: html,
    url: response.url,
  };
  return resp;
}
