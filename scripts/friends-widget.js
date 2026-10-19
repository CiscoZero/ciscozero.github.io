'use strict';

/* 友链（Friends）侧边栏模块
 * 通过 after_render:html 过滤器在构建后把友链卡片注入侧边栏 </aside> 前。
 * 不修改主题子模块，避免子模块本地提交导致 GitHub Actions 构建失败。
 * 数据源：主仓库 _config.yml -> theme_config.friends
 */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

hexo.extend.filter.register('after_render:html', function (str) {
  const cfg = (hexo.config && hexo.config.theme_config && hexo.config.theme_config.friends) || null;
  if (!cfg || !cfg.enable || !Array.isArray(cfg.list) || cfg.list.length === 0) {
    return str;
  }
  if (!str.includes('</aside>')) {
    return str;
  }

  const items = cfg.list
    .filter(function (f) { return f && f.name && f.link; })
    .map(function (f) {
      return '<a href="' + esc(f.link) + '" class="friend-link" target="_blank" rel="noopener">' + esc(f.name) + '</a>';
    })
    .join('');

  const html =
    '<div class="widget card friend-widget">' +
      '<div class="friend-header">' + esc(cfg.title || 'Friends') + '</div>' +
      '<div class="friend-list">' + items + '</div>' +
    '</div>' +
    '<style>' +
    '.friend-widget{border-radius:3px;padding:10px;}' +
    '.friend-widget .friend-header{font-size:20px;padding:0 0 10px;text-shadow:0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main);}' +
    '.friend-widget .friend-list{background:var(--white-main);box-shadow:0 0 0 .5px var(--black-main),0 0 0 1.5px var(--white-main);padding:10px;display:flex;flex-direction:column;gap:6px;}' +
    '.friend-widget .friend-link{width:100%;color:var(--primary-color);text-decoration:none;border-bottom:1px solid transparent;padding:2px 0;transition:.2s;}' +
    '.friend-widget .friend-link:hover{border-bottom-color:var(--primary-color);}' +
    '</style>';

  return str.replace('</aside>', html + '</aside>');
});
