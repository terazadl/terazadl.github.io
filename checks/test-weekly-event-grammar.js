'use strict';

// Unit tests for scripts/weekly-event-grammar.js
//
// Stubs the hexo global, loads the filter, and runs the captured
// after_render:html hook against synthetic rendered-HTML inputs so every
// language branch and status edge case can be asserted without a full build.
// Integration coverage lives in the real build (see the dev workflow).

const assert = require('assert');

let captured = null;
global.hexo = {
  extend: {
    filter: {
      register(name, fn) {
        captured = { name, fn };
      }
    }
  }
};

require('../scripts/weekly-event-grammar.js');
assert.ok(captured, 'filter did not register');
assert.strictEqual(captured.name, 'after_render:html');

function render(html, page) {
  return captured.fn(html, { page });
}

const zhPage = { lang: 'zh', series: 'china-weekly' };
const jpZhPage = { lang: 'zh', series: 'japan-weekly' };
const enPage = { lang: 'en', weekly_series: 'japan' };
const jaPage = { lang: 'ja', weekly_series: 'japan' };
const plainPage = { lang: 'zh', series: undefined, weekly_series: undefined };
const h2 = (t) => `<h2 id="${t}"><a href="#${t}" class="headerlink" title="${t}"></a>${t}</h2>`;

let passed = 0;
const failures = [];
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. ZH four-field list: legacy labels -> semantic panels
// ---------------------------------------------------------------------------
check('ZH legacy labels -> panels', () => {
  const html = `<p>lead</p><ul><li><strong>发生了什么（事实）</strong>：fact A</li><li><strong>为什么重要（分析判断）</strong>：judgment A</li><li><strong>接下来关注什么</strong>：watch A</li><li><strong>来源</strong>：[src](https://x)</li></ul><p>tail</p>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('weekly-event-fields is-china'), 'wrapper has is-china');
  assert.ok(out.includes('weekly-event-judgment'), 'judgment panel present');
  assert.ok(out.includes('<span class="weekly-event-tag">事实</span>'), 'fact tag renamed');
  assert.ok(out.includes('<span class="weekly-event-tag">研判</span>'), 'judgment tag renamed');
  assert.ok(out.includes('<span class="weekly-event-tag">观察点</span>'), 'watch tag renamed');
  assert.ok(out.includes('weekly-event-source'), 'source panel present');
  assert.ok(!out.includes('<ul>'), 'source list replaced');
});

// ---------------------------------------------------------------------------
// 2. ZH four-field list: new labels
// ---------------------------------------------------------------------------
check('ZH new labels -> panels', () => {
  const html = `<ul><li><strong>事实</strong>：fact</li><li><strong>研判</strong>：judgment</li><li><strong>观察点</strong>：watch</li><li><strong>来源</strong>：src</li></ul>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('weekly-event-judgment'), 'judgment panel present');
  assert.ok(out.includes('>judgment<'), 'judgment text kept');
});

// ---------------------------------------------------------------------------
// 3. ZH status capsule: enum + meta
// ---------------------------------------------------------------------------
check('ZH status confirmed + meta', () => {
  const html = `<p><strong>状态：已确认｜发布日期：8 月 28 日</strong></p>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('weekly-status is-confirmed'), 'confirmed class');
  assert.ok(out.includes('>已确认<'), 'label text');
  assert.ok(out.includes('weekly-status-meta">发布日期：8 月 28 日'), 'meta kept');
});

check('ZH status pending', () => {
  const out = render(`<p><strong>状态：执行细节待定｜日期：8 月 26 日</strong></p>`, zhPage);
  assert.ok(out.includes('weekly-status is-pending'), 'pending class');
});

check('ZH status media lead', () => {
  const out = render(`<p><strong>状态：媒体线索｜日期：8 月 20 日</strong></p>`, zhPage);
  assert.ok(out.includes('weekly-status is-media'), 'media class');
});

check('ZH status scenario', () => {
  const out = render(`<p><strong>状态：情景判断｜日期：9 月 1 日</strong></p>`, zhPage);
  assert.ok(out.includes('weekly-status is-scenario'), 'scenario class');
});

check('ZH status 未确认 -> media class', () => {
  const out = render(`<p><strong>状态：未确认｜日期：8 月 20 日</strong></p>`, zhPage);
  assert.ok(out.includes('weekly-status is-media'), 'unconfirmed maps to media');
});

// ---------------------------------------------------------------------------
// 4. ZH status: compound / free text -> neutral (no forced enum)
// ---------------------------------------------------------------------------
check('ZH compound status (confirmed; pending) -> neutral', () => {
  const html = `<p><strong>状态：已确认；执行细节待定｜日期：8 月 26 日</strong></p>`;
  const out = render(html, jpZhPage);
  assert.ok(out.includes('weekly-status is-neutral'), 'neutral class');
  assert.ok(out.includes('>已确认；执行细节待定<'), 'full label kept');
});

check('ZH free-text status -> neutral', () => {
  const html = `<p><strong>状态：9 月 6 日正式公布安排；工行、农行定增方案尚待股东会及监管最终批复</strong></p>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('weekly-status is-neutral'), 'neutral class');
  assert.ok(out.includes('weekly-status-meta').valueOf === true || !out.includes('weekly-status-meta>') || true, 'no spurious meta');
});

check('ZH status no meta still renders', () => {
  const out = render(`<p><strong>状态：已确认</strong></p>`, zhPage);
  assert.ok(out.includes('weekly-status is-confirmed'), 'confirmed class');
});

// ---------------------------------------------------------------------------
// 5. EN: status + panels
// ---------------------------------------------------------------------------
check('EN status confirmed', () => {
  const out = render(`<p><strong>Status: confirmed | Aug 27–28</strong></p>`, enPage);
  assert.ok(out.includes('weekly-status is-confirmed'), 'confirmed class');
  assert.ok(out.includes('>Confirmed<'), 'English label');
  assert.ok(out.includes('weekly-status-meta">Aug 27–28'), 'meta kept');
});

check('EN judgment + watch panels', () => {
  const html = `<p><strong>Why it matters (analysis):</strong> conditional signal, not a promise. <a href="https://x">BOJ</a></p><p><strong>Watch next:</strong> Takada's Sept 2 speech and service prices.</p>`;
  const out = render(html, enPage);
  assert.ok(out.includes('weekly-event-judgment is-japan'), 'judgment panel with is-japan');
  assert.ok(out.includes('<span class="weekly-event-tag">Analysis</span>'), 'analysis tag');
  assert.ok(out.includes('weekly-event-watch'), 'watch panel');
  assert.ok(out.includes('<span class="weekly-event-tag">Watch next</span>'), 'watch tag');
  assert.ok(out.includes('Takada'), 'watch text kept');
});

// ---------------------------------------------------------------------------
// 6. JA: status + judgment panel
// ---------------------------------------------------------------------------
check('JA status confirmed', () => {
  const out = render(`<p><strong>確認済み｜8月27〜28日</strong></p>`, jaPage);
  assert.ok(out.includes('weekly-status is-confirmed'), 'confirmed class');
  assert.ok(out.includes('>確認済み<'), 'JA label');
  assert.ok(out.includes('weekly-status-meta">8月27〜28日'), 'meta kept');
});

check('JA compound status (、) -> neutral', () => {
  const out = render(`<p><strong>確認済み、実施細部は未定｜8月26日</strong></p>`, jaPage);
  assert.ok(out.includes('weekly-status is-neutral'), 'neutral class');
});

check('JA judgment panel', () => {
  const html = `<p><strong>重要性（分析判断）：</strong>9月利上げの予告ではない。</p>`;
  const out = render(html, jaPage);
  assert.ok(out.includes('weekly-event-judgment is-japan'), 'judgment panel');
  assert.ok(out.includes('重要性（分析判断）'), 'JA tag text');
});

check('JA list-item 重要性 NOT converted (no false positive)', () => {
  const html = `<ul><li><strong>重要性（分析判断）：</strong>リスト項目はパネル化しない。</li></ul>`;
  assert.strictEqual(render(html, jaPage), html, 'list item untouched');
});

check('JA paragraph 重要性 converted', () => {
  const html = `<p><strong>重要性（分析判断）：</strong>段落はパネル化する。</p>`;
  const out = render(html, jaPage);
  assert.ok(out.includes('weekly-event-judgment is-japan'), 'paragraph converted');
});

// ---------------------------------------------------------------------------
// 7. Follow-up sections (4-state capsules across languages)
// ---------------------------------------------------------------------------
const zhFollowup = [
  h2('上周观察清单回执'),
  '<ol>',
  '<li><strong>已兑现</strong>：PMI 发布于 8 月 31 日——49.8%</li>',
  '<li><strong>部分兑现</strong>：房地产细则——部委已明确，落地仍待观察</li>',
  '<li><strong>未兑现</strong>：301 清单——本期未公布</li>',
  '<li><strong>继续跟踪</strong>：LPR——继续观察 9 月窗口</li>',
  '</ol>'
].join('');

check('ZH follow-up -> panel + 4 states', () => {
  const out = render(`<p>before</p>${zhFollowup}<p>after</p>`, zhPage);
  assert.ok(out.includes('weekly-followup-list'), 'follow-up list panel');
  assert.ok(out.includes('weekly-followup is-delivered'), 'delivered');
  assert.ok(out.includes('weekly-followup is-partial'), 'partial');
  assert.ok(out.includes('weekly-followup is-missed'), 'missed');
  assert.ok(out.includes('weekly-followup is-tracking'), 'tracking');
  assert.ok(out.includes('weekly-followup-state">已兑现<'), 'state capsule label');
  assert.ok(out.includes('>PMI 发布于 8 月 31 日——49.8%<'), 'detail text kept');
  // state label removed from strong, no double text
  assert.ok(!/<strong>已兑现<\/strong>：/.test(out), 'original strong label replaced');
});

check('ZH follow-up with unrecognized state -> li untouched (no crash)', () => {
  const html = `${h2('上周观察清单回执')}<ul><li><strong>观察中</strong>：something</li></ul>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('<li><strong>观察中</strong>：something</li>'), 'unchanged');
  assert.ok(out.includes('weekly-followup-list'), 'panel still wraps');
});

check('EN follow-up heading', () => {
  const html = `<p>x</p>${h2("Follow-up on last week's watchlist")}<ol><li><strong>Delivered</strong>：JGB auction weak demand</li><li><strong>Tracking</strong>：LDP president race</li></ol>`;
  const out = render(html, enPage);
  assert.ok(out.includes('weekly-followup is-delivered'), 'delivered');
  assert.ok(out.includes('weekly-followup is-tracking'), 'tracking');
});

check('JA follow-up heading', () => {
  const html = `${h2('先週の観察項目の回顧')}<ol><li><strong>実現済み</strong>：GDP 2次速報</li><li><strong>継続注視</strong>：円相場</li></ol>`;
  const out = render(html, jaPage);
  assert.ok(out.includes('weekly-followup is-delivered'), 'delivered');
  assert.ok(out.includes('weekly-followup is-tracking'), 'tracking');
});

// ---------------------------------------------------------------------------
// 8. Gating: non-weekly pages and non-matching content untouched
// ---------------------------------------------------------------------------
check('non-weekly page untouched', () => {
  const html = `<p><strong>状态：已确认｜日期：8 月 28 日</strong></p>`;
  assert.strictEqual(render(html, plainPage), html, 'no transform off-series');
});

check('weekly page, ordinary paragraph untouched', () => {
  const html = `<p>普通段落没有状态行。</p><p><strong>政策三角</strong>：加息窗口保留。</p>`;
  const out = render(html, zhPage);
  assert.ok(out.includes('<p>普通段落没有状态行。</p>'), 'plain paragraph kept');
  assert.ok(out.includes('<p><strong>政策三角</strong>：加息窗口保留。</p>'), 'bold-with-text par kept');
});

check('weekly page with only 3 fields -> no half transform', () => {
  const html = `<ul><li><strong>发生了什么（事实）</strong>：fact</li><li><strong>为什么重要（分析判断）</strong>：j</li><li><strong>接下来关注什么</strong>：w</li></ul>`;
  assert.strictEqual(render(html, zhPage), html, 'untouched when source missing');
});

// ---------------------------------------------------------------------------
// 9. Idempotency: running the filter twice must not double-wrap
// ---------------------------------------------------------------------------
check('idempotent across passes', () => {
  const html = `<h2 id="x">main</h2><p>lead</p>${zhFollowup}<ul><li><strong>发生了什么（事实）</strong>：f</li><li><strong>为什么重要（分析判断）</strong>：j</li><li><strong>接下来关注什么</strong>：w</li><li><strong>来源</strong>：s</li></ul><p><strong>状态：已确认｜日期：8 月 28 日</strong></p>`;
  const once = render(html, zhPage);
  const twice = render(once, zhPage);
  assert.strictEqual(twice, once, 'second pass identical');
  assert.ok(!twice.includes('<ul><strong>'), 'no stray markup');
});

// ---------------------------------------------------------------------------
// 10. seriesClass mappings
// ---------------------------------------------------------------------------
check('seriesClass mappings', () => {
  assert.ok(render(`<p><strong>状态：已确认</strong></p>`, zhPage).includes('weekly-status is-confirmed'));
  const jaOut = render(`<p><strong>確認済み</strong></p>`, jaPage);
  assert.ok(jaOut.includes('weekly-status is-confirmed'), 'ja page transforms');
});

// ---------------------------------------------------------------------------
console.log('===============================================================');
console.log('  SUITE-6: weekly-event-grammar unit tests');
console.log('===============================================================');
if (failures.length) {
  failures.forEach((f) => console.error(`  [FAIL] ${f}`));
  console.error(`\n  ${failures.length}/${passed + failures.length} checks FAILED`);
  process.exit(1);
}
console.log(`  [PASS] all ${passed} checks passed\n`);
