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
 * Adds "bookratings_" prefix to element and all of its children with IDs.
 */
export function addExtensionPrefixToElementIDs(element: HTMLElement) {
  element.id = `bookratings_${element.id}`;
  for (const child of element.querySelectorAll("[id]")) {
    child.id = `bookratings_${child.id}`;
  }
}

/**
 * Removes all Amazon-related event attributes that could trigger popups.
 */
export function removeAmazonEventAttributes(element: HTMLElement) {
  const allElements = [element, ...Array.from(element.querySelectorAll("*"))];

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
