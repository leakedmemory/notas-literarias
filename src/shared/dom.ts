import { config, prefixID } from "./config";

/**
 * Get an element by selector without error handling.
 */
export function getElement<T extends Element>(
  selector: string,
  parent: Element | Document = document,
): T | null {
  return parent.querySelector(selector) as T | null;
}

/**
 * Get elements by selector without error handling.
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
 * Adds extension's prefix to element and all of its children with IDs.
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
 * Sets innerText of an element without removing its child elements.
 */
export function setInnerTextWithoutRemovingChildElements(
  el: HTMLElement,
  txt: string,
) {
  const clone = el.cloneNode(true) as HTMLElement;
  el.innerText = txt;
  // for some reason, using without wrapping into an Array will not
  // append all the children
  for (const c of Array.from(clone.children)) {
    el.appendChild(c);
  }
}

/**
 * Recursively sets the aria-hidden attribute on an element and all its children.
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
 * Removes all Amazon-related event attributes that could trigger popups.
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

      // remove amazon-specific classes that might be used as event selectors
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
 * Add styles to the document.
 */
export function addStyles(css: string) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}
