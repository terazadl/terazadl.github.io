'use strict';

// Weekly event grammar: status capsules, the core-event four-field visual
// grammar (fact / judgment / watch / source), and the follow-up section that
// answers the previous issue's watchlist.
//
// Pure render-time transformation: drafts stay plain markdown, the semantic
// classes are produced here so already-published posts and future drafts
// render identically. Chinese full-text editions (lang: zh) use the explicit
// four-field list; EN / JA editions use their own paragraph labels
// (Status / Why it matters (analysis) / Watch next, 確認済み /
// 重要性（分析判断）). Content rules (section placement, state vocabulary,
// coverage of every prior watchlist item) are enforced by the weekly-editor
// skill, not by this filter.

// ---------------------------------------------------------------------------
// State vocabulary
// ---------------------------------------------------------------------------

// Ordered [regex, className, displayLabel]. Order matters: a token that is a
// substring of a more specific one must come after (e.g. 未兑现 before 兑现).
const STATUS_RULES = {
  zh: [
    [/执行细节待定/, 'is-pending', '执行细节待定'],
    [/情景判断/, 'is-scenario', '情景判断'],
    [/媒体线索/, 'is-media', '媒体线索'],
    [/未确认/, 'is-media', '未确认'],
    [/已确认/, 'is-confirmed', '已确认']
  ],
  en: [
    [/pending/i, 'is-pending', 'Pending details'],
    [/scenario/i, 'is-scenario', 'Scenario'],
    [/media|reported|lead/i, 'is-media', 'Media lead'],
    [/confirmed/i, 'is-confirmed', 'Confirmed']
  ],
  ja: [
    [/未定/, 'is-pending', '実施細部は未定'],
    [/シナリオ/, 'is-scenario', 'シナリオ判断'],
    [/メディア情報|報道|情報/, 'is-media', 'メディア情報'],
    [/確認済み|確認/, 'is-confirmed', '確認済み']
  ]
};

const FOLLOWUP_STATES = {
  zh: [
    [/未兑现|落空/, 'is-missed', '未兑现'],
    [/部分兑现/, 'is-partial', '部分兑现'],
    [/已兑现|兑现/, 'is-delivered', '已兑现'],
    [/继续跟踪|跟进中/, 'is-tracking', '继续跟踪']
  ],
  en: [
    [/missed|not delivered/i, 'is-missed', 'Missed'],
    [/partial/i, 'is-partial', 'Partial'],
    [/delivered/i, 'is-delivered', 'Delivered'],
    [/tracking/i, 'is-tracking', 'Tracking']
  ],
  ja: [
    [/未実現|実現せず/, 'is-missed', '未実現'],
    [/部分的に実現|部分的/, 'is-partial', '部分的に実現'],
    [/実現済み|実現/, 'is-delivered', '実現済み'],
    [/継続注視|追跡/, 'is-tracking', '継続注視']
  ]
};

const FOLLOWUP_HEADING_PATTERN =
  /(?:上周观察清单回执|Follow[- ]?up on last week['’]s watchlist|Last week['’]s watchlist check|先週の観察項目の回顧|先週の振り返り)/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seriesClass(page) {
  const s = String(page.series || page.weekly_series || '');
  if (/china/i.test(s)) return 'is-china';
  if (/japan/i.test(s)) return 'is-japan';
  return '';
}

function langOf(page) {
  return String(page.lang || '').toLowerCase().split('-')[0];
}

// Parse a rendered **status** paragraph into a capsule + trailing metadata.
// Accepts:
//   zh: **状态：已确认｜发布日期：8 月 28 日**
//       **状态：9 月 6 日正式公布安排；…批复**          (free text)
//   en: **Status: confirmed | Aug 27–28**
//   ja: **確認済み｜8月27〜28日**
//       **確認済み、実施細部は未定｜8月26日**
function parseStatus(text, lang) {
  let labelPart = String(text).trim();
  if (lang === 'zh') labelPart = labelPart.replace(/^状态[:：]\s*/, '');
  else if (lang === 'en') labelPart = labelPart.replace(/^Status\s*[:：]\s*/i, '');
  if (!labelPart) return null;

  let meta = '';
  const pipe = labelPart.search(/[｜|]/);
  if (pipe > -1) {
    meta = labelPart.slice(pipe + 1).trim();
    labelPart = labelPart.slice(0, pipe).trim();
  }

  // Free-text or compound statuses (e.g. Kioxia's 企业计划已确认；政府支持金额尚待官方确认)
  // fall through to a neutral capsule rather than being squeezed into one enum state.
  const matchCount = (STATUS_RULES[lang] || STATUS_RULES.zh)
    .filter(([re]) => re.test(labelPart)).length;
  if (matchCount > 1 || labelPart.includes('；') || labelPart.includes(';')) {
    return { cls: 'is-neutral', label: labelPart, meta };
  }

  const rules = STATUS_RULES[lang] || STATUS_RULES.zh;
  for (const [re, cls, label] of rules) {
    if (re.test(labelPart)) {
      return { cls, label, meta };
    }
  }
  return { cls: 'is-neutral', label: labelPart || '状态', meta };
}

function renderStatusStatus({ cls, label, meta }) {
  const capsule = `<span class="weekly-status ${cls}">${label}</span>`;
  const metaHtml = meta ? `<span class="weekly-status-meta">${meta}</span>` : '';
  return `<p class="weekly-event-status">${capsule}${metaHtml}</p>`;
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

// 1) Status capsule for **状态：…** / **Status: …** / **確認済み｜…** lines.
const STATUS_LINE = /<p><strong>([^<\n]{1,240})<\/strong><\/p>/g;

// 2) Chinese four-field event list:
//    <ul><li><strong>发生了什么（事实）</strong>：…</li> … </ul>
const ZH_FIELD_LIST =
  /<ul>\s*<li><strong>(?:发生了什么（事实）|事实|发生了什么)<\/strong>[：:]\s*([\s\S]*?)<\/li>\s*<li><strong>(?:为什么重要（分析判断）|研判|为什么重要)<\/strong>[：:]\s*([\s\S]*?)<\/li>\s*<li><strong>(?:接下来关注什么|观察点|关注什么)<\/strong>[：:]\s*([\s\S]*?)<\/li>\s*<li><strong>来源<\/strong>[：:]\s*([\s\S]*?)<\/li>\s*<\/ul>/g;

// 3) EN / JA inline field paragraphs.
const EN_JUDGMENT = /<p><strong>Why it matters \(analysis\)[:：]<\/strong>\s*([\s\S]*?)<\/p>/g;
const EN_WATCH = /<p><strong>Watch next[:：]<\/strong>\s*([\s\S]*?)<\/p>/g;
const JA_JUDGMENT = /<p><strong>重要性（分析判断）[:：]<\/strong>\s*([\s\S]*?)<\/p>/g;

// 4) Follow-up section: heading + following <ol>/<ul> with state-labelled items.
const FOLLOWUP_SECTION =
  new RegExp(
    `<h2[^>]*>[\\s\\S]*?${FOLLOWUP_HEADING_PATTERN.source}[\\s\\S]*?</h2>\\s*<(?:ol|ul)>[\\s\\S]*?</(?:ol|ul)>`,
    'g'
  );

function renderFollowupItems(block, lang) {
  const rules = FOLLOWUP_STATES[lang] || FOLLOWUP_STATES.zh;
  let out = block.replace(/<li>([\s\S]*?)<\/li>/g, (li, inner) => {
    const stateMatch = inner.match(/<strong>([^<]{1,40})<\/strong>([\s\S]*)$/);
    if (!stateMatch) return li;
    const label = stateMatch[1].trim();
    const rest = stateMatch[2].trim().replace(/^[：:·|｜・\s]+/, '');
    for (const [re, cls, disp] of rules) {
      if (re.test(label)) {
        return `<li class="weekly-followup ${cls}"><span class="weekly-followup-state">${disp}</span><span class="weekly-followup-text">${rest}</span></li>`;
      }
    }
    return li;
  });
  // Panel wrapper on the outer list (ol or ul), whatever the source used.
  out = out.replace(/<(ol|ul)>/, '<$1 class="weekly-followup-list">');
  return out;
}

hexo.extend.filter.register('after_render:html', function (html, locals) {
  const page = locals && locals.page;
  if (!page) return html;

  const lang = langOf(page);
  if (!lang || (lang !== 'zh' && lang !== 'en' && lang !== 'ja')) return html;
  const isWeekly =
    String(page.series || page.weekly_series || '').match(/weekly|china|japan/i);
  if (!isWeekly) return html;

  const cls = seriesClass(page) || '';

  let out = html;

  // Follow-up section first (items carry their own <strong> labels).
  out = out.replace(FOLLOWUP_SECTION, (block) => renderFollowupItems(block, lang));

  if (lang === 'zh') {
    out = out.replace(ZH_FIELD_LIST, (match, fact, judgment, watch, source) => {
      return [
        `<div class="weekly-event-fields${cls ? ' ' + cls : ''}">`,
        `  <div class="weekly-event-fact"><span class="weekly-event-tag">事实</span><p>${fact.trim()}</p></div>`,
        `  <div class="weekly-event-judgment"><span class="weekly-event-tag">研判</span><p>${judgment.trim()}</p></div>`,
        `  <div class="weekly-event-watch"><span class="weekly-event-tag">观察点</span><p>${watch.trim()}</p></div>`,
        `  <p class="weekly-event-source">来源：${source.trim()}</p>`,
        `</div>`
      ].join('\n');
    });
  } else if (lang === 'en') {
    out = out.replace(EN_JUDGMENT, (m, body) =>
      `<div class="weekly-event-judgment${cls ? ' ' + cls : ''}"><span class="weekly-event-tag">Analysis</span><p>${body.trim()}</p></div>`
    );
    out = out.replace(EN_WATCH, (m, body) =>
      `<div class="weekly-event-watch"><span class="weekly-event-tag">Watch next</span><p>${body.trim()}</p></div>`
    );
  } else if (lang === 'ja') {
    out = out.replace(JA_JUDGMENT, (m, body) =>
      `<div class="weekly-event-judgment${cls ? ' ' + cls : ''}"><span class="weekly-event-tag">重要性（分析判断）</span><p>${body.trim()}</p></div>`
    );
  }

  // Status capsules run last across all editions.
  out = out.replace(STATUS_LINE, (m, body) => {
    const info = parseStatus(body, lang);
    return info ? renderStatusStatus(info) : m;
  });

  return out;
});
