import { prefixID } from "./config";

/**
 * Busca um elemento no DOM usando um seletor CSS sem tratamento de erro.
 *
 * @template T - Tipo do elemento HTML estendendo Element
 * @param selector - Seletor CSS para localizar o elemento
 * @param parent - Elemento pai ou documento onde buscar (padrão: document)
 * @returns O elemento encontrado ou null se não existir
 */
export function getElement<T extends Element>(
  selector: string,
  parent: Element | Document = document,
): T | null {
  return parent.querySelector(selector) as T | null;
}

/**
 * Busca múltiplos elementos no DOM usando um seletor CSS sem tratamento de erro.
 *
 * @template T - Tipo do elemento HTML estendendo Element
 * @param selector - Seletor CSS para localizar os elementos
 * @param parent - Elemento pai ou documento onde buscar (padrão: document)
 * @returns Array com os elementos encontrados ou null se nenhum for encontrado
 */
export function getElements<T extends Element>(
  selector: string,
  parent: Element | Document = document,
): T[] | null {
  const result = Array.from(parent.querySelectorAll(selector)) as T[];
  if (result.length === 0) {
    return null;
  }
  return result;
}

/**
 * Adiciona o prefixo da extensão aos IDs do elemento e de todos os seus filhos que possuem ID.
 *
 * @param element - O elemento HTML que terá seus IDs prefixados
 */
export function addExtensionPrefixToElementIDs(element: HTMLElement) {
  if (element.id) {
    element.id = prefixID(element.id);
  }

  const elementsWithIds = getElements<HTMLElement>("[id]", element);
  for (const el of elementsWithIds) {
    el.id = prefixID(el.id);
  }
}

/**
 * Define o texto interno de um elemento preservando seus elementos filhos.
 *
 * @param el - O elemento HTML que terá seu texto alterado
 * @param txt - O novo texto a ser definido
 *
 * @example
 * ```typescript
 * // Se el contém: "Texto antigo <span>manter</span>"
 * setInnerTextAndPreserveChildren(el, "Novo texto");
 * // Resultado: "Novo texto <span>manter</span>"
 * ```
 */
export function setInnerTextAndPreserveChildren(el: HTMLElement, txt: string) {
  const clone = el.cloneNode(true) as HTMLElement;
  el.innerText = txt;
  for (const c of Array.from(clone.children)) {
    el.appendChild(c);
  }
}

/**
 * Define recursivamente o atributo aria-hidden em um elemento e todos os seus filhos.
 *
 * @param el - O elemento que terá o atributo aria-hidden definido
 * @param value - O valor do atributo aria-hidden ("true" ou "false")
 */
export function setAriaHidden(el: Element, value: "true" | "false") {
  if (el.ariaHidden !== null) {
    el.ariaHidden = value;
  }

  for (const c of el.children) {
    setAriaHidden(c, value);
  }
}

/**
 * Remove todos os atributos de evento relacionados à Amazon que podem disparar popups.
 * Esta função limpa atributos que podem interferir com o funcionamento da extensão,
 * removendo handlers de evento da Amazon que podem causar conflitos.
 *
 * @param element - O elemento HTML que terá seus atributos de evento removidos
 */
export function removeAmazonEventAttributes(element: HTMLElement) {
  const allElements = [element, ...getElements("*", element)];

  for (const el of allElements) {
    if (el instanceof HTMLElement) {
      for (const attr of Array.from(el.attributes)) {
        if (
          attr.name.startsWith("data-") ||
          attr.name.includes("aria") ||
          attr.name.includes("popup") ||
          attr.name.includes("hover") ||
          attr.name.includes("onmouse")
        ) {
          el.removeAttribute(attr.name);
        }
      }

      const classesToRemove = [];
      for (const cls of Array.from(el.classList)) {
        if (
          cls.includes("popup") ||
          cls.includes("hover") ||
          cls.includes("tooltip") ||
          cls.includes("a-popover")
        ) {
          classesToRemove.push(cls);
        }
      }

      for (const cls of classesToRemove) {
        el.classList.remove(cls);
      }
    }
  }
}

/**
 * Adiciona estilos CSS ao documento criando um elemento <style> no <head>.
 *
 * @param css - String contendo o código CSS a ser adicionado
 *
 * @example
 * ```typescript
 * addStyles(`
 *   .minha-classe {
 *     color: red;
 *     font-size: 14px;
 *   }
 * `);
 * ```
 */
export function addStyles(css: string) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}
