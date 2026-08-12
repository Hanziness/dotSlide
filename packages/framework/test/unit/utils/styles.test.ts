// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("injectStyles", () => {
  let injectStyles: (css: string, id?: string) => void;

  beforeEach(async () => {
    document.head.innerHTML = "";
    // The module keeps a module-level Set<string> for dedup that is not
    // exported. Reset modules between tests to get a fresh instance.
    vi.resetModules();
    injectStyles = (await import("../../../src/utils/styles.js")).injectStyles;
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

  it("only injects once per unique id", () => {
    injectStyles(".a { color: red; }", "dup");
    injectStyles(".b { color: blue; }", "dup");
    expect(styleElements()).toHaveLength(1);
  });

  it("uses id as the dedup key when provided", () => {
    injectStyles(".a { color: red; }", "same-id");
    injectStyles(".different { color: blue; }", "same-id");
    expect(styleElements()).toHaveLength(1);
    expect(styleElements()[0].textContent).toContain(".a");
  });

  it("uses the raw CSS string as the dedup key when no id is provided", () => {
    injectStyles(".a { color: red; }");
    injectStyles(".a { color: red; }");
    expect(styleElements()).toHaveLength(1);

    injectStyles(".b { color: blue; }");
    expect(styleElements()).toHaveLength(2);
  });
});
