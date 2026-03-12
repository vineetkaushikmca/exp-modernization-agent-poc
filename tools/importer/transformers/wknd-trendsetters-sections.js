/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters sections.
 * Adds section breaks (<hr>) and Section Metadata blocks based on template sections.
 * Runs only in afterTransform hook (after block parsing).
 *
 * Template sections (from page-templates.json):
 *   section-1: header.section.secondary-section       → style: light-grey
 *   section-2: main > section:nth-of-type(1)          → style: null
 *   section-3: main > section:nth-of-type(2)          → style: light-grey
 *   section-4: main > section:nth-of-type(3)          → style: null
 *   section-5: main > section:nth-of-type(4)          → style: light-grey
 *   section-6: main > section:nth-of-type(5)          → style: null
 *   section-7: section.section.inverse-section         → style: dark
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const template = payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;

    const sections = template.sections;

    // Process sections in reverse order to avoid selector offset issues
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = Array.isArray(section.selector) ? section.selector : [section.selector];

      // Try each selector until one matches
      let sectionEl = null;
      for (const sel of selector) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) {
        console.warn(`Section "${section.name}" not found with selector: ${JSON.stringify(section.selector)}`);
        continue;
      }

      // Add Section Metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metaBlock);
      }

      // Add <hr> before non-first sections (section break)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
