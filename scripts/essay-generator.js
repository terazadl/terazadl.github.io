'use strict';

const pagination = require('hexo-pagination');

hexo.extend.generator.register('essays', function(locals) {
  const posts = locals.posts
    .filter(post => {
      const categories = post.categories?.toArray?.() || [];
      return !categories.some(category => category.name === 'Notes');
    })
    .sort('-date');

  return pagination('essays', posts, {
    perPage: this.config.per_page,
    layout: ['index', 'archive'],
    format: 'page/%d/',
    data: {
      __index: true,
      title: 'Essays'
    }
  });
});
