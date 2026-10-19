'use strict';

/* 标签页标题按板块动态化
 * 通过 after_render:html 过滤器在构建后改写 <title>，使标签页标题随板块变化：
 *   - 首页：Base Area
 *   - 文章页：文章标题 - Base Area
 *   - 归档页：归档 - Base Area
 *   - 其他页面：页面标题 - Base Area（无标题则保持站点名）
 * 不修改主题子模块，避免 Actions 构建失败。
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str || !data) return str;
  const siteTitle = (data.config && data.config.title) || '';

  let title = '';
  const layout = data.page && data.page.layout;
  const pageTitle = data.page && data.page.title;

  if (layout === 'post') {
    // 文章页：优先文章标题，空则取路径最后一段
    title = (pageTitle && pageTitle.trim()) || (data.page.path.split('/').filter(Boolean).pop() || '');
  } else if (String(data.path || '').startsWith('archives/') || String(data.path || '') === 'archives/index.html') {
    title = 'Archives';
  } else if (String(data.path || '').startsWith('tags/')) {
    title = 'Tags';
  } else if (String(data.path || '').startsWith('categories/')) {
    title = 'Categories';
  } else if (String(data.path || '') === 'index.html') {
    title = '';
  } else if (String(data.path || '').startsWith('about/')) {
    title = 'About';
  } else if (layout && layout !== 'layout' && layout !== 'index') {
    // 其他板块页（about 等）：页面标题或板块名
    title = (pageTitle && pageTitle.trim()) || layout;
  } else {
    title = (pageTitle && pageTitle.trim()) || '';
  }

  const newTitle = title ? (title + ' - ' + siteTitle) : siteTitle;

  // 替换 <title> 内容（原文件可能是多行缩进格式）
  return str.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + newTitle + '</title>');
});
