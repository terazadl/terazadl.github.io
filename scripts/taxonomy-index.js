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
          `<p class="research-taxonomy-intro">按更具体的主题浏览文章。当前共有 ${tags.length} 个标签。</p>`,
          `<div class="research-taxonomy-cloud">${tagList(tags)}</div>`,
          '<p class="research-taxonomy-switch"><a href="/categories/">改按分类浏览 →</a></p>',
          '</div>'
        ].join('')
      )
    }
  ];
});
