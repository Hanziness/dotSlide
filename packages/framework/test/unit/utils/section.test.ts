// @vitest-environment jsdom
import { type NavigationNode, NavigationType } from "@dotslide/protocol";
import { beforeEach, describe, expect, it } from "vitest";
import { createSlideshowContext } from "../../../src/store/context/slideshow.js";
import {
  buildSectionHierarchy,
  getCurrentSection,
  getSectionString,
  getSlidePositionInSection,
  type SlidePosition,
} from "../../../src/utils/section.js";

/** Build a ds-slideshow with section markers and slides for integration tests. */
function buildSlideshowDom(root: HTMLElement): void {
  const marker = (level: number, title?: string): HTMLElement => {
    const el = document.createElement("section");
    el.dataset.sectionLevel = String(level);
    if (title !== undefined) el.dataset.sectionTitle = title;
    return el;
  };
  const slide = (index: number): HTMLElement => {
    const el = document.createElement("ds-slide");
    el.dataset.slideIndex = String(index);
    return el;
  };

  root.appendChild(marker(1, "Intro"));
  root.appendChild(slide(0));
  root.appendChild(marker(2, "Body"));
  root.appendChild(slide(1));
  root.appendChild(slide(2));
  root.appendChild(marker(1, "Outro"));
  root.appendChild(slide(3));
}

describe("SlidePosition type", () => {
  it("has a 1-based position and a total", () => {
    const position: SlidePosition = { position: 2, total: 5 };
    expect(position.position).toBe(2);
    expect(position.total).toBe(5);
  });
});

describe("section utilities (integration)", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("ds-slideshow");
    buildSlideshowDom(root);
    buildSectionHierarchy(root);
    // getCurrentSection always resolves the slideshow context, so seed it.
    const sequence: NavigationNode[] = [0, 1, 2, 3].map((slideIndex) => ({
      type: NavigationType.slide,
      slideIndex,
      stepIndex: 1,
      slideId: `slide-${slideIndex}`,
    }));
    createSlideshowContext(root, {
      id: "test",
      width: 1920,
      height: 1080,
      navigationIndex: 0,
      navigationSequence: sequence,
      templates: {},
    });
  });

  it("buildSectionHierarchy maps each slide to its preceding section", () => {
    expect(getCurrentSection(root, 0)?.levels).toEqual([1]);
    expect(getCurrentSection(root, 0)?.title).toBe("Intro");
    // Level-2 section under Intro is numbered [1, 1]
    expect(getCurrentSection(root, 1)?.levels).toEqual([1, 1]);
    expect(getCurrentSection(root, 1)?.title).toBe("Body");
    expect(getCurrentSection(root, 2)?.levels).toEqual([1, 1]);
    // Second level-1 section renumbers to 2
    expect(getCurrentSection(root, 3)?.levels).toEqual([2]);
    expect(getCurrentSection(root, 3)?.title).toBe("Outro");
  });

  it("returns null for an unbuilt slideshow root", () => {
    const fresh = document.createElement("ds-slideshow");
    expect(getCurrentSection(fresh, 0)).toBeNull();
  });

  it("getSectionString returns dot-notation levels", () => {
    expect(getSectionString(root, 0)).toBe("1");
    expect(getSectionString(root, 1)).toBe("1.1");
    expect(getSectionString(root, 3)).toBe("2");
  });

  it("getSlidePositionInSection returns global position/total without a level", () => {
    expect(getSlidePositionInSection(root, 1)).toEqual({
      position: 2,
      total: 4,
    });
    expect(getSlidePositionInSection(root, 3)).toEqual({
      position: 4,
      total: 4,
    });
  });

  it("getSlidePositionInSection groups by level prefix when a level is given", () => {
    // Level-2 prefix [1,1] only matches slides 1 and 2
    expect(getSlidePositionInSection(root, 1, 2)).toEqual({
      position: 1,
      total: 2,
    });
    expect(getSlidePositionInSection(root, 2, 2)).toEqual({
      position: 2,
      total: 2,
    });
  });

  it("getSlidePositionInSection returns null for a slide without section data", () => {
    expect(getSlidePositionInSection(root, 99)).toBeNull();
  });

  it("uses the active slide from the slideshow context when no index is given", () => {
    const ctx = createSlideshowContext(root, {
      id: "test",
      width: 1920,
      height: 1080,
      navigationIndex: 0,
      navigationSequence: [0, 1, 2, 3].map((slideIndex) => ({
        type: NavigationType.slide,
        slideIndex,
        stepIndex: 1,
        slideId: `slide-${slideIndex}`,
      })),
      templates: {},
    });
    // Point navigation at slide 2 (Body)
    ctx.setKey("navigationIndex", 2);

    expect(getCurrentSection(root)?.title).toBe("Body");
    expect(getSectionString(root)).toBe("1.1");
  });
});
