/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters cleanup.
 * Selectors from captured DOM of https://wknd-trendsetters.site/
 *
 * Full page body children:
 *   a.skip-link          - Skip to main content link
 *   div.navbar            - Navigation bar (logo, subscribe, hamburger)
 *   script                - JavaScript
 *   main#main-content     - Main content (keep)
 *   footer.footer         - Site footer
 *   script                - JavaScript
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove elements that block parsing
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link[rel="stylesheet"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (selectors from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
