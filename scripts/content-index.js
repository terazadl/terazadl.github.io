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

// Attribute-only escaping. hexo-util's escapeHTML also escapes "/" as
// &#x2F; (for inline <script> use), which is needlessly noisy in href and
// title attributes.
function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const ZH_CATEGORY_LABELS = {
  'Money & Markets': '金融与市场',
  'AI & Industry': 'AI 与产业',
  Japan: '日本',
  书评: '书评',
  生活观察: '生活观察'
};

// Weekly briefs get the country-colored pill; everything else falls back to
// the category label. Mirrors the client-side render in body-end.njk.
function weeklyVariant(group) {
  if (group.key.startsWith('china-political-economy-weekly')) return 'china';
  if (group.key.startsWith('japan-political-economy-weekly')) return 'japan';
  return '';
}

// Single source of truth for the site's post index. The generator below
// emits /js/content-index.js (read by the client), and the after_render
// filter uses the same builder for the homepage's no-JS latest list, so the
// static fallback and the dynamic index can never drift apart.
function buildContentIndex(posts) {
  const entries = posts
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

  return { entries, groups };
}

// Homepage 最新写作 rows for readers without JS. Kept in the same-shaped
// markup the client replaces at runtime, and generated from the same post
// index, so check-homepage.js (which requires the top three groups to appear
// before the content-index script) stays green without hand-maintenance.
function homepageLatestList(posts) {
  const { entries, groups } = buildContentIndex(posts);
  const latestGroups = groups
    .filter(group => group.category !== 'Notes')
    // 周报已在首屏置顶/并排展示，最新列表不再重复（与客户端渲染一致）。
    .filter(group => !weeklyVariant(group))
    .slice(0, 3);
  if (!latestGroups.length) return null;

  const entryByPath = new Map(entries.map(entry => [entry.path, entry]));
  return latestGroups.map(group => {
    const preferred = group.languages.find(language => language.code === 'ZH')
      || group.languages.find(language => language.code === 'EN')
      || group.languages[0];
    const entry = preferred ? entryByPath.get(preferred.path) : null;
    const title = entry?.cardTitle || entry?.title || group.title;
    const href = entry?.path || group.primaryPath;
    const description = entry?.description || group.description;
    const variant = weeklyVariant(group);
    const pillClass = variant === 'china' ? 'is-china' : variant === 'japan' ? 'is-japan' : '';
    const pillLabel = variant === 'china' ? '中国周报'
      : variant === 'japan' ? '日本周报'
      : ZH_CATEGORY_LABELS[group.category] || group.category;
    const pill = `<span class="research-cat-pill${pillClass ? ` ${pillClass}` : ''}">${escapeAttr(pillLabel)}</span>`;
    const languageChips = group.languages.length > 1
      ? `<nav class="research-latest-language-links" aria-label="可用语言版本">${group.languages
          .map(language => `<a href="${escapeAttr(language.path)}" class="research-lang-chip">${escapeAttr(language.code)}</a>`)
          .join('')}</nav>`
      : '';

    return [
      '      <article class="research-latest-row" data-static-latest>',
      '        <div class="research-latest-meta">',
      `          <time datetime="${escapeAttr(group.date)}">${escapeAttr(group.date)}</time>`,
      `          ${pill}`,
      languageChips,
      '        </div>',
      `        <h3><a href="${escapeAttr(href)}">${escapeAttr(title)}</a></h3>`,
      description ? `        <p>${escapeAttr(description)}</p>` : '',
      `        <a class="research-arrow-link" href="${escapeAttr(href)}">阅读全文 <i class="fa fa-arrow-right" aria-hidden="true"></i></a>`,
      '      </article>'
    ].filter(Boolean).join('\n');
  }).join('\n');
}

hexo.extend.generator.register('content-index', function(locals) {
  const { entries, groups } = buildContentIndex(locals.posts);
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

  // Homepage: render the no-JS latest list from the same post index that
  // feeds /js/content-index.js and the client-side list.
  if (html.includes('id="research-latest-list"')) {
    const rows = homepageLatestList(hexo.locals.get('posts'));
    if (rows) {
      const list = '<div class="research-latest-list"';
      const start = html.indexOf(list);
      if (start >= 0) {
        const tagEnd = html.indexOf('>', start) + 1;
        const tokenPattern = /<\/?div\b[^>]*>/g;
        tokenPattern.lastIndex = tagEnd;
        let depth = 1;
        let end = -1;
        let match;
        while ((match = tokenPattern.exec(html)) !== null) {
          if (match[0].startsWith('</div')) {
            if (--depth === 0) {
              end = match.index;
              break;
            }
          } else {
            depth += 1;
          }
        }
        if (end >= 0) {
          const closeEnd = end + '</div>'.length;
          html = html.slice(0, tagEnd) + `\n${rows}\n` + html.slice(closeEnd);
        }
      }
    }
  }

  const hasCustomShell = /portfolio-(?:home|about|collection)-page|research-topic-hub-page|event-radar-page-body/.test(html)
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
