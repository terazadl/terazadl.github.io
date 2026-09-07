'use strict';

const LANGUAGE_ORDER = ['EN', 'ZH', 'JA'];
const LANGUAGE_LABELS = {
  EN: 'EN',
  ZH: '中文',
  JA: '日本語'
};

function languageCode(lang) {
  const normalized = String(lang || '').toLowerCase();
  if (normalized.startsWith('en')) return 'EN';
  if (normalized.startsWith('ja')) return 'JA';
  return 'ZH';
}

hexo.extend.generator.register('content-index', function(locals) {
  const entries = locals.posts
    .sort('-date')
    .toArray()
    .map(post => {
      const categories = post.categories?.toArray?.() || [];
      return {
        path: `/${String(post.path || '').replace(/^\/+/, '')}`,
        title: String(post.title || ''),
        cardTitle: String(post.card_title || ''),
        description: String(post.description || ''),
        date: post.date?.format?.('YYYY-MM-DD') || '',
        category: categories[0]?.name || 'Uncategorized',
        langCode: languageCode(post.lang),
        translationKey: String(post.translation_key || post.path || '')
      };
    });

  const groupedEntries = new Map();
  entries.forEach(entry => {
    if (!groupedEntries.has(entry.translationKey)) groupedEntries.set(entry.translationKey, []);
    groupedEntries.get(entry.translationKey).push(entry);
  });

  const groups = Array.from(groupedEntries.entries()).map(([key, groupEntries]) => {
    const primary = groupEntries.find(entry => entry.cardTitle)
      || groupEntries.find(entry => entry.langCode === 'EN')
      || groupEntries.find(entry => entry.langCode === 'ZH')
      || groupEntries[0];
    const languages = groupEntries
      .map(entry => ({
        code: entry.langCode,
        label: LANGUAGE_LABELS[entry.langCode],
        path: entry.path
      }))
      .sort((a, b) => LANGUAGE_ORDER.indexOf(a.code) - LANGUAGE_ORDER.indexOf(b.code));

    return {
      key,
      date: groupEntries[0].date,
      primaryPath: primary.path,
      cardTitle: primary.cardTitle,
      title: primary.cardTitle || primary.title,
      description: primary.description,
      category: primary.category,
      languages
    };
  });

  const payload = JSON.stringify({ entries, groups }).replace(/</g, '\\u003c');

  return {
    path: 'js/content-index.js',
    data: `window.__SITE_CONTENT_INDEX__ = ${payload};\n`
  };
});

// Replace the source placeholder in rendered HTML with a per-build version so
// a changed article index cannot be hidden behind a cached static asset.
const buildVersion = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
hexo.extend.filter.register('after_render:html', (html, locals) => {
  const pagePath = String(locals?.path || locals?.page?.path || '').replace(/^\/+/, '');
  const hasCustomShell = /portfolio-(?:home|about|collection)-page|research-topic-hub-page/.test(html)
    || /^(?:essays|writing|topics)\/index\.html$/.test(pagePath);

  html = html
    .replace(
      /\/js\/content-index\.js\?v=BUILD_VERSION/g,
      `/js/content-index.js?v=${buildVersion}`
    )
    .replace(
      /<meta name="twitter:card" content="summary">\s*/g,
      ''
    )
    // NexT's legacy Font Awesome bundle is not needed by the custom UI. The
    // site supplies a small local text/icon fallback in styles.styl instead
    // of depending on cdnjs for every page.
    .replace(
      /<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^>]+>\s*/g,
      ''
    )
    .replace(
      /(\/css\/main\.css)(?!\?)/g,
      `$1?v=${buildVersion}`
    );

  // The custom shell is the only visible navigation. Remove NexT's legacy
  // brand/menu/search markup from the generated DOM instead of merely hiding
  // it with CSS. This keeps assistive technology and maintenance work aligned
  // with what readers actually see.
  if (html.includes('research-site-header')) {
    html = html.replace(
      /(<header class="header"[^>]*>)\s*[\s\S]*?(<div class="research-site-header">)/,
      '$1$2'
    );
  }

  // These custom landing pages do not use NexT's sidebar or generated TOC.
  // Strip it at build time so it cannot collapse the hero or remain in the
  // accessibility tree as a second navigation surface.
  if (hasCustomShell) {
    html = html.replace(/\s*<aside class="sidebar">[\s\S]*?<\/aside>\s*/g, '\n');
  }

  return html;
});
