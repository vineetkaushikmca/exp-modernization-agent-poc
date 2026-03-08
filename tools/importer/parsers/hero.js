/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://wknd-trendsetters.site/
 *
 * Two instances:
 *   1. Header hero (header.section.secondary-section > .container):
 *      H1 + subheading + 2 CTA buttons + 3 content images
 *   2. CTA banner (section.section.inverse-section > .container):
 *      Background image with overlay + H2 + subheading + CTA button
 *
 * Target table structure (from Block Collection):
 *   Row 1: Image (optional - background or content images)
 *   Row 2: Heading + subheading + CTA buttons
 */
export default function parse(element, { document }) {
  // Find heading (h1 for header hero, h2 for CTA banner)
  const heading = element.querySelector('h1, h2');

  // Find subheading
  const subheading = element.querySelector('p.subheading');

  // Find CTA buttons
  const buttons = Array.from(element.querySelectorAll('.button-group a.button'));

  // Check for background/overlay image (CTA banner - has utility-overlay class)
  const bgImage = element.querySelector('img.utility-overlay');

  // Content images (header hero - images in nested grid)
  const contentImages = bgImage
    ? []
    : Array.from(element.querySelectorAll('img.cover-image'));

  const cells = [];

  // Row 1: Image(s) if present
  if (bgImage) {
    cells.push([bgImage]);
  } else if (contentImages.length > 0) {
    const container = document.createElement('div');
    contentImages.forEach((img) => container.appendChild(img));
    cells.push([container]);
  }

  // Row 2: Content (heading + subheading + CTAs) wrapped in single container
  const contentContainer = document.createElement('div');
  if (heading) contentContainer.appendChild(heading);
  if (subheading) contentContainer.appendChild(subheading);
  buttons.forEach((btn) => contentContainer.appendChild(btn));
  if (contentContainer.childNodes.length > 0) cells.push([contentContainer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
