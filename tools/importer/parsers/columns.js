/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://wknd-trendsetters.site/
 *
 * Instance (main > section:nth-of-type(1) .grid-layout):
 *   Two-column layout:
 *     Col 1: Image (adventure-spots.avif)
 *     Col 2: Breadcrumbs + H2 heading + author metadata + date
 *
 * Target table structure (from Block Collection):
 *   One row with N columns. Each cell contains text, images, or inline elements.
 */
export default function parse(element, { document }) {
  // element is the .grid-layout div; direct child divs are columns
  const columnDivs = Array.from(element.querySelectorAll(':scope > div'));

  // Build cells: one row with N columns
  const row = columnDivs.map((col) => col);
  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
