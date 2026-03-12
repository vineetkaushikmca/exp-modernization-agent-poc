/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://all.accor.com/a/en/deals-corner.html
 *
 * Source DOM structure (.cmp-headingpagehero):
 *   .cmp-headingpagehero--fullWidth .ace-image-v2 picture  → background image
 *   .cmp-headingpagehero-kicker span                       → eyebrow "Great deals"
 *   .cmp-headingpagehero-title h1                           → heading "Our offers"
 *   .cmp-headingpagehero-decription span p                  → description paragraph
 *
 * Target block table (1 col, 3 rows per block library):
 *   Row 1: block name
 *   Row 2: background image (picture element)
 *   Row 3: heading + subheading + description (wrapped in container div)
 */
export default function parse(element, { document }) {
  // Extract background image
  const bgImage = element.querySelector('.cmp-headingpagehero--fullWidth picture, .ace-image-v2 picture, picture');

  // Extract text content
  const eyebrow = element.querySelector('.cmp-headingpagehero-kicker span, .cmp-headingpagehero-kicker');
  const heading = element.querySelector('.cmp-headingpagehero-title h1, .cmp-headingpagehero-title h2, h1, h2');
  const description = element.querySelector('.cmp-headingpagehero-decription p, .cmp-headingpagehero-decription span p, p');

  const cells = [];

  // Row 1: background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: content (heading + description wrapped in container div)
  const contentContainer = document.createElement('div');
  if (eyebrow) {
    const eyebrowP = document.createElement('p');
    eyebrowP.textContent = eyebrow.textContent.trim();
    contentContainer.append(eyebrowP);
  }
  if (heading) {
    contentContainer.append(heading);
  }
  if (description) {
    contentContainer.append(description);
  }
  cells.push([contentContainer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
