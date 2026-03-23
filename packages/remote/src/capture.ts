import { snapdom } from "@zumer/snapdom"
import { client } from "./rpc-client";

/**
 * Capture slide thumbnails from the presenter's browser.
 *
 * Strategy: iterate through each ds-slide element, temporarily make it
 * visible, render to canvas, and convert to a compressed image blob.
 *
 * This uses html2canvas for cross-browser rendering support.
 * If html2canvas is unavailable, falls back to a simpler approach
 * using the native Canvas API (less accurate but zero-dependency).
 */

const THUMB_WIDTH = 320;
const THUMB_QUALITY = 0.7;

/**
 * Capture all slides and upload thumbnails to the server.
 *
 * @param serverUrl - Base URL of the dotslide server
 */
export async function captureAndUpload(roomId: string): Promise<void> {
  const slideshow = document.querySelector<HTMLElement>("ds-slideshow");
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll<HTMLElement>("ds-slide");
  const width = Number.parseInt(
    slideshow.getAttribute("data-slideshow-width") ?? "1024",
    10,
  );
  const height = Number.parseInt(
    slideshow.getAttribute("data-slideshow-height") ?? "768",
    10,
  );
  const scale = THUMB_WIDTH / width;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    try {
      const blob = await captureSlide(slide, width, height, scale);
      if (blob) {
        await uploadThumbnail(roomId, i, blob);
      }
    } catch (err) {
      console.warn(`[dotslide/capture] Failed to capture slide ${i}:`, err);
    }

    // Yield to the main thread between captures to avoid jank
    await new Promise((r) => requestAnimationFrame(r));
  }
}

async function captureSlide(
  slide: HTMLElement,
  width?: number,
  height?: number,
  scale?: number,
): Promise<Blob> {
  return (await snapdom(slide, { width, height, scale })).toBlob()
}

async function uploadThumbnail(
  roomId: string,
  index: number,
  blob: Blob,
): Promise<void> {
  
  const formData = new FormData();
  formData.append("thumbnail", blob, `slide-${index}.webp`);
  client.api.slides[":roomId"][":index"].thumbnail.$post({ param: { roomId, index: index.toString() }, form: { file: new File([blob], `slide-${index}.webp`) }  })
}
