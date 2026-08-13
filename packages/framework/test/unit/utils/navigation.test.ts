// @vitest-environment jsdom
import { NavigationType } from "@dotslide/protocol";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildNavigationSequence,
  updateSlideVisibility,
  updateStepVisibility,
} from "../../../src/utils/navigation.js";

function createSlideWithSteps(
  steps: Array<{ from?: string; to?: string }>,
): HTMLElement {
  const slide = document.createElement("ds-slide");
  for (const { from, to } of steps) {
    const step = document.createElement("ds-step");
    if (from !== undefined) step.dataset.from = from;
    if (to !== undefined) step.dataset.to = to;
    slide.appendChild(step);
  }
  return slide;
}

describe("buildNavigationSequence", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("ds-slideshow");
  });

  it("queries ds-slide elements in DOM order", () => {
    const first = document.createElement("ds-slide");
    const second = document.createElement("ds-slide");
    root.appendChild(first);
    root.appendChild(second);

    const sequence = buildNavigationSequence(root);
    expect(sequence.map((n) => n.slideIndex)).toEqual([0, 1]);
  });

  it("produces one slide-type node for slides without ds-step descendants", () => {
    root.appendChild(document.createElement("ds-slide"));
    root.appendChild(document.createElement("ds-slide"));

    const sequence = buildNavigationSequence(root);
    expect(sequence).toHaveLength(2);
    for (const [i, node] of sequence.entries()) {
      expect(node.type).toBe(NavigationType.slide);
      expect(node.slideId).toBe(`slide-${i}`);
      expect(node.slideIndex).toBe(i);
      expect(node.stepIndex).toBe(1);
    }
  });

  it("produces multiple nodes when a slide has steps, first as slide then steps", () => {
    root.appendChild(
      createSlideWithSteps([{ from: "1" }, { from: "2" }, { from: "3" }]),
    );

    const sequence = buildNavigationSequence(root);
    expect(sequence).toHaveLength(3);
    expect(sequence[0].type).toBe(NavigationType.slide);
    expect(sequence[1].type).toBe(NavigationType.step);
    expect(sequence[2].type).toBe(NavigationType.step);
    expect(sequence.map((n) => n.stepIndex)).toEqual([1, 2, 3]);
  });

  it("determines max step from data-from and data-to attributes", () => {
    root.appendChild(
      createSlideWithSteps([{ from: "2", to: "4" }, { from: "1" }]),
    );

    const sequence = buildNavigationSequence(root);
    expect(sequence).toHaveLength(4);
    expect(sequence.map((n) => n.stepIndex)).toEqual([1, 2, 3, 4]);
    expect(sequence[3].type).toBe(NavigationType.step);
  });

  it("uses slide-{index} as slideId and carries slideIndex on every node", () => {
    root.appendChild(document.createElement("ds-slide"));
    root.appendChild(
      createSlideWithSteps([{ from: "1" }, { from: "2" }, { from: "3" }]),
    );

    const sequence = buildNavigationSequence(root);
    expect(sequence.map((n) => n.slideId)).toEqual([
      "slide-0",
      "slide-1",
      "slide-1",
      "slide-1",
    ]);
    expect(sequence.map((n) => n.slideIndex)).toEqual([0, 1, 1, 1]);
  });
});

describe("updateStepVisibility", () => {
  it("toggles the active class based on data-from/data-to and activeStep", () => {
    const slide = createSlideWithSteps([
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "5" },
    ]);
    const steps = slide.querySelectorAll<HTMLElement>("ds-step");

    updateStepVisibility(slide, 2);
    expect(steps[0].classList.contains("active")).toBe(true);
    expect(steps[1].classList.contains("active")).toBe(true);
    expect(steps[2].classList.contains("active")).toBe(false);
  });

  it("keeps a step without data-from/data-to always visible", () => {
    const slide = createSlideWithSteps([{}]);
    const step = slide.querySelector<HTMLElement>("ds-step");
    if (step === null) throw new Error("expected a ds-step element");

    updateStepVisibility(slide, 1);
    expect(step.classList.contains("active")).toBe(true);

    updateStepVisibility(slide, 10);
    expect(step.classList.contains("active")).toBe(true);
  });
});

describe("updateSlideVisibility", () => {
  let slides: HTMLElement[];

  beforeEach(() => {
    slides = Array.from({ length: 3 }, () =>
      document.createElement("ds-slide"),
    );
  });

  it("marks the active slide active and all others inactive without prevIdx", () => {
    updateSlideVisibility(slides, 1);

    expect(slides[1].classList.contains("active")).toBe(true);
    expect(slides[1].classList.contains("inactive")).toBe(false);
    expect(slides[0].classList.contains("inactive")).toBe(true);
    expect(slides[0].classList.contains("active")).toBe(false);
    expect(slides[2].classList.contains("inactive")).toBe(true);
    expect(slides[2].classList.contains("active")).toBe(false);
  });

  it("only modifies previous and current slides when prevIdx is valid", () => {
    slides[0].classList.add("active");
    slides[1].classList.add("inactive");

    updateSlideVisibility(slides, 1, 0);

    expect(slides[0].classList.contains("inactive")).toBe(true);
    expect(slides[0].classList.contains("active")).toBe(false);
    expect(slides[1].classList.contains("active")).toBe(true);
    expect(slides[1].classList.contains("inactive")).toBe(false);
    // Unrelated slides are untouched
    expect(slides[2].classList.contains("active")).toBe(false);
    expect(slides[2].classList.contains("inactive")).toBe(false);
  });

  it("falls back to iterating all slides when prevIdx equals activeIdx", () => {
    slides[0].classList.add("active");
    slides[1].classList.add("active");
    slides[2].classList.add("active");

    updateSlideVisibility(slides, 1, 1);

    expect(slides[1].classList.contains("active")).toBe(true);
    expect(slides[1].classList.contains("inactive")).toBe(false);
    expect(slides[0].classList.contains("inactive")).toBe(true);
    expect(slides[2].classList.contains("inactive")).toBe(true);
  });

  it("falls back to iterating all slides when prevIdx is out of range", () => {
    slides[0].classList.add("active");
    slides[1].classList.add("active");
    slides[2].classList.add("active");

    updateSlideVisibility(slides, 1, 99);

    expect(slides[1].classList.contains("active")).toBe(true);
    expect(slides[0].classList.contains("inactive")).toBe(true);
    expect(slides[2].classList.contains("inactive")).toBe(true);
  });
});
