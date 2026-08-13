// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  createSectionContext,
  useSectionContext,
} from "../../../src/store/index";

describe("createSectionContext / useSectionContext", () => {
  let slideshow: HTMLElement;

  beforeEach(() => {
    slideshow = document.createElement("ds-slideshow");
  });

  it("creates a store scoped to the root element", () => {
    const store = createSectionContext(slideshow);
    expect(store.get()).toEqual({
      id: "default",
      sectionsBySlide: {},
      initialized: false,
    });
  });

  it("returns the same store for the same root", () => {
    const a = createSectionContext(slideshow);
    const b = createSectionContext(slideshow);
    expect(b).toBe(a);
  });

  it("useSectionContext from a child inside ds-slideshow returns the store", () => {
    const store = createSectionContext(slideshow);
    const child = document.createElement("span");
    slideshow.appendChild(child);

    expect(useSectionContext(child)).toBe(store);
  });

  it("useSectionContext from outside returns undefined", () => {
    createSectionContext(slideshow);
    const orphan = document.createElement("span");
    expect(useSectionContext(orphan)).toBeUndefined();
  });
});
