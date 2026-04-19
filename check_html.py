import re
import os

files = [
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/dentista_no_rio_de_janeiro_v2/index.html',
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/implante_dentario_v2/index.html',
  '/Users/davifrossard/Dropbox/My Mac (MacBook Pro de Davi)/Desktop/Site MD Frossard/mdfrossard/source/l/dentista_em_botafogo_v2/index.html'
]

for f in files:
    print(f"\n--- {f.split('/')[-2]}")
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    imgs = re.findall(r'<img[^>]+>', content)
    for img in imgs:
        missing = []
        if 'width=' not in img: missing.append('width')
        if 'height=' not in img: missing.append('height')
        if 'loading=' not in img: missing.append('loading')
        if 'decoding=' not in img: missing.append('decoding')
        
        if missing:
            print(f"[IMG WARNING] Missing {', '.join(missing)} in: {img[:60]}...")
            
    anchors = re.findall(r'<a[^>]+>', content)
    wppCount = 0
    telCount = 0
    missingTracking = []
    
    for a in anchors:
        if 'whatsapp.com' in a:
            wppCount += 1
            if 'gtagSendEventWhatsapp' not in a:
                missingTracking.append(a)
        if 'tel:' in a:
            telCount += 1
            if 'gtagSendEventTelefone' not in a:
                missingTracking.append(a)
                
    print(f"Wpp links: {wppCount}, Tel links: {telCount}")
    if missingTracking:
        print("[TRACKING WARNING] Missing tracking on:")
        for m in missingTracking:
            print("   " + m[:80])
