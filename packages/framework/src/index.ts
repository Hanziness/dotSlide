// dotslide - Vanilla Custom Elements Framework
// Entry point for the CE bundle

// Import all custom elements - each triggers customElements.define()
import { Slideshow } from "./elements/slideshow.js";
import { Slide } from "./elements/slide.js";
import { Step } from "./elements/step.js";
import { Section } from "./elements/section.js";
import { KeyboardHandler } from "./elements/controls/keyboard-handler.js";
import { DsButton } from "./elements/controls/button.js";
import { Overlay } from "./elements/controls/overlay.js";
import { SlideControls } from "./elements/controls/slide-controls.js";
import { Loader } from "./elements/overlay/loader.js";
import { Progress } from "./elements/widgets/progress.js";
import { CurrentSlide } from "./elements/widgets/current-slide.js";
import { TotalSlides } from "./elements/widgets/total-slides.js";
import { CurrentSection } from "./elements/widgets/current-section.js";
import { DsFlex } from "./elements/layout/flex.js";
import { DsItem } from "./elements/layout/item.js";
import { DsList } from "./elements/layout/list.js";
import { DsListItem } from "./elements/layout/list-item.js";
import { DsImage } from "./elements/media/image.js";
import { DsVideo } from "./elements/media/video.js";
import { DsCounter } from "./elements/media/counter.js";
import { DsReference } from "./elements/media/reference.js";

// Re-export elements
export { Slideshow, Slide, Step, Section, DsFlex, DsItem, DsList, DsListItem, KeyboardHandler, DsButton, Overlay, SlideControls, Loader, Progress, CurrentSlide, TotalSlides, CurrentSection, DsImage, DsVideo, DsCounter, DsReference };

// Re-export utilities for advanced usage
export { injectStyles } from "./utils/styles.js";
export { generateId, getDataTags, logger } from "./utils/index.js";
export { registerResource } from "./utils/resource.js";
export { RESOURCE_REGISTER, RESOURCE_READY } from "./utils/events.js";

// Re-export store types and context
export type { SlideshowContext, SlideshowStore, CounterInfo, ResourceInfo, SlideshowPhase } from "./store/context/slideshow.js";
export { useSlideshowContext, createSlideshowContext } from "./store/context/slideshow.js";
export type { SlideContext } from "./store/context/slide.js";
export { useSlideContext, createSlideContext } from "./store/context/slide.js";
export type { NavigationNode, NavigableContext, NavigationMethods } from "./store/context/navigation.js";
export { NavigationType, createNavigationMethods } from "./store/context/navigation.js";

// Re-export section utilities and types
export type { SectionInfo, SectionContext } from "./store/index.js";
export { createSectionContext, useSectionContext } from "./store/index.js";
export { buildSectionHierarchy, getCurrentSection, getSectionString, getSlidePositionInSection } from "./utils/section.js";
export type { SlidePosition } from "./utils/section.js";

// Re-export navigation utilities
export { buildNavigationSequence, updateSlideVisibility, updateStepVisibility } from "./utils/navigation.js";

// DOM type augmentations
declare global {
  interface HTMLElementTagNameMap {
    "ds-slideshow": InstanceType<typeof Slideshow>;
    "ds-slide": InstanceType<typeof Slide>;
    "ds-step": InstanceType<typeof Step>;
    "ds-section": InstanceType<typeof Section>;
    "ds-keyboard-handler": InstanceType<typeof KeyboardHandler>;
    "ds-button": InstanceType<typeof DsButton>;
    "ds-overlay": InstanceType<typeof Overlay>;
    "ds-slide-controls": InstanceType<typeof SlideControls>;
    "ds-loader": InstanceType<typeof Loader>;
    "ds-progress": InstanceType<typeof Progress>;
    "ds-current-slide": InstanceType<typeof CurrentSlide>;
    "ds-total-slides": InstanceType<typeof TotalSlides>;
    "ds-current-section": InstanceType<typeof CurrentSection>;
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
