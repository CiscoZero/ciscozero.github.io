'use strict';

/* 副标题点击跳转
 * 通过 after_render:html 过滤器将 header 中的副标题（blog-title）包装为指向指定视频的链接。
 * 不修改主题子模块，避免 Actions 构建失败。
 */

const SUBTITLE_LINK = 'https://www.bilibili.com/video/BV1vR4y1H78h/';

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str) return str;
  // 将 <p class="blog-title"> 内部的副标题文本包成可点击链接
  return str.replace(/<p class="blog-title">([\s\S]*?)<\/p>/g, function (match, inner) {
    const text = inner.replace(/^\s+|\s+$/g, '');
    if (!text) return match;
    return '<p class="blog-title"><a href="' + SUBTITLE_LINK + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">' + text + '</a></p>';
  });
});
