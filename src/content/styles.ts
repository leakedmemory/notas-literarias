import logger from "../shared/logger";
import { addStyles } from "../shared/dom";

import customStyles from "./index.css?raw";

/**
 * Modifies the default book page style to better fit other book ratings.
 */
export function insertCustomStyles() {
  logger.log("inserting custom book page styles");
  addStyles(customStyles);
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
