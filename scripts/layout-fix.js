'use strict';

/* 布局间距微调（对齐 sh1nn.top/about/ 参考值，不修改主题子模块）
 * 1) 正文段落行高 line-height: 1.6（主题 markdown.scss 的 .post-content p 缺此行高）
 * 通过 after_render:html 过滤器向 </aside> 前注入覆盖样式。
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str || !data) return str;
  if (!str.includes('</aside>')) return str;

  const html =
    '<style>' +
      '.post-content p{line-height:1.6;}' +
    '</style>';

  return str.replace('</aside>', html + '</aside>');
});
