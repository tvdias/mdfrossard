'use strict';

hexo.extend.filter.register('template_locals', function(locals){
  var base_url = locals.config.url;
  if (base_url.charAt(base_url - 1) !== '/') base_url += '/';
  
  locals.canonical_url = base_url + locals.page.canonical_path.replace('index.html', '').toLowerCase();
  
  return locals;
});
