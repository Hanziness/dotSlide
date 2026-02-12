import { getSelector } from "../../utils";
import { provideContext, useContext } from ".";

export type SlideshowContext = {
  id: string;
  width: number;
  height: number;
  activeSlide: number;
  /** @readonly Number of slides in the presentation */
  numSlides: number;
  /** Root element of the Slideshow */
  root: HTMLElement;
};

export const createSlideshowContext = (
  root: HTMLElement,
  initialValue: Omit<SlideshowContext, 'root'>,
) => {
  console.info('Creating slideshow context')
  return provideContext<SlideshowContext>(root,{ ...initialValue, root });
}

/** Returns a Slideshow context
 *
 * @throws Throws an error if there is no available Slideshow context
 */
export const useSlideshowContext = (child: HTMLElement) => {
  const ctx = useContext<SlideshowContext>(child, 'ds-slideshow');
  
  console.info('Using slideshow context')

  if (ctx === undefined) {
    throw new Error(`No Slideshow context found for ${child.tagName}`, { cause: child });
  }

  return ctx;
};
