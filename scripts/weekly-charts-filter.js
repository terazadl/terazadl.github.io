'use strict';

// Injects the weekly ECharts loader script into pages that contain a
// .weekly-chart container. Pages without charts stay untouched, so the tiny
// loader (and its lazy ECharts dependency) is never loaded where it is not
// needed.

hexo.extend.filter.register('after_render:html', function(html) {
  if (!html.includes('weekly-chart')) return html;
  if (html.includes('weekly-charts.js')) return html; // already injected

  const tag = '<script src="/js/weekly-charts.js" defer></script>';
  return html.replace('</body>', `${tag}\n</body>`);
});
