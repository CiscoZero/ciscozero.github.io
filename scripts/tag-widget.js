'use strict';

/* 侧边栏 Tags 标签云（模仿 sh1nn.top）
 * 通过 after_render:html 过滤器在构建后向所有页面侧边栏注入 .card.tag-widget：
 *   - 半透明蓝背景、flex-wrap 布局、a.tag-link 纯文字 #标签名、颜色 --primary-color
 * 数据源：Hexo site.tags（由文章 front-matter tags 自动生成，无需手工维护）。
 * 不修改主题子模块，避免子模块本地提交导致 GitHub Actions 构建失败。
 * 配置：_config.yml -> theme_config.tags.enable
 */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str || !data) return str;
  if (!str.includes('</aside>')) return str;

  const cfg = (data.config && data.config.theme_config && data.config.theme_config.tags) || {};
  if (!cfg.enable) return str;

  // 从站点 tag 数据生成标签云（过滤无文章标签）
  // 注意：after_render:html 过滤器运行时 data 为渲染 locals，站点数据在 data.site；
  // hexo.site 在 Hexo 实例上不存在，直接访问会抛 "Cannot read properties of undefined (reading 'tags')"。
  const siteTags = (data.site && data.site.tags) || [];
  const tags = [];
  siteTags.forEach(function (t) {
    if (t.posts && t.posts.length > 0) tags.push(t);
  });
  if (tags.length === 0) return str;
  tags.sort(function (a, b) { return a.name.localeCompare(b.name); });

  const links = tags.map(function (t) {
    return '<a class="tag-link" href="/' + esc(t.path) + '">#' + esc(t.name) + '</a>';
  }).join('');

  const html =
    '<div class="widget card tag-widget">' +
      '<div class="tag-header">Tags</div>' +
      '<div class="tag-list">' + links + '</div>' +
    '</div>' +
    '<style>' +
    '.tag-widget{border-radius:3px;padding:10px;background:rgba(60,127,177,.3);' +
      'box-shadow:inset 0 0 20px rgba(60,127,177,.8),0 0 0 1px var(--white-main),0 0 0 1.5px var(--black-main),3px 3px 10px rgba(0,0,0,.6);}' +
    '.tag-widget .tag-header{font-size:20px;color:var(--black-main);padding:0 0 10px;' +
      'text-shadow:0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main),0 0 10px var(--white-main);}' +
    '.tag-widget .tag-list{display:flex;flex-wrap:wrap;gap:5px 15px;background:var(--white-main);' +
      'box-shadow:0 0 0 .5px var(--black-main),0 0 0 1.5px var(--white-main);padding:10px;}' +
    '.tag-widget .tag-link{color:var(--primary-color);text-decoration:none;font-size:14px;}' +
    '.tag-widget .tag-link:hover{text-decoration:underline;}' +
    '</style>';

  // 插到音乐播放器之后、友链之前（侧边栏顺序：avatar / profile / music / tags / friends）
  const anchor = '<script>\n    var musicConfig';
  if (str.includes(anchor)) {
    return str.replace(anchor, html + '\n' + anchor);
  }
  // 兜底：插到 </aside> 前
  return str.replace('</aside>', html + '</aside>');
});
