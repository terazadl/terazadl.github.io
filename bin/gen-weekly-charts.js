#!/usr/bin/env node
'use strict';

// Generates ready-to-embed ECharts chart HTML for a weekly issue from its
// radar JSON files. Emits one radar spider chart and one value-vs-prev bar
// chart per country into weeks/YYYY-MM-DD/visual/.
//
// Usage: node scripts/gen-weekly-charts.js weeks/YYYY-MM-DD
//
// The output uses the .weekly-chart component (see source/_data/styles.styl)
// and is rendered client-side by source/js/weekly-charts.js, which lazily
// loads ECharts. The static fallback table inside each container keeps the
// data readable without JavaScript.

const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/gen-weekly-charts.js <weeks/YYYY-MM-DD>');
  process.exit(1);
}

const COUNTRIES = {
  CN: { file: 'radar-china.json', name: '中国', color: '#b35922' },
  JP: { file: 'radar-japan.json', name: '日本', color: '#3a5a6b' }
};

function readRadar(country) {
  const file = path.join(dir, COUNTRIES[country].file);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function defaultMax(value) {
  const v = Math.abs(value);
  if (v <= 2) return 4;
  if (v <= 10) return Math.ceil(v * 1.5);
  return Math.ceil(v * 1.2);
}

function chartBlock(country, radar, type) {
  const { name, color } = COUNTRIES[country];
  const indicators = radar.indicators.map(d => ({
    label: d.label,
    value: d.value,
    prev: d.prev,
    unit: d.unit || '',
    max: d.max || defaultMax(d.value),
    min: d.min || 0
  }));

  const title = type === 'radar'
    ? `${name} · 数据雷达`
    : `${name} · 本期 vs 前值`;

  const data = { title, color, indicators };

  const rows = indicators
    .map(d => `<tr><td>${d.label}</td><td><strong>${d.value}${d.unit}</strong></td><td>${d.prev}${d.unit}</td></tr>`)
    .join('');

  return [
    `<div class="weekly-chart" data-chart="${type}" data-series='${JSON.stringify(data)}'>`,
    `  <div class="weekly-chart-head"><h4>${title}</h4><span>${country}</span></div>`,
    '  <div class="weekly-chart-fallback">',
    '    <table><thead><tr><th>指标</th><th>本期</th><th>前值</th></tr></thead>',
    `    <tbody>${rows}</tbody></table>`,
    '  </div>',
    '</div>'
  ].join('\n');
}

const outDir = path.join(dir, 'visual');
fs.mkdirSync(outDir, { recursive: true });

for (const country of Object.keys(COUNTRIES)) {
  const radar = readRadar(country);
  if (!radar) continue;

  const blocks = [
    chartBlock(country, radar, 'radar'),
    chartBlock(country, radar, 'bar')
  ].join('\n\n');

  const file = path.join(outDir, `charts-${country.toLowerCase()}.html`);
  fs.writeFileSync(file, blocks + '\n');
  console.log(`✓ ${file}`);
}
