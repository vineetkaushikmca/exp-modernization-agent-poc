/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://wknd-trendsetters.site/
 *
 * Two instances:
 *   1. Photo gallery (main > section:nth-of-type(2) .grid-layout.desktop-4-column):
 *      8 image-only cards in div.utility-aspect-1x1 wrappers
 *   2. Article cards (main > section:nth-of-type(4) .grid-layout.desktop-4-column):
 *      4 article cards as a.article-card with image + body (tag, date, title)
 *
 * Target table structure (from Block Collection):
 *   2 columns per row: Col 1 = Image, Col 2 = Text (title, description, CTA)
 */
export default function parse(element, { document }) {
  // Detect which instance: article cards have a.article-card children
  const articleCards = Array.from(element.querySelectorAll(':scope > a.article-card'));
  const cells = [];

  if (articleCards.length > 0) {
    // Article cards: image + text content with link
    articleCards.forEach((card) => {
      const img = card.querySelector('img.cover-image');
      const heading = card.querySelector('h3');
      const tag = card.querySelector('.tag');
      const dateMeta = card.querySelector('.paragraph-sm.utility-text-secondary');

      // Build text cell preserving semantics
      const textCell = document.createElement('div');

      if (heading) {
        const h = document.createElement('h3');
        const link = document.createElement('a');
        link.href = card.href;
        link.textContent = heading.textContent;
        h.appendChild(link);
        textCell.appendChild(h);
      }
      if (tag) {
        const p = document.createElement('p');
        p.textContent = tag.textContent;
        textCell.appendChild(p);
      }
      if (dateMeta) {
        const p = document.createElement('p');
        p.textContent = dateMeta.textContent;
        textCell.appendChild(p);
      }

      cells.push([img || '', textCell]);
    });
  } else {
    // Image-only cards (photo gallery) - div wrappers with images
    const imageDivs = Array.from(element.querySelectorAll(':scope > div'));
    imageDivs.forEach((div) => {
      const img = div.querySelector('img.cover-image');
      if (img) {
        cells.push([img, '']);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
