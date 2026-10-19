'use strict';

/* 文章字数 + 大致阅读时间
 * 通过 after_render:html 过滤器在构建后为文章页注入统计信息：
 *   - 字数：中文按字计数，英文/数字按词计数，显示在正文上方
 *   - 阅读时间：按配置的阅读速度（默认 300 字/分钟）估算，向上取整，最少 1 分钟
 * 配置从 hexo.config.theme_config.reading_stats 读取：
 *   reading_stats:
 *     enable: true
 *     speed: 300
 * 不修改主题子模块，避免 Actions 构建失败。
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str || !data) return str;
  const page = data.page || {};
  if (page.layout !== 'post') return str;

  // 读取配置（从 theme_config 注入）
  const cfg = (data.config && data.config.theme_config && data.config.theme_config.reading_stats) || {};
  if (cfg.enable === false) return str;
  const speed = Number(cfg.speed) > 0 ? Number(cfg.speed) : 300;

  // 获取文章正文 HTML：优先 page.content（已渲染正文），不可用则从整页提取
  let contentHtml = '';
  if (typeof page.content === 'string' && page.content) {
    contentHtml = page.content;
  } else {
    const m = str.match(/<div class="post-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    if (m) contentHtml = m[1];
  }
  if (!contentHtml) return str;

  // 剥掉脚本/样式/标签，得到纯文本
  const text = contentHtml
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  // 中文按字、英文/数字按词
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const en = (text.match(/[A-Za-z0-9]+/g) || []).length;
  const total = cn + en;
  const minutes = Math.max(1, Math.ceil(total / speed));

  const statsHtml =
    '<div class="post-meta post-stats">' +
    '字数 ' + total + '（中文 ' + cn + ' · 英文 ' + en + '） · 阅读约 ' + minutes + ' 分钟' +
    '</div>';

  // 注入到正文上方，复用主题 .post-meta 样式
  return str.replace('<div class="post-content">', '<div class="post-content">\n    ' + statsHtml);
});
