import logger from "../lib/logger";

/**
 * Modifies the default product page style to better fit other book ratings.
 */
export function insertCustomStyles() {
  const css = `
    /* KINDLE ONLY */
    div#reviewFeatureGroup {
      margin-bottom: 7px;
    }

    /* Popover Animation */
    #notasliterarias-popover {
      opacity: 0;
      display: none;
      transition: opacity 0.2s ease-in-out;
    }

    #notasliterarias-popover.visible {
      opacity: 1;
      display: block;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.appendChild(document.createTextNode(css));

  logger.log("inserting custom product page styles");

  document.head.appendChild(styleElement);
}

/**
 * Generates the class responsible of controlling how many stars are
 * filled in the stars representation.
 *
 * @returns Class to add to the stars element.
 */
export function generateStarClass(rating: string, isMini: boolean): string {
  const prefix = isMini ? "a-star-mini-" : "a-star-";

  // 4.8+ rating does not follow the pattern of half star and
  // goes directly to 5 stars
  if (Number.parseFloat(rating) >= 4.8) {
    return `${prefix}5`;
  }

  // with half star
  if (Number.parseInt(rating[2]) >= 5) {
    return `${prefix}${rating[0]}-5`;
  }

  return `${prefix}${rating[0]}`;
}
