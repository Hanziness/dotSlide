export { default as Image } from "./src/Image.astro";
export { default as Root } from "./src/Root.astro";
export { default as Section } from "./src/Section.astro";
export { default as Slide } from "./src/Slide.astro";
export { default as Slideshow } from "./src/Slideshow.astro";
export { default as Step } from "./src/Step.astro";
export { default as StyleHelper } from "./src/StyleHelper.astro";
export type { SectionInfo } from "./src/store";
// Section utilities
export {
  buildSectionHierarchy,
  getCurrentSection,
  getSectionString,
  getSlidePositionInSection,
  type SlidePosition,
} from "./src/utils/section";
