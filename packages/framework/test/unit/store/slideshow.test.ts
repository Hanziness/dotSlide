// @vitest-environment jsdom

import { type NavigationNode, NavigationType } from "@dotslide/protocol";
import { beforeEach, describe, expect, it } from "vitest";
import { createSlideshowContext } from "../../../src/store/context/slideshow";

const sequence: NavigationNode[] = [
  {
    type: NavigationType.slide,
    slideIndex: 0,
    stepIndex: 1,
    slideId: "slide-0",
  },
  {
    type: NavigationType.step,
    slideIndex: 0,
    stepIndex: 2,
    slideId: "slide-0",
  },
  {
    type: NavigationType.slide,
    slideIndex: 1,
    stepIndex: 1,
    slideId: "slide-1",
  },
];

describe("createSlideshowContext", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("ds-slideshow");
  });

  const build = () =>
    createSlideshowContext(root, {
      id: "test",
      width: 100,
      height: 100,
      navigationIndex: 0,
      navigationSequence: sequence,
      templates: {},
    });

  it("creates a store with derived fields", () => {
    const store = build();
    const value = store.get();
    expect(value.activeSlide).toBe(0);
    expect(value.activeStep).toBe(1);
    expect(value.numSlides).toBe(2);
    expect(value.phase).toBe("registering");
    expect(value.pending).toEqual({});
    expect(value.ready).toBe(false);
  });

  it("updates activeSlide and activeStep when navigationIndex changes", () => {
    const store = build();
    store.setKey("navigationIndex", 2);
    expect(store.get().activeSlide).toBe(1);
    expect(store.get().activeStep).toBe(1);
    store.setKey("navigationIndex", 1);
    expect(store.get().activeSlide).toBe(0);
    expect(store.get().activeStep).toBe(2);
  });

  it("ready becomes true when phase leaves registering and pending is empty", () => {
    const store = build();
    store.setKey("phase", "loading");
    expect(store.get().ready).toBe(true);
    expect(store.get().phase).toBe("ready");
  });
});
