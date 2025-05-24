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

  openProjectRepoOnClick();
})();

/**
 * Gerencia mensagens recebidas do content script.
 * Atua como roteador para diferentes tipos de requisições, delegando cada tipo
 * para sua função específica de tratamento. Garante que sempre retorne uma resposta.
 *
 * @param message - Mensagem recebida do content script
 * @param sender - Informações sobre o remetente da mensagem (não utilizado)
 * @param sendResponse - Função callback para enviar resposta de volta
 * @returns true para indicar que a resposta será enviada de forma assíncrona
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
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

/**
 * Busca o conteúdo HTML de uma página através de uma requisição HTTP.
 * Função utilitária genérica para buscar qualquer URL e retornar seu conteúdo.
 *
 * @param url - URL completa da página a ser buscada
 * @returns Promise com o HTML da página e URL final (após redirecionamentos)
 */
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

/**
 * Busca uma página do Goodreads usando um código de livro (ISBN ou ASIN).
 * Constrói a URL de busca do Goodreads e faz a requisição para obter os resultados.
 *
 * @param code - Código do livro (ISBN-13 ou ASIN) para buscar no Goodreads
 * @returns Promise com o HTML da página de resultados de busca
 */
async function getPageFromSearchCode(
  code: string,
): Promise<BackgroundResponse> {
  const url = goodreadsURL(`${config.goodreads.searchQuery}${code}`);
  return fetchPage(url);
}

/**
 * Busca uma página específica do Goodreads usando uma URL completa.
 * Utilizada quando já se tem a URL exata da página do livro no Goodreads.
 *
 * @param url - URL completa da página do Goodreads a ser buscada
 * @returns Promise com o HTML da página específica do livro
 */
async function getPageFromURL(url: string): Promise<BackgroundResponse> {
  return fetchPage(url);
}

/**
 * Configura o comportamento do ícone da extensão na barra de ferramentas.
 * Quando o usuário clica no ícone da extensão, abre uma nova aba com o
 * repositório do projeto no Codeberg.
 */
function openProjectRepoOnClick() {
  browser.action.onClicked.addListener((tab) => {
    browser.tabs.create({
      url: "https://codeberg.org/notas-literarias/notas-literarias",
    });
  });
}
