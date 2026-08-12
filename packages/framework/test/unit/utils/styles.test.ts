// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  injectStyles,
  resetInjectedStyles,
} from "../../../src/utils/styles.js";

describe("injectStyles", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    resetInjectedStyles();
  });

  const styleElements = () => document.head.querySelectorAll("style");

  it("creates a <style> element in document.head", () => {
    injectStyles(".a { color: red; }", "test");
    expect(styleElements()).toHaveLength(1);
  });

  it("wraps CSS in @layer dotslide when not already wrapped", () => {
    injectStyles(".a { color: red; }", "test");
    expect(styleElements()[0].textContent).toBe(
      "@layer dotslide {\n.a { color: red; }\n}",
    );
  });

  it("does not double-wrap when CSS already contains @layer dotslide", () => {
    injectStyles("@layer dotslide { .a { color: red; } }", "test");
    expect(styleElements()[0].textContent).toBe(
      "@layer dotslide { .a { color: red; } }",
    );
  });

  it("sets the data-dotslide attribute when id is provided", () => {
    injectStyles(".a { color: red; }", "my-component");
    expect(styleElements()[0].getAttribute("data-dotslide")).toBe(
      "my-component",
    );
  });

  it("does not set the data-dotslide attribute when no id is provided", () => {
    injectStyles(".a { color: red; }");
    expect(styleElements()[0].hasAttribute("data-dotslide")).toBe(false);
  });

  it("dedups by id across different CSS", () => {
    injectStyles(".a { color: red; }", "dup");
    injectStyles(".b { color: blue; }", "dup");
    expect(styleElements()).toHaveLength(1);
    expect(styleElements()[0].textContent).toContain(".a");
  });

  it("dedups by raw CSS when no id is provided", () => {
    injectStyles(".a { color: red; }");
    injectStyles(".a { color: red; }");
    expect(styleElements()).toHaveLength(1);

    injectStyles(".b { color: blue; }");
    expect(styleElements()).toHaveLength(2);
  });
});
