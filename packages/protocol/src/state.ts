/** Snapshot of the presentation state, sent on sync */
export type NavigationSnapshot = {
  navigationIndex: number;
  activeSlide: number;
  activeStep: number;
  numSlides: number;
};
