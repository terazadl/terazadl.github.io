/* Weekly brief ECharts loader (progressive enhancement).
 *
 * Scans for .weekly-chart containers. When at least one exists, lazily loads
 * ECharts from a pinned CDN version and renders radar / bar charts from the
 * embedded data-series JSON. The static fallback inside each container stays
 * visible until ECharts is available, so the data is readable without JS.
 *
 * Non-chart pages never load this file's dependencies: the loader itself is
 * tiny, and ECharts (~1MB) is fetched only when a chart container is present.
 */
(function () {
  'use strict';

  var ECHARTS_URL = 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js';

  var charts = document.querySelectorAll('.weekly-chart');
  if (!charts.length) return;

  var rendered = false;

  function renderAll() {
    if (rendered) return;
    rendered = true;
    Array.prototype.forEach.call(charts, render);
  }

  function render(el) {
    var type = el.getAttribute('data-chart');
    var raw = el.getAttribute('data-series');
    if (!type || !raw) return;

    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }

    var fallback = el.querySelector('.weekly-chart-fallback');
    var holder = document.createElement('div');
    holder.className = 'weekly-chart-canvas';
    el.appendChild(holder);

    var chart = echarts.init(holder);
    chart.setOption(buildOption(type, data));
    if (fallback) fallback.style.display = 'none';
    window.addEventListener('resize', function () { chart.resize(); });
  }

  function buildOption(type, data) {
    var ink = '#1d1c18', muted = '#706a60', line = '#a8a092';
    var color = data.color || '#2f55d4';

    if (type === 'radar') {
      return {
        color: [color],
        tooltip: {
          backgroundColor: '#fffdf8', borderColor: line,
          textStyle: { color: ink, fontFamily: 'Lato, sans-serif' }
        },
        radar: {
          indicator: data.indicators.map(function (d) {
            return { name: d.label, max: d.max, min: d.min || 0 };
          }),
          radius: '62%',
          splitNumber: 4,
          axisName: { color: muted, fontSize: 12, fontFamily: 'Lato, sans-serif' },
          splitArea: { areaStyle: { color: ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.02)'] } },
          splitLine: { lineStyle: { color: line } },
          axisLine: { lineStyle: { color: line } }
        },
        series: [{
          type: 'radar',
          data: [{
            value: data.indicators.map(function (d) { return d.value; }),
            name: data.title || ''
          }],
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.18 },
          label: {
            show: true, color: muted, fontSize: 11, fontFamily: 'Lato, sans-serif',
            formatter: function (p) {
              var d = data.indicators[p.dataIndex];
              return d.value + (d.unit || '');
            }
          }
        }]
      };
    }

    if (type === 'bar') {
      return {
        color: [color, '#d5cfc4'],
        tooltip: {
          backgroundColor: '#fffdf8', borderColor: line,
          textStyle: { color: ink, fontFamily: 'Lato, sans-serif' }
        },
        legend: {
          data: ['本期', '前值'], top: 0, right: 0,
          textStyle: { color: muted, fontSize: 12, fontFamily: 'Lato, sans-serif' }
        },
        grid: { left: 8, right: 16, top: 34, bottom: 8, containLabel: true },
        xAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: line } },
          axisLabel: { color: muted, fontSize: 11, fontFamily: 'Lato, sans-serif' },
          splitLine: { lineStyle: { color: 'rgba(168,160,146,0.35)' } }
        },
        yAxis: {
          type: 'category',
          data: data.indicators.map(function (d) { return d.label; }),
          axisLine: { lineStyle: { color: line } },
          axisTick: { show: false },
          axisLabel: { color: ink, fontSize: 12, fontFamily: 'Lato, sans-serif' }
        },
        series: [
          {
            name: '本期', type: 'bar',
            data: data.indicators.map(function (d) { return d.value; }),
            barWidth: 12,
            label: { show: true, position: 'right', color: color, fontSize: 11, fontFamily: 'Lato, sans-serif' }
          },
          {
            name: '前值', type: 'bar',
            data: data.indicators.map(function (d) { return d.prev; }),
            barWidth: 12,
            label: { show: true, position: 'right', color: muted, fontSize: 11, fontFamily: 'Lato, sans-serif' }
          }
        ]
      };
    }

    return {};
  }

  var script = document.createElement('script');
  script.src = ECHARTS_URL;
  script.async = true;
  script.onload = renderAll;
  script.onerror = function () { /* keep the static fallback */ };
  document.head.appendChild(script);
})();
