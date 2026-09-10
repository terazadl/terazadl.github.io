'use strict';

const { escapeHTML } = require('hexo-util');

// Section-level SEO overrides for the two listing hubs. The raw <title>
// replacement bypasses the theme's "| Lei Deng" suffix, so these strings
// carry the site name themselves.
const sectionSeo = {
  'writing/index.html': {
    title: 'Writing | Lei Deng — Research Essays & Weekly Briefs',
    description: "Browse Lei Deng's research writing on political economy, financial markets, technology, and institutional change in China and Japan."
  },
  'essays/index.html': {
    title: 'Essays | Lei Deng — Political Economy, Markets & Technology',
    description: 'Selected essays by Lei Deng on political economy, financial markets, technology, and institutional change in China and Japan.'
  }
};

// Tag archives with fewer distinct research items than this are treated as
// thin pages: they get a noindex robots directive here and are left out of
// the sitemap (scripts/sitemap.js).
const MIN_TAG_GROUPS = 2;

const HREFLANG_CODE = { EN: 'en', ZH: 'zh-CN', JA: 'ja' };
const POST_PATH_PATTERN = /^\d{4}\/\d{2}\/[^/]+\/index\.html$/;
const TAG_PATH_PATTERN = /^tags\/[^/]+\/index\.html$/;
const POST_NAV_PATTERN = /<div class="post-nav">\s*(?:<div class="post-nav-item">[\s\S]*?<\/div>\s*)+<\/div>/;

function languageCode(lang) {
  const normalized = String(lang || '').toLowerCase();
  if (normalized.startsWith('en')) return 'EN';
  if (normalized.startsWith('ja')) return 'JA';
  return 'ZH';
}

function replaceMeta(html, attribute, value) {
  const escaped = escapeHTML(value);
  const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${escaped}$2`);
}

function pageUrl(post) {
  const path = String(post.path || '').replace(/index\.html$/, '').replace(/\/+$/, '');
  return `/${path}/`;
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

// Route paths (".../index.html") and model paths (".../", pretty_urls) use
// different trailing conventions; compare on the normalized form.
function samePath(postPath, pagePath) {
  const normalize = value => String(value || '').replace(/index\.html$/, '').replace(/\/+$/, '');
  return normalize(postPath) === normalize(pagePath);
}

function translationGroupCount(tag) {
  return new Set(
    tag.posts
      .toArray()
      .map(post => String(post.translation_key || post.path || ''))
  ).size;
}

// Server-rendered hreflang alternates for posts that belong to a translation
// group (translation_key front-matter). Every version lists all versions,
// including itself, plus x-default, which is what crawlers require. The old
// client-side injection in body-end.njk was invisible to non-rendering
// crawlers and left the zh/en/ja versions unrelated to each other.
function hreflangLinks(page, posts) {
  const key = String(page.translation_key || '');
  if (!key) return null;

  const byLang = new Map();
  posts.forEach(post => {
    if (String(post.translation_key || '') !== key) return;
    const code = languageCode(post.lang);
    if (!byLang.has(code)) byLang.set(code, post);
  });
  if (byLang.size < 2) return null;

  const alternates = ['ZH', 'EN', 'JA']
    .filter(code => byLang.has(code))
    .map(code => ({ hreflang: HREFLANG_CODE[code], href: byLang.get(code).permalink }));

  const defaultPost = byLang.get('ZH') || byLang.get('EN') || byLang.get('JA');
  alternates.push({ hreflang: 'x-default', href: defaultPost.permalink });

  return alternates
    .map(alternate => `<link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}">`)
    .join('\n');
}

hexo.extend.filter.register('after_render:html', function(html, locals) {
  const page = locals?.page;
  const pagePath = String(locals?.path || page?.path || '').replace(/^\//, '');

  // og:url must agree with the canonical URL; the theme's open_graph helper
  // keeps a trailing index.html that the canonical does not.
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (canonical) {
    html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical[1]}"`);
  }

  // Listing hubs
  const seo = sectionSeo[pagePath];
  if (seo) {
    let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHTML(seo.title)}</title>`);
    result = replaceMeta(result, 'name="description"', seo.description);
    result = replaceMeta(result, 'property="og:title"', seo.title);
    result = replaceMeta(result, 'property="og:description"', seo.description);
    result = replaceMeta(result, 'name="twitter:title"', seo.title);
    result = replaceMeta(result, 'name="twitter:description"', seo.description);
    html = result;
  }

  if (POST_PATH_PATTERN.test(pagePath)) {
    const posts = hexo.locals.get('posts').toArray();

    // Static hreflang alternates for translation groups
    const alternates = hreflangLinks(page, posts);
    if (alternates) {
      html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${alternates}`);
    }

    // ZH posts carry front-matter `lang: zh`, which the theme copies to
    // <html lang> verbatim. Promote it to zh-CN so it matches the hreflang
    // and og:locale values (this used to be patched client-side).
    if (languageCode(page.lang) === 'ZH') {
      html = html.replace(/<html lang="zh">/, '<html lang="zh-CN">');
      html = html.replace(
        '<meta property="og:locale">',
        '<meta property="og:locale" content="zh_CN">'
      );
    }

    // Same-language prev/next navigation
    const code = languageCode(page.lang);
    const stream = posts
      .filter(post => languageCode(post.lang) === code)
      .sort((left, right) => right.date - left.date);
    const index = stream.findIndex(post => samePath(post.path, pagePath));
    if (index >= 0) {
      const prev = stream[index + 1] || null; // older article
      const next = stream[index - 1] || null;  // newer article
      const items = [];

      if (prev) {
        items.push([
          '            <div class="post-nav-item">',
          `                <a href="${escapeAttr(pageUrl(prev))}" rel="prev" title="${escapeAttr(prev.title)}">`,
          `                  <i class="fa fa-angle-left"></i> ${escapeAttr(prev.title)}`,
          '                </a>',
          '            </div>'
        ].join('\n'));
      }
      if (next) {
        items.push([
          '            <div class="post-nav-item">',
          `                <a href="${escapeAttr(pageUrl(next))}" rel="next" title="${escapeAttr(next.title)}">`,
          `                  ${escapeAttr(next.title)} <i class="fa fa-angle-right"></i>`,
          '                </a>',
          '            </div>'
        ].join('\n'));
      }

      const block = items.length
        ? `          <div class="post-nav">\n${items.join('\n')}\n          </div>`
        : '';
      html = html.replace(POST_NAV_PATTERN, block);
    }
  }

  // Thin tag archives: noindex, keep following the links
  if (TAG_PATH_PATTERN.test(pagePath)) {
    const tag = hexo.locals.get('tags').toArray().find(item => samePath(item.path, pagePath));
    if (tag && translationGroupCount(tag) < MIN_TAG_GROUPS) {
      html = html.replace('<meta name="robots" content="index,follow', '<meta name="robots" content="noindex,follow');
    }
  }

  return html;
});
