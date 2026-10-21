'use strict';

/* 侧边栏布局修复（不修改主题子模块）
 * 问题：主题 .music-widget{position:sticky;top:140px}，页面下滑时播放器吸附视口，
 *       后方的 tag-widget 等板块继续上移，穿过播放器造成重叠。
 * 修复：将播放器改为静态定位，随页面正常排列。
 * 通过 after_render:html 过滤器向 </aside> 前注入覆盖样式。
 */

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str || !data) return str;
  if (!str.includes('</aside>')) return str;

  const html =
    '<style>' +
      '.music-widget{position:static !important;top:auto !important;}' +
      '.profile-widget{background:rgba(from var(--primary-color) r g b / 0.5);}' +
      '@supports not (background: rgba(from red r g b / 0.3)){' +
        '.card{background:rgba(60,127,177,.3);}' +
        '.profile-widget{background:rgba(60,127,177,.5);}' +
        '.avatar-bg{background:linear-gradient(to bottom,#e8eef2 0%,#d8e1e7 50%,#c2cbd1 51%,#d8e1e7 100%);}' +
      '}' +
    '</style>';

  return str.replace('</aside>', html + '</aside>');
});
