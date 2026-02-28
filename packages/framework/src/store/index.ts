import { mapCreator } from "nanostores";

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

const createSectionContext = mapCreator<SectionContext>((store, id) => {
  store.set({ id, sectionsBySlide: {}, initialized: false });
});

export const sectionContext = createSectionContext("default");
