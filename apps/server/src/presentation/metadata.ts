/**
 * Parse a built HTML file to extract slide metadata.
 *
 * The built Astro output contains `<ds-slide>` custom elements.
 * We count them and extract any data attributes for metadata.
 *
 * Note: This is a lightweight regex parse — not a full DOM parse.
 * For v1, we count `<ds-slide` occurrences and extract
 * data-section-title attributes.
 */
export function extractSlideMetadata(html: string): SlideMetadata[] {
  const slides: SlideMetadata[] = [];
  const regex = /<ds-slide[^>]*>/g;
  let index = 0;

  while (true) {
    const match = regex.exec(html);
    if (match === null) break;
    const tag = match[0];
    const titleMatch = tag.match(/data-section-title="([^"]*)"/);

    slides.push({
      index,
      title: titleMatch?.[1] ?? undefined,
      hasThumbnail: false,
    });
    index++;
  }

  return slides;
}

export type SlideMetadata = {
  index: number;
  title?: string;
  hasThumbnail: boolean;
};
