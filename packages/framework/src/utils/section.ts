import type { SectionInfo } from "../store";
import { sectionContext } from "../store";
import { useSlideshowContext } from "../store/context/slideshow";
import { logger } from "./logger";

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
  const slideshowRoot = document.querySelector<HTMLElement>("ds-slideshow");
  if (!slideshowRoot) {
    logger.warn("Cannot build section hierarchy: slideshow root not found");
    return;
  }

  // Get all slides and sections in DOM order
  const elements = slideshowRoot.querySelectorAll<HTMLElement>(
    "ds-slide, [data-section-level]",
  );

  // Counters for auto-increment (one per level 0-6)
  const counters = [0, 0, 0, 0, 0, 0, 0];

  // Titles keyed by level (parallel to counters)
  const currentTitles: (string | undefined)[] = Array(7).fill(undefined);

  // Current section info
  let currentSection: SectionInfo = { levels: [], titles: {} };

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

      // Track title at this level, clear deeper level titles
      currentTitles[level] = title;
      for (let i = level + 1; i <= 6; i++) {
        currentTitles[i] = undefined;
      }

      // Build section path (levels 1 through current level)
      const levels = counters.slice(1, level + 1);

      // Snapshot titles into a record
      const titles: Partial<Record<number, string>> = {};
      for (let i = 1; i <= level; i++) {
        if (currentTitles[i] !== undefined) titles[i] = currentTitles[i];
      }

      currentSection = { levels, title, titles };
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
    logger.warn(
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
      logger.warn("Slide element missing data-slide-index attribute");
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
export function getSectionString(
  slideshowRoot: HTMLElement,
  slideIndex?: number,
): string {
  const section = getCurrentSection(slideshowRoot, slideIndex);
  return section?.levels.join(".") ?? "";
}

export type SlidePosition = {
  /** 1-based position of this slide within the group */
  position: number;
  /** Total slides in the group */
  total: number;
};

/**
 * Get a slide's position within its section at a given level, or globally.
 *
 * Groups slides by matching section `levels.slice(0, level)` prefix.
 * When level is omitted, the group is all slides.
 *
 * @returns Position info, or null if slide not found in section data
 */
export function getSlidePositionInSection(
  slideIndex: number,
  level?: number,
): SlidePosition | null {
  const { sectionsBySlide } = sectionContext.get();
  const targetSection = sectionsBySlide[slideIndex];
  if (!targetSection) return null;

  if (level === undefined) {
    // Global position
    return {
      position: slideIndex + 1,
      total: Object.keys(sectionsBySlide).length,
    };
  }

  // Section-scoped position: match slides sharing the same level prefix
  const targetPrefix = targetSection.levels.slice(0, level);

  const matchingIndices: number[] = [];
  for (const key of Object.keys(sectionsBySlide)) {
    const idx = Number.parseInt(key, 10);
    const info = sectionsBySlide[idx];
    const prefix = info.levels.slice(0, level);

    if (
      prefix.length === targetPrefix.length &&
      prefix.every((v, i) => v === targetPrefix[i])
    ) {
      matchingIndices.push(idx);
    }
  }

  matchingIndices.sort((a, b) => a - b);

  const positionIndex = matchingIndices.indexOf(slideIndex);
  if (positionIndex === -1) return null;

  return {
    position: positionIndex + 1,
    total: matchingIndices.length,
  };
}
