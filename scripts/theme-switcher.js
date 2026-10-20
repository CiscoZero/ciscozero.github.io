'use strict';

/* 主题切换 + 隐藏 UI（模仿 sh1nn.top）
 * 通过 after_render:html 过滤器在构建后向侧边栏 </aside> 前注入 .theme-buttons 容器
 * （Themes 调色板 / Hide 隐藏两个纯图标按钮）+ 内联 <style> + 前端 <script>。
 * 不修改主题子模块。
 * 配置：_config.yml -> theme_config.theme_switcher
 *   enable: true
 *   themes: [{primary, highlight, secondary, background}, ...]
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
  const cfg =
    (data && data.config && data.config.theme_config && data.config.theme_config.theme_switcher) ||
    (hexo.config && hexo.config.theme_config && hexo.config.theme_config.theme_switcher);
  if (!cfg || !cfg.enable || !Array.isArray(cfg.themes) || cfg.themes.length === 0) {
    return str;
  }
  if (!str.includes('</aside>')) {
    return str;
  }

  const themes = cfg.themes
    .filter(function (t) { return t && t.primary && t.highlight && t.secondary && t.background; })
    .map(function (t) {
      return {
        primary: String(t.primary),
        highlight: String(t.highlight),
        secondary: String(t.secondary),
        background: String(t.background)
      };
    });
  if (themes.length === 0) {
    return str;
  }
  const themesJson = JSON.stringify(themes).replace(/</g, '\\u003c');

  const html =
    '<div class="theme-buttons">' +
      '<button class="button theme-btn" id="themeSwitcherBtn" title="Themes">' +
        '<img src="/image/icon/palette.png" class="theme-icon" alt="Themes">' +
      '</button>' +
      '<button class="button theme-btn" id="hideUiBtn" title="Hide">' +
        '<img src="/image/icon/hide.png" class="theme-icon" alt="Hide">' +
      '</button>' +
    '</div>' +
    '<style>' +
      '.theme-buttons{display:flex;flex-direction:row;gap:10px;justify-content:center;padding:8px 0;}' +
      '.theme-btn{width:40px;height:40px;padding:8px;border-radius:20px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;cursor:pointer;' +
        'background:var(--aero-grad);box-shadow:inset 0 0 0 1px var(--white-main),0 0 0 .5px var(--black-main),3px 3px 10px rgba(0,0,0,.6);}' +
      '.theme-btn .theme-icon{width:100%;height:100%;object-fit:contain;pointer-events:none;}' +
      'body.ui-hidden .container{opacity:0;transition:opacity .5s;}' +
      'body.ui-hidden-done .container{visibility:hidden;transition:none;}' +
      '.ui-hidden-overlay{z-index:9999;position:fixed;inset:0;}' +
    '</style>' +
    '<script>' +
    '(function(){' +
      'var themes=' + themesJson + ';' +
      'var STORAGE_KEY="theme-index";' +
      'function updateVars(t){var s=document.documentElement.style;' +
        's.setProperty("--primary-color",t.primary);' +
        's.setProperty("--highlight-color",t.highlight);' +
        's.setProperty("--secondary-color",t.secondary);' +
        's.setProperty("--bg-image","url(\'"+t.background+"\')");}' +
      'var current=0;' +
      'try{var r=parseInt(localStorage.getItem(STORAGE_KEY)||"0",10);if(!isNaN(r)&&r>=0&&r<themes.length)current=r;}catch(e){}' +
      'function applyTheme(i,useTransition){var th=themes[i];if(!th)return;current=i;' +
        'try{localStorage.setItem(STORAGE_KEY,String(i));}catch(e){}' +
        'if(useTransition&&"startViewTransition"in document){document.startViewTransition(function(){updateVars(th);});}' +
        'else{updateVars(th);}}' +
      'applyTheme(current,false);' +
      'var btn=document.getElementById("themeSwitcherBtn");' +
      'if(btn)btn.addEventListener("click",function(){applyTheme((current+1)%themes.length,true);});' +
      'var DURATION=500,hidTimer=null,overlay=null;' +
      'function restore(){if(hidTimer){clearTimeout(hidTimer);hidTimer=null;}' +
        'document.body.classList.remove("ui-hidden","ui-hidden-done");' +
        'if(overlay){overlay.remove();overlay=null;}}' +
      'function hide(){document.body.classList.add("ui-hidden");' +
        'hidTimer=setTimeout(function(){document.body.classList.add("ui-hidden-done");hidTimer=null;},DURATION);' +
        'overlay=document.createElement("div");overlay.className="ui-hidden-overlay";' +
        'overlay.addEventListener("click",restore);document.body.appendChild(overlay);}' +
      'function toggleHide(){if(document.body.classList.contains("ui-hidden")){restore();}else{hide();}}' +
      'var hbtn=document.getElementById("hideUiBtn");' +
      'if(hbtn)hbtn.addEventListener("click",toggleHide);' +
    '})();' +
    '</script>';

  return str.replace('</aside>', html + '</aside>');
});
