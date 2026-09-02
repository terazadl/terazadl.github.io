'use strict';

// Small dependency-free Atom generator. Keeping the feed in the site source
// means RSS works on GitHub Pages without adding another runtime service.
function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  return String(value || '').replace(/]]>/g, ']]]]><![CDATA[>');
}

function isoDate(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function postUrl(siteUrl, post) {
  if (post.permalink) return String(post.permalink);
  return `${siteUrl}/${String(post.path || '').replace(/^\/+/, '')}`;
}

function buildFeed(locals) {
  const siteUrl = String(hexo.config.url || '').replace(/\/+$/, '');
  const posts = locals.posts.sort('-date').toArray().slice(0, 30);
  const updated = posts.length ? isoDate(posts[0].updated || posts[0].date) : new Date().toISOString();
  const entries = posts.map(post => {
    const url = postUrl(siteUrl, post);
    const summary = post.description || post.excerpt || '';
    return [
      '  <entry>',
      `    <title>${xmlEscape(post.title)}</title>`,
      `    <id>${xmlEscape(url)}</id>`,
      `    <link href="${xmlEscape(url)}"/>`,
      `    <published>${isoDate(post.date)}</published>`,
      `    <updated>${isoDate(post.updated || post.date)}</updated>`,
      `    <summary type="html"><![CDATA[${cdata(summary)}]]></summary>`,
      `    <content type="html"><![CDATA[${cdata(post.content)}]]></content>`,
      '    <author><name>Lei Deng</name></author>',
      '  </entry>'
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '  <title>Lei Deng｜最新文章</title>',
    `  <subtitle>${xmlEscape(hexo.config.description)}</subtitle>`,
    `  <id>${xmlEscape(siteUrl)}/</id>`,
    `  <link href="${xmlEscape(siteUrl)}/atom.xml" rel="self"/>`,
    `  <link href="${xmlEscape(siteUrl)}/"/>`,
    `  <updated>${updated}</updated>`,
    '  <author><name>Lei Deng</name></author>',
    entries.join('\n'),
    '</feed>',
    ''
  ].join('\n');
}

hexo.extend.generator.register('atom', locals => ({
  path: 'atom.xml',
  data: buildFeed(locals)
}));

hexo.extend.generator.register('feed-alias', locals => ({
  path: 'feed.xml',
  data: buildFeed(locals)
}));
