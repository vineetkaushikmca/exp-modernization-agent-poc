/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Accor cleanup.
 * Removes non-authorable content from all.accor.com pages.
 * Selectors from captured DOM of https://all.accor.com/a/en/deals-corner.html
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent dialog (found: #onetrust-consent-sdk in body)
    // Remove batch SDK notification (found: #batchsdk-ui-alert-container in body)
    // Remove scripts and style links that block parsing
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#batchsdk-ui-alert-container',
      'script',
      'link[rel="preload"]',
      'link[rel="stylesheet"]',
      'link[as="style"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome
    // Header nav (found: .header.container.responsivegrid)
    // Footer (found: footer element and [role="contentinfo"])
    // Experience fragments (found: .experiencefragment inside .root.container)
    // Custom elements (found: ace-callout-editorial-container, data-loading placeholders)
    // Iframes, noscript, remaining link/source elements
    WebImporter.DOMUtils.remove(element, [
      '.header.container.responsivegrid',
      'footer',
      '[role="contentinfo"]',
      '.experiencefragment',
      'ace-callout-editorial-container',
      'iframe',
      'noscript',
      'link',
      'source',
    ]);

    // Remove data attributes and tracking attributes from all elements
    element.querySelectorAll('*').forEach((el) => {
      if (el.hasAttribute('data-testid')) el.removeAttribute('data-testid');
      if (el.hasAttribute('data-loaded')) el.removeAttribute('data-loaded');
      if (el.hasAttribute('data-cs-override-id')) el.removeAttribute('data-cs-override-id');
      if (el.hasAttribute('data-kameleoon-dynamic-class-bhhg')) el.removeAttribute('data-kameleoon-dynamic-class-bhhg');
      if (el.hasAttribute('kameleoonlistener-vxsh')) el.removeAttribute('kameleoonlistener-vxsh');
      if (el.hasAttribute('data-asset-id')) el.removeAttribute('data-asset-id');
      if (el.hasAttribute('data-cmp-hook-heroheading')) el.removeAttribute('data-cmp-hook-heroheading');
    });
  }
}
