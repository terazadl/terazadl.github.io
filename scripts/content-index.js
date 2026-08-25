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
    const primary = groupEntries.find(entry => entry.langCode === 'EN')
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
      title: primary.title,
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
