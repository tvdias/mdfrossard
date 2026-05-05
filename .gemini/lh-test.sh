#!/bin/bash
# Test all non-V2 landing pages with Lighthouse
URLS=(
  "https://mdfrossard.com.br/l/dentista_na_barra_da_tijuca/"
  "https://mdfrossard.com.br/l/dentista_em_botafogo/"
  "https://mdfrossard.com.br/l/dentista_no_rio_de_janeiro/"
  "https://mdfrossard.com.br/l/clinica_odontologica_na_barra_da_tijuca/"
  "https://mdfrossard.com.br/l/clinica_odontologica_em_botafogo/"
  "https://mdfrossard.com.br/l/clinica_odontologica_no_rio_de_janeiro/"
  "https://mdfrossard.com.br/l/implante-dentario/"
  "https://mdfrossard.com.br/l/facetas-de-porcelana/"
  "https://mdfrossard.com.br/l/medo_de_dentista_barra_da_tijuca/"
  "https://mdfrossard.com.br/l/dentista_perto_de_mim/"
  "https://mdfrossard.com.br/l/dentista_no_citta_america/"
  "https://mdfrossard.com.br/l/dentista_no_downtown/"
  "https://mdfrossard.com.br/l/recaptura/"
  "https://mdfrossard.com.br/l/transformacoes-do-sorriso/"
  "https://mdfrossard.com.br/l/contato/"
)

echo "| LP | Score | FCP | LCP | TBT | CLS | SI |"
echo "|---|---|---|---|---|---|---|"

for url in "${URLS[@]}"; do
  name=$(echo "$url" | sed 's|.*/l/||;s|/$||')
  result=$(npx lighthouse "$url" \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance \
    --output=json \
    --quiet 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    audits = data.get('audits', {})
    score = data.get('categories', {}).get('performance', {}).get('score', 0)
    fcp = audits.get('first-contentful-paint', {}).get('displayValue', 'N/A')
    lcp = audits.get('largest-contentful-paint', {}).get('displayValue', 'N/A')
    tbt = audits.get('total-blocking-time', {}).get('displayValue', 'N/A')
    cls_v = audits.get('cumulative-layout-shift', {}).get('displayValue', 'N/A')
    si = audits.get('speed-index', {}).get('displayValue', 'N/A')
    print(f'{int(score*100)} | {fcp} | {lcp} | {tbt} | {cls_v} | {si}')
except:
    print('ERR | - | - | - | - | -')
")
  echo "| $name | $result |"
done
