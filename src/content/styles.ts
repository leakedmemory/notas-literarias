import { addStyles } from "../shared/dom";
import logger from "../shared/logger";

import customStyles from "./index.css?raw";

/**
 * Insere estilos CSS personalizados na página para melhor integração visual.
 * Modifica o estilo padrão da página de livro da Amazon para acomodar melhor
 * as avaliações do Goodreads junto com as avaliações existentes.
 */
export function insertCustomStyles() {
  logger.log("inserindo estilos personalizados para a página de livro");
  addStyles(customStyles);
}

/**
 * Gera a classe CSS responsável por controlar quantas estrelas são preenchidas
 * na representação visual das estrelas da Amazon.
 *
 * Segue o padrão de classes CSS da Amazon:
 * - Estrelas normais: a-star-X ou a-star-X-5
 * - Estrelas mini: a-star-mini-X ou a-star-mini-X-5
 *
 * @param rating - A avaliação como string (ex: "4.2", "3.7")
 * @param isMini - Se deve gerar classe para estrelas mini (menores)
 * @returns A classe CSS a ser aplicada ao elemento de estrelas
 */
export function generateStarClass(rating: string, isMini: boolean): string {
  const prefix = isMini ? "a-star-mini-" : "a-star-";

  // 4.8+ == 5 estrelas
  if (Number.parseFloat(rating) >= 4.8) {
    return `${prefix}5`;
  }

  // com meia estrela
  if (Number.parseInt(rating[2], 10) >= 5) {
    return `${prefix}${rating[0]}-5`;
  }

  return `${prefix}${rating[0]}`;
}
