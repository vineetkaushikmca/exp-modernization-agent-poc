/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'WKND Trendsetters homepage with hero, featured content, testimonials, articles, and FAQ sections',
  urls: [
    'https://wknd-trendsetters.site/',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        'header.section.secondary-section > .container',
        'section.section.inverse-section > .container',
      ],
    },
    {
      name: 'columns',
      instances: [
        'main > section:nth-of-type(1) .grid-layout',
      ],
    },
    {
      name: 'cards',
      instances: [
        'main > section:nth-of-type(2) .grid-layout.desktop-4-column',
        'main > section:nth-of-type(4) .grid-layout.desktop-4-column',
      ],
    },
    {
      name: 'tabs',
      instances: [
        '.tabs-wrapper',
      ],
    },
    {
      name: 'accordion',
      instances: [
        '.faq-list',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Header',
      selector: 'header.section.secondary-section',
      style: 'light-grey',
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Featured Article',
      selector: 'main > section:nth-of-type(1)',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Photo Gallery',
      selector: 'main > section:nth-of-type(2)',
      style: 'light-grey',
      blocks: ['cards'],
      defaultContent: [
        'main > section:nth-of-type(2) h2.h2-heading',
        'main > section:nth-of-type(2) p.paragraph-lg',
      ],
    },
    {
      id: 'section-4',
      name: 'Testimonials',
      selector: 'main > section:nth-of-type(3)',
      style: null,
      blocks: ['tabs'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Latest Articles',
      selector: 'main > section:nth-of-type(4)',
      style: 'light-grey',
      blocks: ['cards'],
      defaultContent: [
        'main > section:nth-of-type(4) h2.h2-heading',
        'main > section:nth-of-type(4) p.paragraph-lg',
      ],
    },
    {
      id: 'section-6',
      name: 'FAQ',
      selector: 'main > section:nth-of-type(5)',
      style: null,
      blocks: ['accordion'],
      defaultContent: [
        'main > section:nth-of-type(5) h2.h2-heading',
        'main > section:nth-of-type(5) p.subheading',
      ],
    },
    {
      id: 'section-7',
      name: 'CTA Banner',
      selector: 'section.section.inverse-section',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'tabs': tabsParser,
  'accordion': accordionParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    let pathname = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    if (!pathname) pathname = '/index';
    const path = WebImporter.FileUtils.sanitizePath(pathname);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
