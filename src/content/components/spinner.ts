import logger from "../../shared/logger";
import { addStyles } from "../../shared/dom";

import { getRatingReference } from "./rating";
import spinnerCSS from "./spinner.css?raw";

/**
 * Insere um spinner de carregamento na página da Amazon.
 * Cria um indicador visual para mostrar ao usuário que a extensão está
 * buscando informações no Goodreads. O spinner é posicionado abaixo do
 * elemento de avaliação da Amazon.
 */
export function insertLoadingSpinner() {
  const ratingRef = getRatingReference();

  const spinnerContainer = document.createElement("div");
  spinnerContainer.id = "notasliterarias-spinner-container";
  spinnerContainer.style.display = "flex";
  spinnerContainer.style.marginTop = "5px";

  const spinner = document.createElement("div");
  spinner.className = "notasliterarias-spinner";
  spinnerContainer.appendChild(spinner);

  const message = document.createElement("span");
  message.innerText = "Buscando classificações do Goodreads...";
  spinnerContainer.appendChild(message);

  ratingRef.insertAdjacentElement("afterend", spinnerContainer);
  logger.log("spinner de carregamento inserido");
}

/**
 * Remove o spinner de carregamento da página.
 */
export function removeLoadingSpinner() {
  const spinnerContainer = document.getElementById(
    "notasliterarias-spinner-container",
  );
  if (spinnerContainer) {
    spinnerContainer.remove();
  }
}

/**
 * Insere os estilos CSS necessários para a animação do spinner.
 */
export function insertSpinnerStyles() {
  addStyles(spinnerCSS);
}
