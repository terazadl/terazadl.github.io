'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderParagraphs(text) {
  if (!text) return '';
  const lines = String(text).trim().split(/\n\s*\n/);
  return lines.map(line => `<p>${escapeHtml(line).replace(/\n/g, '<br>')}</p>`).join('\n        ');
}

function generateNoteCard(note) {
  const category = note.category || 'observation';
  const badge = note.badge || (category === 'reading' ? '读书思考' : '日常观察');
  const badgeClass = category === 'reading' ? 'life-stream-badge is-reading' : 'life-stream-badge';
  const location = note.location ? `<span class="life-stream-location"><i class="fa fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(note.location)}</span>` : '';
  const date = note.date || '';

  let mediaHtml = '';
  if (note.image) {
    mediaHtml = `
        <div class="life-stream-media">
          <img src="${escapeHtml(note.image)}" alt="手记附图" loading="lazy">
        </div>`;
  }

  let articleHtml = '';
  if (note.article) {
    const art = note.article;
    const artIcon = category === 'reading' ? 'fa fa-book-open' : 'fa fa-file-alt';
    const artType = art.type || (category === 'reading' ? '书评' : '观察长文');
    const artTime = art.time ? ` · ${escapeHtml(art.time)}` : '';
    articleHtml = `
        <a href="${escapeHtml(art.url)}" class="life-stream-article-embed">
          <div class="life-stream-article-embed-head">
            <h3 class="life-stream-article-embed-title">${escapeHtml(art.title)}</h3>
          </div>
          ${art.desc ? `<p class="life-stream-article-embed-desc">${escapeHtml(art.desc)}</p>` : ''}
          <div class="life-stream-article-embed-foot">
            <span class="life-stream-reading-capsule"><i class="${artIcon}" aria-hidden="true"></i> ${escapeHtml(artType)}${artTime}</span>
            <span class="life-stream-read-action">阅读全文 <i class="fa fa-arrow-right" aria-hidden="true"></i></span>
          </div>
        </a>`;
  }

  const tags = Array.isArray(note.tags) ? note.tags : [];
  const tagsHtml = tags.map(tag => `<span class="life-stream-tag">#${escapeHtml(tag)}</span>`).join('\n          ');

  return `
    <!-- 手记卡片: ${escapeHtml(note.id || date)} -->
    <article class="life-stream-card" data-category="${escapeHtml(category)}">
      <header class="life-stream-header">
        <div class="life-stream-author-info">
          <div class="life-stream-avatar" aria-hidden="true">LD</div>
          <div class="life-stream-meta">
            <span class="life-stream-author-name">Lei Deng</span>
            <div class="life-stream-submeta">
              <time datetime="${escapeHtml(date)}">${escapeHtml(date)}</time>
              ${location ? `<span aria-hidden="true">·</span>\n              ${location}` : ''}
            </div>
          </div>
        </div>
        <span class="${badgeClass}">${escapeHtml(badge)}</span>
      </header>

      <div class="life-stream-body">
        ${renderParagraphs(note.text)}${mediaHtml}${articleHtml}
      </div>

      ${tags.length > 0 ? `
      <footer class="life-stream-footer">
        <div class="life-stream-tags">
          ${tagsHtml}
        </div>
      </footer>` : ''}
    </article>`;
}

hexo.extend.filter.register('after_render:html', function(html, locals) {
  const pagePath = String(locals?.path || locals?.page?.path || '').replace(/^\/+/, '');
  if (!pagePath.startsWith('life/index.html') && !pagePath.startsWith('life/')) {
    return html;
  }

  const dataPath = path.join(hexo.source_dir, '_data', 'notes.yml');
  if (!fs.existsSync(dataPath)) return html;

  try {
    const rawYaml = fs.readFileSync(dataPath, 'utf8');
    const notes = yaml.load(rawYaml) || [];

    const cardsHtml = notes.map(generateNoteCard).join('\n');
    const totalCount = notes.length;

    // Replace the stream container contents
    html = html.replace(
      /(<div class="life-stream-container" id="life-stream">)[\s\S]*?(<\/div>\s*<\/div>\s*<script>)/,
      (match, containerOpen) => `${containerOpen}\n${cardsHtml}\n  </div>\n</div>\n<script>`
    );

    // Update count in chips
    html = html.replace(
      /<span class="life-chip-count" id="chip-count">\d*<\/span>/,
      `<span class="life-chip-count" id="chip-count">${totalCount}</span>`
    );
  } catch (err) {
    hexo.log.error('life-stream generator error:', err);
  }

  return html;
});
