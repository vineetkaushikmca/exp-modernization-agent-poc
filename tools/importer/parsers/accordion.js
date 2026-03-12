/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Base: accordion. Source: https://wknd-trendsetters.site/
 *
 * Instance (.faq-list):
 *   4 FAQ items as details.faq-item elements.
 *   Each has summary.faq-question (with span or direct text) and div.faq-answer.
 *
 * Note: Rendered browser DOM may differ from static HTML. The <span> inside
 * <summary> may not exist in the live rendered DOM. Use fallback to
 * summary.textContent.trim() when span is not found.
 *
 * Target table structure (from Block Collection):
 *   2 columns per row: Col 1 = Question/title, Col 2 = Answer/content
 */
export default function parse(element, { document }) {
  const faqItems = Array.from(element.querySelectorAll('details.faq-item'));

  const cells = [];

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary.faq-question');
    const answer = item.querySelector('.faq-answer');

    // Get question text - handle both static HTML (has span) and rendered DOM (no span)
    let questionText = '';
    if (summary) {
      const summarySpan = summary.querySelector('span');
      questionText = summarySpan
        ? summarySpan.textContent.trim()
        : summary.textContent.trim();
    }

    const questionEl = document.createElement('p');
    questionEl.textContent = questionText;

    cells.push([questionEl, answer || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
