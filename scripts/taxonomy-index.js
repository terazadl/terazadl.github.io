'use strict';

// Generate the taxonomy landing pages in the parent repository. This keeps
// the custom markup independent of local edits inside the NexT submodule.
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function relativePath(value) {
  return `/${String(value || '').replace(/^\/+/, '')}`;
}

function categoryList(categories) {
  const items = categories
    .filter(category => category.length)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(category => [
      '<li>',
      `<a href="${relativePath(category.path)}">${escapeHtml(category.name)}</a>`,
      `<span class="research-taxonomy-count">${category.length}</span>`,
      '</li>'
    ].join(''))
    .join('');

  return `<ul>${items}</ul>`;
}

function tagList(tags) {
  return tags
    .filter(tag => tag.length)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(tag => `<a href="${relativePath(tag.path)}">${escapeHtml(tag.name)} <span class="research-taxonomy-count">${tag.length}</span></a>`)
    .join('');
}

// Thematic grouping for the tag index. Canonical tag names match the merged
// front-matter taxonomy; anything not listed falls back to the "其他" group.
const TAG_GROUPS = [
  { title: '宏观与政策', tags: ['政治经济', '货币政策', '财政政策', '产业政策', '商业周期', '内需', '工业利润', '2026年经济'] },
  { title: '金融与市场', tags: ['银行', '房地产', '恒大', '比特币', '数字黄金', '黄金'] },
  { title: '日本研究', tags: ['日本', '日本制造业', '日本银行', '日元', '国债', '通胀', '人口减少'] },
  { title: 'AI 与技术', tags: ['AI', 'AI 政策', '开放权重', '中国科技', 'automation', 'Python', 'product design'] },
  { title: '预测市场与数据实验', tags: ['Polymarket', 'prediction markets', 'quantitative research'] },
  { title: '中国观察', tags: ['中国', '中国现代小说', '区域经济', '人口流动', '四川'] },
  { title: '书与思想', tags: ['经济学', '王小波', '索尼', '企业经营', '商业模式'] }
];

function groupedTagSections(localsTags) {
  const byName = new Map(localsTags.map(tag => [String(tag.name), tag]));
  const consumed = new Set();
  const sections = [];

  for (const group of TAG_GROUPS) {
    const members = group.tags
      .map(name => byName.get(name))
      .filter(tag => tag && tag.length);
    if (!members.length) continue;
    members.forEach(tag => consumed.add(String(tag.name)));
    sections.push(
      [
        `<div class="research-taxonomy-group">`,
        `<h2 class="research-taxonomy-group-title">${escapeHtml(group.title)}</h2>`,
        `<div class="research-taxonomy-cloud">${tagList(members)}</div>`,
        `</div>`
      ].join('')
    );
  }

  const rest = localsTags.filter(tag => tag.length && !consumed.has(String(tag.name)));
  if (rest.length) {
    sections.push(
      [
        `<div class="research-taxonomy-group">`,
        `<h2 class="research-taxonomy-group-title">其他</h2>`,
        `<div class="research-taxonomy-cloud">${tagList(rest)}</div>`,
        `</div>`
      ].join('')
    );
  }

  return sections.join('');
}

function pageData(title, description, content) {
  return {
    title,
    description,
    header: false,
    comments: false,
    toc: false,
    content
  };
}

hexo.extend.generator.register('taxonomy-index', function(locals) {
  const categories = locals.categories.toArray();
  const tags = locals.tags.toArray();

  return [
    {
      path: 'categories/index.html',
      layout: 'page',
      data: pageData(
        '分类',
        'Lei Deng 研究博客的文章分类，按研究方向浏览内容。',
        [
          '<div class="research-taxonomy-page">',
          '<p class="research-eyebrow">TOPICS · CATEGORIES</p>',
          '<h1>分类</h1>',
          `<p class="research-taxonomy-intro">按研究方向浏览文章。当前共有 ${categories.length} 个分类。</p>`,
          `<div class="research-taxonomy-list">${categoryList(categories)}</div>`,
          '<p class="research-taxonomy-switch"><a href="/tags/">改按标签浏览 →</a></p>',
          '</div>'
        ].join('')
      )
    },
    {
      path: 'tags/index.html',
      layout: 'page',
      data: pageData(
        '标签',
        'Lei Deng 研究博客的全部标签，按主题浏览文章。',
        [
          '<div class="research-taxonomy-page">',
          '<p class="research-eyebrow">TOPICS · TAGS</p>',
          '<h1>标签</h1>',
          `<p class="research-taxonomy-intro">按更具体的主题浏览文章。当前共有 ${tags.length} 个标签，按主题分组如下。</p>`,
          groupedTagSections(tags),
          '<p class="research-taxonomy-switch"><a href="/categories/">改按分类浏览 →</a></p>',
          '</div>'
        ].join('')
      )
    }
  ];
});
