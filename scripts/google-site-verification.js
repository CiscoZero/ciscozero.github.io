'use strict';

const GOOGLE_SITE_VERIFICATION_META = '<meta name="google-site-verification" content="Kw3wJSOZVFtbRs2Vdk_9crD3p_bmcuhewOl54XzkPIY" />';

hexo.extend.filter.register('after_render:html', function (data) {
  if (!data.includes('<head>')) {
    return data;
  }
  return data.replace('<head>', '<head>\n' + GOOGLE_SITE_VERIFICATION_META);
});
