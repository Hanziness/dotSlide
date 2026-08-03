import { type MapStore, map } from "nanostores";

/** Information about a section in the hierarchy */
export type SectionInfo = {
  /** Section levels array, e.g. [1, 2, 4] for "1.2.4" */
  levels: number[];
  /** Optional title of the section */
  title?: string;
  /** Titles keyed by level number, e.g. { 1: "Part 1", 2: "Chapter A" } */
  titles: Partial<Record<number, string>>;
};

/** Section context holding the mapping of slides to sections */
export type SectionContext = {
  id: string;
  /** Map of slide index to section info */
  sectionsBySlide: Record<number, SectionInfo>;
  /** Whether sections have been initialized */
  initialized: boolean;
};

const sectionContexts = new WeakMap<HTMLElement, MapStore<SectionContext>>();

/** Create or retrieve a section context scoped to a slideshow root element */
export function createSectionContext(
  root: HTMLElement,
): MapStore<SectionContext> {
  if (!sectionContexts.has(root)) {
    const store = map<SectionContext>({
      id: root.dataset.slideshowId ?? "default",
      sectionsBySlide: {},
      initialized: false,
    });
    sectionContexts.set(root, store);
  }
  return sectionContexts.get(root)!;
}

/** Retrieve the section context for a child element's parent slideshow */
export function useSectionContext(
  child: HTMLElement,
): MapStore<SectionContext> | undefined {
  const root = child.closest("ds-slideshow");
  if (!(root instanceof HTMLElement)) return undefined;
  return sectionContexts.get(root);
}
