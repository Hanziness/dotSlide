import {
  type NavigationNode,
  NavigationType,
} from "../store/context/navigation";

/**
 * Compute the highest step number referenced by any `<ds-step>` descendant.
 * Returns 1 as a minimum (every slide has at least step 1).
 */
function getMaxStep(slide: Element): number {
  let max = 1;
  for (const step of slide.querySelectorAll<HTMLElement>("ds-step")) {
    const from = step.dataset.stepFrom;
    const to = step.dataset.stepTo;
    if (from) max = Math.max(max, Number(from));
    if (to) max = Math.max(max, Number(to));
  }
  return max;
}

/**
 * Build a flat navigation sequence from the slideshow DOM.
 *
 * Queries all `<ds-slide>` elements in DOM order. For each slide,
 * inspects `<ds-step>` descendants to determine how many navigable
 * states that slide contributes to the sequence.
 */
export function buildNavigationSequence(
  slideshowRoot: HTMLElement,
): NavigationNode[] {
  const slides = slideshowRoot.querySelectorAll<HTMLElement>("ds-slide");
  const sequence: NavigationNode[] = [];

  for (const [slideIndex, slide] of [...slides].entries()) {
    const slideId = `slide-${slideIndex}`;
    const hasSteps = slide.querySelector("ds-step") !== null;

    if (!hasSteps) {
      sequence.push({
        type: NavigationType.slide,
        slideIndex,
        stepIndex: 1,
        slideId,
      });
      continue;
    }

    const maxStep = getMaxStep(slide);
    for (let stepIdx = 1; stepIdx <= maxStep; stepIdx++) {
      sequence.push({
        type: stepIdx === 1 ? NavigationType.slide : NavigationType.step,
        slideIndex,
        stepIndex: stepIdx,
        slideId,
      });
    }
  }

  return sequence;
}

export function updateStepVisibility(
  slide: HTMLElement,
  activeStep: number,
): void {
  for (const step of slide.querySelectorAll<HTMLElement>("ds-step")) {
    const from = step.dataset.stepFrom ? Number(step.dataset.stepFrom) : null;
    const to = step.dataset.stepTo ? Number(step.dataset.stepTo) : null;

    const visible =
      (from === null || activeStep >= from) &&
      (to === null || activeStep <= to);

    step.classList.toggle("active", visible);
  }
}

export function updateSlideVisibility(
  slides: HTMLElement[],
  activeIdx: number,
  prevIdx?: number,
): void {
  if (prevIdx !== undefined && prevIdx !== activeIdx) {
    const prevSlide = slides[prevIdx];
    const activeSlide = slides[activeIdx];

    if (prevSlide) {
      prevSlide.classList.add("inactive");
      prevSlide.classList.remove("active");
    }

    if (activeSlide) {
      activeSlide.classList.add("active");
      activeSlide.classList.remove("inactive");
    }

    return;
  }

  for (const [idx, slide] of slides.entries()) {
    const isActive = idx === activeIdx;
    slide.classList.toggle("active", isActive);
    slide.classList.toggle("inactive", !isActive);
  }
}
