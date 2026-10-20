'use strict';

/* Tags 标签页（模仿 sh1nn.top：/tags/<标签名>/ 复用归档结构）
 * 1) 移除 Hexo 内置 tag 生成器（主题无 tag.ejs，内置生成器会因缺模板/缺 posts 失败或产出错误页面）；
 * 2) 注册自定义 generator 生成 /tags/<标签名>/ 页面，复用主题归档模板 archive.ejs，
 *    传入该标签下的文章列表；
 * 3) after_render:html 过滤：标签页 .year-header 由年份替换为当前标签名。
 * 访问 /tags/ 不生成独立汇总页（与 sh1nn.top 行为一致）。
 * 不修改主题子模块。
 */

(function () {
  // 注册同名 'tag' generator 覆盖 Hexo 内置 tag 生成器
  // （内置生成器输出 layout='tag'，主题无 tag.ejs 模板会渲染失败）
  hexo.extend.generator.register('tag', function (locals) {
    const result = [];
    const perPage = Number(hexo.config.per_page) || 10;
    locals.tags.forEach(function (tag) {
      if (!tag.posts || !tag.posts.length) return;
      result.push({
        path: tag.path, // tags/<标签名>/
        layout: ['archive', 'index', 'page'],
        data: {
          tag: tag,
          posts: tag.posts.sort('-date'),
          title: tag.name,
          __tag_page: true,
          // 归档模板依赖分页字段，单页标签也需补齐
          base: tag.path,
          path: tag.path,
          total: 1,
          current: 1,
          prev: 0,
          next: 0,
          per_page: perPage
        }
      });
    });
    return result;
  });

  // 标签页：year-header 显示当前标签名
  hexo.extend.filter.register('after_render:html', function (str, data) {
    if (!str || !data) return str;
    const page = data.page || {};
    if (!page.__tag_page) return str;
    const name = (page.tag && page.tag.name) ? page.tag.name : '';
    if (!name) return str;
    return str.replace(/<div class="year-header">\s*\d{4}\s*<\/div>/g, '<div class="year-header">' + name + '</div>');
  });
})();
