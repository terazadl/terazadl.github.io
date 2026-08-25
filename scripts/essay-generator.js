'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('essays', function(locals) {
  const posts = locals.posts
    .filter(post => {
      const categories = post.categories?.toArray?.() || [];
      return !categories.some(category => category.name === 'Notes');
    })
    .sort('-date')
    .toArray();

  const groupedPosts = new Map();

  posts.forEach(post => {
    const groupKey = post.translation_key || post.path;
    if (!groupedPosts.has(groupKey)) groupedPosts.set(groupKey, []);
    groupedPosts.get(groupKey).push(post);
  });

  const preferredPosts = Array.from(groupedPosts.values()).map(group => {
    return group.find(post => String(post.lang || '').toLowerCase().startsWith('en'))
      || group.find(post => String(post.lang || '').toLowerCase().startsWith('zh'))
      || group[0];
  });
  const preferredPaths = new Set(preferredPosts.map(post => post.path));
  const essayPosts = locals.posts
    .filter(post => preferredPaths.has(post.path))
    .sort('-date');

  return pagination('essays', essayPosts, {
    perPage: 50,
    layout: ['index', 'archive'],
    format: 'page/%d/',
    data: {
      __index: true,
      title: 'Essays'
    }
  });
});
