/** Creates a random 6-length hex string ID */
export function generateId(): string {
  return [...Array(6)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

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
  getSlidePositionInSection,
  type SlidePosition,
} from "./section";
