export { default as Section } from "./src/components/Section.astro";
export { default as DebugCurrentSection } from "./src/dev/CurrentSection.astro";
export { default as Root } from "./src/Root.astro";
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
} from "./src/utils/section";

// import "@unocss/reset/tailwind-v4.css";
// import "./dist/styles.css";
