const fs = require('fs');

const files = [
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/dentista_no_rio_de_janeiro_v2/index.html',
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/implante_dentario_v2/index.html',
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/dentista_em_botafogo_v2/index.html'
];

files.forEach(f => {
  console.log('\n--- ' + f.split('/').slice(-2)[0]);
  const content = fs.readFileSync(f, 'utf8');
  
  const imgRegex = /<img[^>]+>/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
      const img = match[0];
      const hasWidth = /width=/.test(img);
      const hasHeight = /height=/.test(img);
      const hasLoading = /loading=/.test(img);
      const hasDecoding = /decoding=/.test(img);
      const isHero = /hero|logo/i.test(img);
      
      const missing = [];
      if(!hasWidth) missing.push('width');
      if(!hasHeight) missing.push('height');
      if(!hasLoading) missing.push('loading');
      if(!hasDecoding) missing.push('decoding');
      
      if(missing.length > 0) {
          console.log(`[IMG WARNING] Missing ${missing.join(', ')} in: ${img.substring(0, 60)}...`);
      }
  }

  const anchorRegex = /<a[^>]+>/g;
  let wppCount = 0;
  let telCount = 0;
  let missingTracking = [];
  while ((match = anchorRegex.exec(content)) !== null) {
      const a = match[0];
      if(a.includes('whatsapp.com')) {
          wppCount++;
          if(!a.includes('gtagSendEventWhatsapp')) {
              missingTracking.push(a);
          }
      }
      if(a.includes('tel:')) {
          telCount++;
          if(!a.includes('gtagSendEventTelefone')) {
              missingTracking.push(a);
          }
      }
  }
  console.log(`Wpp links: ${wppCount}, Tel links: ${telCount}`);
  if(missingTracking.length > 0) {
      console.log('[TRACKING WARNING] Missing tracking on:');
      missingTracking.forEach(m => console.log('   ' + m.substring(0, 80)));
  }
});
