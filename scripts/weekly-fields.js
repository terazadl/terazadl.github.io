'use strict';

// Core-event four-field grammar.
//
// Transforms the weekly brief's markdown field list
// (发生了什么 / 为什么重要 / 接下来关注什么 / 来源) into semantic HTML with
// the lightweight visual treatment defined in source/_data/styles.styl.
//
// Drafts stay plain markdown: the labels are renamed here (事实 / 研判 /
// 观察点) so the published output carries the new editorial vocabulary
// without touching the source drafts. Both the legacy and the new label
// spellings are accepted, so already-published posts and future drafts
// render identically.

const EVENT_FIELDS_PATTERN = /<ul>\s*<li><strong>(?:发生了什么（事实）|事实)<\/strong>：([\s\S]*?)<\/li>\s*<li><strong>(?:为什么重要（分析判断）|研判)<\/strong>：([\s\S]*?)<\/li>\s*<li><strong>(?:接下来关注什么|观察点)<\/strong>：([\s\S]*?)<\/li>\s*<li><strong>(?:来源)<\/strong>：([\s\S]*?)<\/li>\s*<\/ul>/g;

function seriesClass(page) {
  const series = String(page.series || '');
  if (series === 'china-weekly') return 'is-china';
  if (series === 'japan-weekly') return 'is-japan';
  return '';
}

hexo.extend.filter.register('after_render:html', function(html, locals) {
  const page = locals?.page;
  const lang = String(page?.lang || '');
  if (!lang.toLowerCase().startsWith('zh')) return html;

  const cls = seriesClass(page);
  const wrapperClass = cls ? `weekly-event-fields ${cls}` : 'weekly-event-fields';

  return html.replace(EVENT_FIELDS_PATTERN, (match, fact, judgment, watch, source) => {
    return [
      `<div class="${wrapperClass}">`,
      `  <div class="weekly-event-fact"><span class="weekly-event-tag">事实</span><p>${fact}</p></div>`,
      `  <div class="weekly-event-judgment"><span class="weekly-event-tag">研判</span><p>${judgment}</p></div>`,
      `  <div class="weekly-event-watch"><span class="weekly-event-tag">观察点</span><p>${watch}</p></div>`,
      `  <p class="weekly-event-source">来源：${source}</p>`,
      `</div>`
    ].join('\n');
  });
});
