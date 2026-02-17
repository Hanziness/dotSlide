import type { ResourceInfo } from "../store/context/slideshow";
import { generateId } from ".";
import { RESOURCE_READY, RESOURCE_REGISTER } from "./events";
import { logger } from "./logger";

/**
 * Handle returned from {@link registerResource} that signals readiness.
 */
export type ResourceHandle = {
  ready: () => void;
  error: (err: unknown) => void;
  id: string;
};

/**
 * Detail payload shared between resource registration and readiness events.
 */
export type ResourceRegistrationDetail = ResourceInfo & {
  resourceId: string;
};

/**
 * Registers a resource with the readiness system.
 *
 * @param element - Element dispatching the registration event.
 * @param id - Optional override for the generated resource id.
 */
export function registerResource(
  element: HTMLElement,
  id?: string,
): ResourceHandle {
  const resourceId = id ?? generateId();
  const slide = element.closest("ds-slide");
  let slideIndex: ResourceInfo["slideIndex"] = -1;

  if (slide !== null) {
    const attribute = slide.getAttribute("data-slide-index");
    if (attribute !== null) {
      const parsedIndex = parseInt(attribute, 10);
      if (!Number.isNaN(parsedIndex)) {
        slideIndex = parsedIndex;
      }
    }
  }

  const detail: ResourceRegistrationDetail = {
    resourceId,
    slideIndex,
  };

  element.dispatchEvent(
    new CustomEvent<ResourceRegistrationDetail>(RESOURCE_REGISTER, {
      bubbles: true,
      detail,
    }),
  );

  let signaled = false;

  const signal = () => {
    if (signaled) {
      return;
    }
    signaled = true;
    element.dispatchEvent(
      new CustomEvent<ResourceRegistrationDetail>(RESOURCE_READY, {
        bubbles: true,
        detail,
      }),
    );
  };

  return {
    id: resourceId,
    ready: signal,
    error: (err: unknown) => {
      logger.error(`Resource ${resourceId} failed:`, err);
      signal();
    },
  };
}
