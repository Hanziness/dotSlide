import { type MapStore, map } from "nanostores";

// Store the context directly on the DOM element using WeakMap
const slideContexts = new WeakMap<
  HTMLElement,
  MapStore<Record<string, unknown>>
>();

export function provideContext<T extends Record<string, unknown>>(
  element: HTMLElement,
  initialValue: T,
): MapStore<T> {
  if (!slideContexts.has(element)) {
    const store = map<T>(initialValue);
    slideContexts.set(element, store);
  }
  return slideContexts.get(element) as MapStore<T>;
}

export function useContext<T extends Record<string, unknown>>(
  childElement: HTMLElement,
  selector: string,
): MapStore<T> | undefined {
  const root = childElement.closest(selector);
  if (!(root instanceof HTMLElement)) return undefined;
  return slideContexts.get(root) as MapStore<T> | undefined;
}
