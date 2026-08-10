// dotslide - Core (structural) elements only
// Opt-in tree-shaking entry point: importing this registers the structural
// elements via their customElements.define() side effects, without pulling in
// the full bundle.

import { Section } from "./elements/section.js";
import { Slide } from "./elements/slide.js";
import { SlideTemplate } from "./elements/slide-template.js";
import { Slideshow } from "./elements/slideshow.js";
import { Step } from "./elements/step.js";

export { Section, Slide, SlideTemplate, Slideshow, Step };
