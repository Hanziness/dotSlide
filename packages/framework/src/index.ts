// dotslide - Vanilla Custom Elements Framework
// Entry point for the CE bundle

import { DsButton } from "./elements/controls/button";
import { KeyboardHandler } from "./elements/controls/keyboard-handler";
import { Overlay } from "./elements/controls/overlay";
import { SlideControls } from "./elements/controls/slide-controls";
import { DsFlex } from "./elements/layout/flex";
import { DsItem } from "./elements/layout/item";
import { DsList } from "./elements/layout/list";
import { DsListItem } from "./elements/layout/list-item";
import { DsCounter } from "./elements/media/counter";
import { DsImage } from "./elements/media/image";
import { DsReference } from "./elements/media/reference";
import { DsVideo } from "./elements/media/video";
import { Loader } from "./elements/overlay/loader";
import { Section } from "./elements/section";
import { Slide } from "./elements/slide";
// Import all custom elements - each triggers customElements.define()
import { Slideshow } from "./elements/slideshow";
import { Step } from "./elements/step";
import { CurrentSection } from "./elements/widgets/current-section";
import { CurrentSlide } from "./elements/widgets/current-slide";
import { Progress } from "./elements/widgets/progress";
import { TotalSlides } from "./elements/widgets/total-slides";

export type {
  NavigableContext,
  NavigationMethods,
  NavigationNode,
} from "./store/context/navigation";
export {
  createNavigationMethods,
  NavigationType,
} from "./store/context/navigation";
export type { SlideContext } from "./store/context/slide";
export { createSlideContext, useSlideContext } from "./store/context/slide";
// Re-export store types and context
export type {
  CounterInfo,
  ResourceInfo,
  SlideshowContext,
  SlideshowPhase,
  SlideshowStore,
} from "./store/context/slideshow";
export {
  createSlideshowContext,
  useSlideshowContext,
} from "./store/context/slideshow";
// Re-export section utilities and types
export type { SectionContext, SectionInfo } from "./store/index";
export { createSectionContext, useSectionContext } from "./store/index";
export { RESOURCE_READY, RESOURCE_REGISTER } from "./utils/events";
export { generateId, getDataTags } from "./utils/index";
// Re-export navigation utilities
export {
  buildNavigationSequence,
  updateSlideVisibility,
  updateStepVisibility,
} from "./utils/navigation";
export { registerResource } from "./utils/resource";
export type { SlidePosition } from "./utils/section";
export {
  buildSectionHierarchy,
  getCurrentSection,
  getSectionString,
  getSlidePositionInSection,
} from "./utils/section";
// Re-export utilities for advanced usage
export { injectStyles } from "./utils/styles";
// Re-export elements
export {
  CurrentSection,
  CurrentSlide,
  DsButton,
  DsCounter,
  DsFlex,
  DsImage,
  DsItem,
  DsList,
  DsListItem,
  DsReference,
  DsVideo,
  KeyboardHandler,
  Loader,
  Overlay,
  Progress,
  Section,
  Slide,
  SlideControls,
  Slideshow,
  Step,
  TotalSlides,
};

// DOM type augmentations
declare global {
  interface HTMLElementTagNameMap {
    "ds-slideshow": Slideshow;
    "ds-slide": Slide;
    "ds-step": Step;
    "ds-section": Section;
    "ds-keyboard-handler": KeyboardHandler;
    "ds-button": DsButton;
    "ds-overlay": Overlay;
    "ds-slide-controls": SlideControls;
    "ds-loader": Loader;
    "ds-progress": Progress;
    "ds-current-slide": CurrentSlide;
    "ds-total-slides": TotalSlides;
    "ds-current-section": CurrentSection;
    "ds-flex": DsFlex;
    "ds-item": DsItem;
    "ds-list": DsList;
    "ds-list-item": DsListItem;
    "ds-image": DsImage;
    "ds-video": DsVideo;
    "ds-counter": DsCounter;
    "ds-reference": DsReference;
  }
}
