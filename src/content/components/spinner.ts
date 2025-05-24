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
  spinnerContainer.id = "notasliterarias-spinner_container";
  spinnerContainer.style.display = "flex";
  spinnerContainer.style.alignItems = "center";
  spinnerContainer.style.marginTop = "5px";
  spinnerContainer.style.marginBottom = "5px";

  const spinner = document.createElement("div");
  spinner.id = "notasliterarias-spinner";
  spinner.className = "notasliterarias-loader";

  const loadingText = document.createElement("span");
  loadingText.id = "notasliterarias-loading_text";
  loadingText.innerText = "Buscando classificações do Goodreads...";
  loadingText.style.marginLeft = "10px";
  loadingText.style.fontSize = "14px";

  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(loadingText);

  ratingRef.insertAdjacentElement("afterend", spinnerContainer);
  logger.log("spinner de carregamento inserido");
}

/**
 * Remove o spinner de carregamento da página.
 */
export function removeLoadingSpinner() {
  const spinnerContainer = document.getElementById(
    "notasliterarias-spinner_container",
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
