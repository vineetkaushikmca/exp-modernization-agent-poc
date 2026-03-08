var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, h2");
    const subheading = element.querySelector("p.subheading");
    const buttons = Array.from(element.querySelectorAll(".button-group a.button"));
    const bgImage = element.querySelector("img.utility-overlay");
    const contentImages = bgImage ? [] : Array.from(element.querySelectorAll("img.cover-image"));
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    } else if (contentImages.length > 0) {
      const container = document.createElement("div");
      contentImages.forEach((img) => container.appendChild(img));
      cells.push([container]);
    }
    const contentContainer = document.createElement("div");
    if (heading) contentContainer.appendChild(heading);
    if (subheading) contentContainer.appendChild(subheading);
    buttons.forEach((btn) => contentContainer.appendChild(btn));
    if (contentContainer.childNodes.length > 0) cells.push([contentContainer]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const columnDivs = Array.from(element.querySelectorAll(":scope > div"));
    const row = columnDivs.map((col) => col);
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document }) {
    const articleCards = Array.from(element.querySelectorAll(":scope > a.article-card"));
    const cells = [];
    if (articleCards.length > 0) {
      articleCards.forEach((card) => {
        const img = card.querySelector("img.cover-image");
        const heading = card.querySelector("h3");
        const tag = card.querySelector(".tag");
        const dateMeta = card.querySelector(".paragraph-sm.utility-text-secondary");
        const textCell = document.createElement("div");
        if (heading) {
          const h = document.createElement("h3");
          const link = document.createElement("a");
          link.href = card.href;
          link.textContent = heading.textContent;
          h.appendChild(link);
          textCell.appendChild(h);
        }
        if (tag) {
          const p = document.createElement("p");
          p.textContent = tag.textContent;
          textCell.appendChild(p);
        }
        if (dateMeta) {
          const p = document.createElement("p");
          p.textContent = dateMeta.textContent;
          textCell.appendChild(p);
        }
        cells.push([img || "", textCell]);
      });
    } else {
      const imageDivs = Array.from(element.querySelectorAll(":scope > div"));
      imageDivs.forEach((div) => {
        const img = div.querySelector("img.cover-image");
        if (img) {
          cells.push([img, ""]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse4(element, { document }) {
    const tabPanes = Array.from(element.querySelectorAll(".tab-pane"));
    const tabButtons = Array.from(element.querySelectorAll(".tab-menu-link"));
    const cells = [];
    tabPanes.forEach((pane, i) => {
      const button = tabButtons[i];
      let labelText = `Tab ${i + 1}`;
      if (button) {
        const strong = button.querySelector("strong");
        labelText = strong ? strong.textContent.trim() : button.textContent.trim();
      }
      const label = document.createElement("p");
      label.textContent = labelText;
      cells.push([label, pane]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse5(element, { document }) {
    const faqItems = Array.from(element.querySelectorAll("details.faq-item"));
    const cells = [];
    faqItems.forEach((item) => {
      const summary = item.querySelector("summary.faq-question");
      const answer = item.querySelector(".faq-answer");
      let questionText = "";
      if (summary) {
        const summarySpan = summary.querySelector("span");
        questionText = summarySpan ? summarySpan.textContent.trim() : summary.textContent.trim();
      }
      const questionEl = document.createElement("p");
      questionEl.textContent = questionText;
      cells.push([questionEl, answer || ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        'link[rel="stylesheet"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "div.navbar",
        "footer.footer",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) {
          console.warn(`Section "${section.name}" not found with selector: ${JSON.stringify(section.selector)}`);
          continue;
        }
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND Trendsetters homepage with hero, featured content, testimonials, articles, and FAQ sections",
    urls: [
      "https://wknd-trendsetters.site/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "header.section.secondary-section > .container",
          "section.section.inverse-section > .container"
        ]
      },
      {
        name: "columns",
        instances: [
          "main > section:nth-of-type(1) .grid-layout"
        ]
      },
      {
        name: "cards",
        instances: [
          "main > section:nth-of-type(2) .grid-layout.desktop-4-column",
          "main > section:nth-of-type(4) .grid-layout.desktop-4-column"
        ]
      },
      {
        name: "tabs",
        instances: [
          ".tabs-wrapper"
        ]
      },
      {
        name: "accordion",
        instances: [
          ".faq-list"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Header",
        selector: "header.section.secondary-section",
        style: "light-grey",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Featured Article",
        selector: "main > section:nth-of-type(1)",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Photo Gallery",
        selector: "main > section:nth-of-type(2)",
        style: "light-grey",
        blocks: ["cards"],
        defaultContent: [
          "main > section:nth-of-type(2) h2.h2-heading",
          "main > section:nth-of-type(2) p.paragraph-lg"
        ]
      },
      {
        id: "section-4",
        name: "Testimonials",
        selector: "main > section:nth-of-type(3)",
        style: null,
        blocks: ["tabs"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Latest Articles",
        selector: "main > section:nth-of-type(4)",
        style: "light-grey",
        blocks: ["cards"],
        defaultContent: [
          "main > section:nth-of-type(4) h2.h2-heading",
          "main > section:nth-of-type(4) p.paragraph-lg"
        ]
      },
      {
        id: "section-6",
        name: "FAQ",
        selector: "main > section:nth-of-type(5)",
        style: null,
        blocks: ["accordion"],
        defaultContent: [
          "main > section:nth-of-type(5) h2.h2-heading",
          "main > section:nth-of-type(5) p.subheading"
        ]
      },
      {
        id: "section-7",
        name: "CTA Banner",
        selector: "section.section.inverse-section",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero": parse,
    "columns": parse2,
    "cards": parse3,
    "tabs": parse4,
    "accordion": parse5
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let pathname = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      if (!pathname) pathname = "/index";
      const path = WebImporter.FileUtils.sanitizePath(pathname);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
