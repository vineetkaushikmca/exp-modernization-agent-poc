/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Accor sections.
 * Adds section breaks (<hr>) between sections based on template definitions.
 * Runs in afterTransform only, using payload.template.sections.
 * Selectors from captured DOM of https://all.accor.com/a/en/deals-corner.html
 *
 * Sections:
 *   section-1: Hero Banner (.heading-hero) - style: null
 *   section-2: Deals Cards (.target.parbase) - style: null
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    const sectionEntries = [...sections].reverse();
    for (const section of sectionEntries) {
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section (except the first section)
      if (section.id !== sections[0].id) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
