import logger from "../../lib/logger";

import { getRatingReference } from "./rating";

/**
 * Inserts the loading spinner into the page
 */
export function insertLoadingSpinner() {
  const ratingRef = getRatingReference();

  const spinnerContainer = document.createElement("div");
  spinnerContainer.id = "bookratings_spinner_container";
  spinnerContainer.style.display = "flex";
  spinnerContainer.style.alignItems = "center";
  spinnerContainer.style.marginTop = "5px";
  spinnerContainer.style.marginBottom = "5px";

  const spinner = document.createElement("div");
  spinner.id = "bookratings_spinner";
  spinner.className = "bookratings_loader";

  const loadingText = document.createElement("span");
  loadingText.id = "bookratings_loading_text";
  loadingText.innerText = "Buscando classificações do Goodreads...";
  loadingText.style.marginLeft = "10px";
  loadingText.style.fontSize = "14px";

  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(loadingText);

  logger.log("inserting loading spinner");

  ratingRef.insertAdjacentElement("afterend", spinnerContainer);
}

/**
 * Removes the loading spinner from the page
 */
export function removeLoadingSpinner() {
  const spinnerContainer = document.getElementById(
    "bookratings_spinner_container",
  );
  if (spinnerContainer) {
    logger.log("removing loading spinner");

    spinnerContainer.remove();
  }
}

/**
 * Inserts the CSS for the spinner
 */
export function insertSpinnerStyles() {
  const css = `
    .bookratings_loader {
      width: 24px;
      aspect-ratio: 1;
      border-radius: 50%;
      background: 
        radial-gradient(farthest-side,#ffa516 94%,#0000) top/8px 8px no-repeat,
        conic-gradient(#0000 30%,#ffa516);
      -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
      animation: bookratings_spinner 1s infinite linear;
    }
    
    @keyframes bookratings_spinner {
      100% { transform: rotate(1turn) }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting spinner styles");

  document.head.appendChild(styleElement);
}
