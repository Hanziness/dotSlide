import { provideContext, useContext } from "."

export type SlideContext = {
    index: number
}

export const createSlideContext = (element: HTMLElement, initialValue: SlideContext) => {
    return provideContext<SlideContext>(element, initialValue)
}

export const useSlideContext = (childElement: HTMLElement) => {
    return useContext<SlideContext>(childElement, "ds-slide")
}