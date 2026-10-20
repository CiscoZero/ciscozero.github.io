'use strict';

/* 文章页标签显示（模仿 sh1nn.top）
 * 通过 after_render:html 过滤器在构建后处理文章页：
 *   post.ejs 模板已用 list_tags 输出标签（"| tag1, tag2" 形式，无 # 前缀），
 *   这里将其替换为 .post-tags 内 a.tag 纯文字 #标签名，链接指向 /tags/<标签名>/。
 * 不修改主题子模块。
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
  const page = data.page || {};
  if (page.layout !== 'post') return str;

  const raw = page.tags;
  if (!raw || !raw.length) return str;
  // page.tags 是 Hexo query 对象（非纯数组），Array.from(query) 会产生 undefined 元素；
  // 必须用 toArray() 取真实 Tag 实例数组。
  const tags = Array.isArray(raw) ? raw : (typeof raw.toArray === 'function' ? raw.toArray() : Array.from(raw));
  if (!tags || tags.length === 0) return str;

  const cfg = (data.config && data.config.theme_config && data.config.theme_config.tags) || {};
  if (!cfg.enable) return str;

  const links = tags.map(function (t) {
    return '<a class="tag" href="/' + esc(t.path) + '">#' + esc(t.name) + '</a>';
  }).join('');

  const postTags =
    '<span class="post-tags">' + links + '</span>' +
    '<style>' +
    '.post-meta .post-tags{display:inline;margin-left:10px;}' +
    '.post-tags .tag{color:var(--primary-color);text-decoration:none;margin-left:5px;font-size:16px;}' +
    '.post-tags .tag:hover{text-decoration:underline;}' +
    '</style>';

  // 文章头部 post-meta（不含 reading-stats 注入的 .post-meta.post-stats）
  return str.replace(/<div class="post-meta">([\s\S]*?)<\/div>/, function (m, inner) {
    // 删除模板中 list_tags 已渲染的 "| tag..." 旧标签块
    const cleaned = inner.replace(/\s*\|\s*[\s\S]*/, '');
    return '<div class="post-meta">' + cleaned.trim() + postTags + '</div>';
  });
});
