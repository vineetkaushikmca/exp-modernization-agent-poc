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

  // tools/importer/import-deals-corner.js
  var import_deals_corner_exports = {};
  __export(import_deals_corner_exports, {
    default: () => import_deals_corner_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(".cmp-headingpagehero--fullWidth picture, .ace-image-v2 picture, picture");
    const eyebrow = element.querySelector(".cmp-headingpagehero-kicker span, .cmp-headingpagehero-kicker");
    const heading = element.querySelector(".cmp-headingpagehero-title h1, .cmp-headingpagehero-title h2, h1, h2");
    const description = element.querySelector(".cmp-headingpagehero-decription p, .cmp-headingpagehero-decription span p, p");
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentContainer = document.createElement("div");
    if (eyebrow) {
      const eyebrowP = document.createElement("p");
      eyebrowP.textContent = eyebrow.textContent.trim();
      contentContainer.append(eyebrowP);
    }
    if (heading) {
      contentContainer.append(heading);
    }
    if (description) {
      contentContainer.append(description);
    }
    cells.push([contentContainer]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cardEls = element.querySelectorAll(".ads-callout-editorial");
    const cells = [];
    const topLevelCards = Array.from(cardEls).filter(
      (card) => !card.parentElement.closest(".ads-callout-editorial")
    );
    topLevelCards.forEach((card) => {
      const picture = card.querySelector(".ads-image-product picture, picture");
      const titleLink = card.querySelector("a.ads-callout-editorial__title-link, a[href]");
      const title = card.querySelector("h3.ads-callout-editorial__title, h3");
      const description = card.querySelector("p.ads-callout-editorial__description, p");
      const textContainer = document.createElement("div");
      if (title && titleLink) {
        const link = document.createElement("a");
        link.href = titleLink.href;
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        link.append(h3);
        textContainer.append(link);
      } else if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        textContainer.append(h3);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textContainer.append(p);
      }
      if (picture) {
        cells.push([picture, textContainer]);
      } else {
        cells.push([textContainer]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/accor-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#batchsdk-ui-alert-container",
        "script",
        'link[rel="preload"]',
        'link[rel="stylesheet"]',
        'link[as="style"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".header.container.responsivegrid",
        "footer",
        '[role="contentinfo"]',
        ".experiencefragment",
        "ace-callout-editorial-container",
        "iframe",
        "noscript",
        "link",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        if (el.hasAttribute("data-testid")) el.removeAttribute("data-testid");
        if (el.hasAttribute("data-loaded")) el.removeAttribute("data-loaded");
        if (el.hasAttribute("data-cs-override-id")) el.removeAttribute("data-cs-override-id");
        if (el.hasAttribute("data-kameleoon-dynamic-class-bhhg")) el.removeAttribute("data-kameleoon-dynamic-class-bhhg");
        if (el.hasAttribute("kameleoonlistener-vxsh")) el.removeAttribute("kameleoonlistener-vxsh");
        if (el.hasAttribute("data-asset-id")) el.removeAttribute("data-asset-id");
        if (el.hasAttribute("data-cmp-hook-heroheading")) el.removeAttribute("data-cmp-hook-heroheading");
      });
    }
  }

  // tools/importer/transformers/accor-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const sectionEntries = [...sections].reverse();
      for (const section of sectionEntries) {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-deals-corner.js
  var parsers = {
    "hero": parse,
    "cards": parse2
  };
  var PAGE_TEMPLATE = {
    name: "deals-corner",
    description: "Accor deals and promotions landing page showcasing current offers and special rates",
    urls: [
      "https://all.accor.com/a/en/deals-corner.html"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".cmp-headingpagehero"]
      },
      {
        name: "cards",
        instances: [".target.parbase"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".heading-hero",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Deals Cards",
        selector: ".target.parbase",
        style: null,
        blocks: ["cards"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_deals_corner_default = {
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
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
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
  return __toCommonJS(import_deals_corner_exports);
})();
