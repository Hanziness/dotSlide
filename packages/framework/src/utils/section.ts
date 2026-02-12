import type { SectionInfo } from "../store";
import { sectionContext } from "../store";
import { useSlideshowContext } from "../store/context/slideshow";

/**
 * Build the section hierarchy from DOM elements.
 * Call this once after the slideshow is initialized.
 *
 * Algorithm:
 * 1. Find all section markers and slides in DOM order
 * 2. Auto-increment section numbers based on level
 * 3. Map each slide to its preceding section
 */
export function buildSectionHierarchy(): void {
  const slideshowRoot = document.querySelector<HTMLElement>(
    "ds-slideshow",
  );
  if (!slideshowRoot) {
    console.warn("Cannot build section hierarchy: slideshow root not found");
    return;
  }

  // Get all slides and sections in DOM order
  const elements = slideshowRoot.querySelectorAll<HTMLElement>(
    "ds-slide, [data-section-level]",
  );

  // Counters for auto-increment (one per level 0-6)
  const counters = [0, 0, 0, 0, 0, 0, 0];

  // Current section info
  let currentSection: SectionInfo = { levels: [] };

  // Result mapping
  const sectionsBySlide: Record<number, SectionInfo> = {};
  let slideIndex = 0;

  elements.forEach((element) => {
    if (element.hasAttribute("data-section-level")) {
      // This is a section marker
      const level = Number.parseInt(
        element.getAttribute("data-section-level") ?? "1",
        10,
      );
      const title = element.getAttribute("data-section-title") ?? undefined;

      // Increment current level counter
      counters[level]++;

      // Reset all deeper levels
      for (let i = level + 1; i <= 6; i++) {
        counters[i] = 0;
      }

      // Build section path (levels 1 through current level)
      const levels = counters.slice(1, level + 1);

      currentSection = { levels, title };
    } else if (element.tagName.toLowerCase() === "ds-slide") {
      // This is a slide - assign current section
      sectionsBySlide[slideIndex] = { ...currentSection };
      slideIndex++;
    }
  });

  // Update the store
  sectionContext.set({
    ...sectionContext.get(),
    sectionsBySlide,
    initialized: true,
  });

  console.debug("Section hierarchy built:", sectionsBySlide);
}

/**
 * Get the section info for a specific slide.
 *
 * @param slideIndexOrElement - Slide index number, slide HTMLElement, or undefined for active slide
 * @returns SectionInfo with levels array and optional title, or null if not found
 *
 * @example
 * // Get section for active slide
 * const section = getCurrentSection();
 * console.log(section?.levels); // [1, 2, 4]
 *
 * @example
 * // Get section for specific slide index
 * const section = getCurrentSection(3);
 *
 * @example
 * // Get section for a slide element
 * const slideEl = document.querySelector('[data-slide-index="2"]');
 * const section = getCurrentSection(slideEl);
 */
export function getCurrentSection(
  slideshowRoot: HTMLElement,
  slideIndexOrElement?: number | HTMLElement | null,
): SectionInfo | null {
  const context = sectionContext.get();
  const slideshowContext = useSlideshowContext(slideshowRoot);

  if (!context.initialized) {
    console.warn(
      "Section hierarchy not initialized. Call buildSectionHierarchy() first.",
    );
    return null;
  }

  let slideIndex: number;

  if (slideIndexOrElement === undefined || slideIndexOrElement === null) {
    // Use active slide from slideshow context
    slideIndex = slideshowContext.get().activeSlide;
  } else if (typeof slideIndexOrElement === "number") {
    slideIndex = slideIndexOrElement;
  } else {
    // HTMLElement - get index from data attribute
    const indexAttr = slideIndexOrElement.getAttribute("data-slide-index");
    if (indexAttr === null) {
      console.warn("Slide element missing data-slide-index attribute");
      return null;
    }
    slideIndex = Number.parseInt(indexAttr, 10);
  }

  return context.sectionsBySlide[slideIndex] ?? null;
}

/**
 * Get the section path as a dot-notation string.
 *
 * @param slideIndex - Slide index, or undefined for active slide
 * @returns String like "1.2.4" or empty string if no section
 */
export function getSectionString(slideshowRoot: HTMLElement, slideIndex?: number): string {
  const section = getCurrentSection(slideshowRoot, slideIndex);
  return section?.levels.join(".") ?? "";
}
