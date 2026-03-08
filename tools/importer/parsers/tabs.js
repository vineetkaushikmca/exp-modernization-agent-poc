/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs block.
 * Base: tabs. Source: https://wknd-trendsetters.site/
 *
 * Instance (.tabs-wrapper):
 *   Tabbed testimonials with 4 tabs.
 *   Tab buttons: .tab-menu-link with avatar, name (strong), and role
 *   Tab panels: .tab-pane with image, name, role, and quote
 *
 * Target table structure (from Block Collection):
 *   2 columns per row: Col 1 = Tab label, Col 2 = Tab content
 */
export default function parse(element, { document }) {
  const tabPanes = Array.from(element.querySelectorAll('.tab-pane'));
  const tabButtons = Array.from(element.querySelectorAll('.tab-menu-link'));

  const cells = [];

  tabPanes.forEach((pane, i) => {
    // Extract tab label from button (person name)
    const button = tabButtons[i];
    let labelText = `Tab ${i + 1}`;
    if (button) {
      const strong = button.querySelector('strong');
      labelText = strong ? strong.textContent.trim() : button.textContent.trim();
    }

    // Create label element
    const label = document.createElement('p');
    label.textContent = labelText;

    // Use pane content directly
    cells.push([label, pane]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
