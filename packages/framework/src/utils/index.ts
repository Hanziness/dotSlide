/** Creates a random 6-length hex string ID */
export function generateId(): string {
  return [...Array(6)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

/** Return the identifier `data-` attribute name for a component */
export function getComponentDataAttribute(prefix: string) {
  return `data-${prefix}`;
}

/** Returns a query selector for the given identifier (`[data-${identifier}]`) */
export function getSelector(identifier: string) {
  return `[data-${identifier}]`;
}

/** Export an embeddable set of `data-` attributes for a particular component.
 * It transforms the input object's given keys to `data-(prefix)-(value)` tags.
 *
 * @example In order to use it, just spread the returned object:
 * ```astro
 * <div {...getDataTags(Astro.props, 'component', ['attr1', 'attr2'])} />
 * ```
 *  */
export function getDataTags<T extends Record<string, unknown>>(
  object: T,
  prefix: string,
  includes: Array<keyof T>,
) {
  return includes.reduce((acc, key) => {
    return Object.assign(acc, {
      [`data-${prefix}-${String(key)}`]: object[key],
    });
  }, {});
}

export { logger } from "./logger";
export {
  type ResourceHandle,
  type ResourceRegistrationDetail,
  registerResource,
} from "./resource";
// Re-export section utilities for convenient access
export {
  buildSectionHierarchy,
  getCurrentSection,
  getSectionString,
} from "./section";
