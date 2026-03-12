/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://all.accor.com/a/en/deals-corner.html
 *
 * Source DOM structure (.target.parbase container):
 *   Dynamically loaded via Adobe Target into:
 *   .campaign > .experiencefragment > ... > .callout-edito > .sr-only > ul > li
 *     div.ads-callout-editorial
 *       .ads-image-product .ads-media picture           → card image
 *       a.ads-callout-editorial__title-link[href]       → card link
 *         h3.ads-callout-editorial__title               → card title
 *       p.ads-callout-editorial__description            → card description
 *
 * Target block table (2 cols, N rows per block library):
 *   Row 1: block name
 *   Each subsequent row: image (col 1) | title + description + link (col 2)
 */
export default function parse(element, { document }) {
  // Find all top-level card elements within the container at any depth
  // Cards are inside .sr-only > ul > li > div.ads-callout-editorial
  const cardEls = element.querySelectorAll('.ads-callout-editorial');
  const cells = [];

  // Filter to only top-level .ads-callout-editorial (not nested ones)
  const topLevelCards = Array.from(cardEls).filter(
    (card) => !card.parentElement.closest('.ads-callout-editorial'),
  );

  topLevelCards.forEach((card) => {
    // Extract image
    const picture = card.querySelector('.ads-image-product picture, picture');

    // Extract linked title
    const titleLink = card.querySelector('a.ads-callout-editorial__title-link, a[href]');
    const title = card.querySelector('h3.ads-callout-editorial__title, h3');

    // Extract description
    const description = card.querySelector('p.ads-callout-editorial__description, p');

    // Build text content cell
    const textContainer = document.createElement('div');
    if (title && titleLink) {
      const link = document.createElement('a');
      link.href = titleLink.href;
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      link.append(h3);
      textContainer.append(link);
    } else if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      textContainer.append(h3);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textContainer.append(p);
    }

    // Add row: [image, text content]
    if (picture) {
      cells.push([picture, textContainer]);
    } else {
      cells.push([textContainer]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
