'use strict';

const { escapeHTML } = require('hexo-util');

const sectionSeo = {
  'writing/index.html': {
    title: 'Writing',
    description: "Browse Lei Deng's research writing on political economy, financial markets, technology, and institutional change in China and Japan."
  },
  'essays/index.html': {
    title: 'Essays',
    description: 'Selected essays by Lei Deng on political economy, financial markets, technology, and institutional change in China and Japan.'
  }
};

function replaceMeta(html, attribute, value) {
  const escaped = escapeHTML(value);
  const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*(")`, 'i');
  return html.replace(pattern, `$1${escaped}$2`);
}

hexo.extend.filter.register('after_render:html', function(html, locals) {
  const pagePath = String(locals?.path || locals?.page?.path || '').replace(/^\//, '');
  const seo = sectionSeo[pagePath];
  if (!seo) return html;

  let result = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHTML(seo.title)}</title>`);
  result = replaceMeta(result, 'name="description"', seo.description);
  result = replaceMeta(result, 'property="og:title"', seo.title);
  result = replaceMeta(result, 'property="og:description"', seo.description);
  result = replaceMeta(result, 'name="twitter:title"', seo.title);
  result = replaceMeta(result, 'name="twitter:description"', seo.description);
  return result;
});
