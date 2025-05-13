import logger from "../../shared/logger";

import { getRatingReference } from "./rating";
import spinnerCSS from "./spinner.css?raw";

/**
 * Inserts loading spinner into page.
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

  logger.log("inserting loading spinner");

  ratingRef.insertAdjacentElement("afterend", spinnerContainer);
}

/**
 * Removes loading spinner from page.
 */
export function removeLoadingSpinner() {
  const spinnerContainer = document.getElementById(
    "notasliterarias-spinner_container",
  );
  if (spinnerContainer) {
    logger.log("removing loading spinner");

    spinnerContainer.remove();
  }
}

/**
 * Inserts the CSS for spinner.
 */
export function insertSpinnerStyles() {
  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(spinnerCSS));

  logger.log("inserting spinner styles");

  document.head.appendChild(styleElement);
}
