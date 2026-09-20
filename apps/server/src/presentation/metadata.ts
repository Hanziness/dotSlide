/**
 * Parse a built HTML file to extract slide metadata.
 *
 * The built Astro output contains `<ds-slide>` custom elements, optionally
 * preceded by `<ds-section title="...">` markers. Slides inherit the title
 * of the section that precedes them.
 *
 * Note: This is a lightweight regex parse — not a full DOM parse.
 * For v1, we walk `<ds-section>` and `<ds-slide>` tags in document order.
 */
export function extractSlideMetadata(html: string): SlideMetadata[] {
  const slides: SlideMetadata[] = [];
  const regex = /<ds-(section|slide)[^>]*>/g;
  let index = 0;
  let sectionTitle: string | undefined;

  while (true) {
    const match = regex.exec(html);
    if (match === null) break;
    const [tag, element] = match;

    if (element === "section") {
      sectionTitle = tag.match(/title="([^"]*)"/)?.[1] ?? undefined;
      continue;
    }

    slides.push({
      index,
      title: sectionTitle,
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
