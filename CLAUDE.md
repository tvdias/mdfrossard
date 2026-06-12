# Claude Instructions

> **Full instructions are in [.instructions.md](.instructions.md) — read that file first.**

This file is the Claude entry point. All project context, rules, and workflows are consolidated in `.instructions.md` at the repository root.

---

## Quick Reference

### Deployment Rule ⚠️
**Never run `wrangler deploy` or publish directly to Cloudflare.**
Commit to git → Cloudflare automatically deploys. That's the only deployment path.

### Divisão de responsabilidades (regra do Davi) ⚠️
**Claude NUNCA faz `git commit`, `git push` nem deploy.**
Claude: edita os arquivos → roda `npm run build` → verifica que está tudo certo → avisa o Davi.
Davi: revisa, faz o commit, o push e promove a versão na Cloudflare manualmente.

### After Every Change
```bash
npm run build        # Must succeed
npm start            # Verify at http://localhost:4000
```

### Git Workflow (executado pelo Davi, não pelo Claude)
```bash
git checkout -b feature/your-feature-name
# Claude faz as mudanças e verifica com:
npm run build
# Davi commita e envia:
git add .
git commit -m "Clear description of changes"
git push origin feature/your-feature-name
```

### Key Locations
| What | Where |
|------|-------|
| Blog posts | `source/_posts/*.md` |
| Landing pages | `source/l/<slug>/index.html` |
| Layouts / partials | `themes/mdfrossard/` |
| Global data | `source/_data/` |
| Worker entry point | `src/worker.js` |
| Eleventy config | `.eleventy.js` |
| Cloudflare config | `wrangler.toml` |
| Generated output | `public/` ← **never edit directly** |

---

**See [.instructions.md](.instructions.md) for complete documentation.**

---

## Clínica — Informações Gerais

**Nome:** MD Frossard Odontologia (também chamada de MD Odontologia)
**Site:** https://mdfrossard.com.br
**CNPJ:** 11.966.148/001-00
**EPAO:** 3415

### Responsáveis Técnicos
- **Dr. Marcos Frossard** — CRO RJ 8058 (fundador)
- **Dr. Davi Heringer Frossard** — CRO RJ 36193 (filho)

**Tempo de mercado:** 38 anos de tradição

---

## Unidades

### Barra da Tijuca
- **Endereço:** Av. das Américas, 700 — Bloco 2 / Sala 143, Shopping Città America, CEP 22640-100
- **Google Maps:** https://share.google/dByZdhTbp6XWBuVqh

### Botafogo / Humaitá
- **Endereço:** Rua Marques, 15 — Casa, ao lado da Cobal do Humaitá, CEP 22260-240
- **Google Maps:** https://share.google/DeseB8CqFwaP0oJKy

---

## Contato

- **WhatsApp:** (21) 97663-7803
- **Telefone:** (21) 3217-0430
- **Email:** contato@mdfrossard.com / mdfrossard1@gmail.com
- **Instagram:** @mdfrossard
- **Facebook:** facebook.com/mdfrossard
- **Horário:** Segunda a sexta, 08h às 18h

---

## Posicionamento e Política Comercial

- Odontologia de elite, atendimento humanizado, sem atrasos
- Atendimento particular — **não aceita convênios diretamente**, mas fornece documentação para reembolso junto à operadora
- **Não realiza consulta gratuita**
- Preços individualizados — definidos somente após avaliação clínica
- Scanner iTero® (sem moldagens desconfortáveis)

---

## Especialidades / Tratamentos

Implantes dentários, facetas de porcelana, lentes de contato dental, reabilitação oral, periodontia, estética dental, clareamento dental, endodontia, cirurgia oral.

---

## Restrições do CFO (Resolução 196/2019 + 271/2025)

- Proibido oferecer ou divulgar promoções e descontos
- Proibido usar cases antes/depois para captação sem disclaimer
- **Disclaimer obrigatório em todo material com casos clínicos:**
  > *"Casos do acervo clínico, meramente ilustrativos. O resultado depende de avaliação clínica individual."*

---

## Google Meu Negócio

- Nota **5.0** em ambas as unidades (Barra da Tijuca e Botafogo)
- Mais de 100 avaliações na unidade da Barra da Tijuca

### Depoimentos de pacientes (prontos para uso)

1. *"Fiquei super satisfeito com o processo e resultado do tratamento estético-dentário que fiz na Md Frossard Odontologia. Nota 10 em todos os quesitos para a equipe comandada pelos Drs. Marcos e seu filho David. Além da expertise profissional, destaque para o clima de gentileza, pontualidade e responsabilidade."* — Otávio Azevedo

2. *"Sempre tive pânico de dentista, algo que me impediu de ir ao dentista por 15 anos. Quando encontrei a MD Frossard estava apavorada mas decidida e eles foram essenciais para que eu finalmente superasse e me cuidasse. O trabalho feito por eles me mudou esteticamente e funcionalmente. Dr Davi, Dr Marcos, a querida Lili e todo o time, vocês são demais!!"* — Larissa Rodrigues

3. *"Minha experiência foi maravilhosa, aumentou muito minha autoestima, antes eu não sorria nas fotos, meus dentes não apareciam, depois do trabalho executado por Dr. Marcos, Dr. Davi e equipe, vivo sorrindo, sou outra pessoa."* — Célia Regina Paiva

4. *"Já tive várias experiências com dentistas que não foram nada boas… até que encontrei o MD FROSSARD! A equipe toda é muito atenciosa e competente. Eu, que tenho traumas com dentistas, só tenho a agradecer o atendimento que tive! Completamente indolor."* — Anneliza Argon

5. *"Conheço o Dr. Marcos desde a barriga da minha mãe e desde sempre cuidei dos meus dentes com ele. Recentemente ele e seu filho, Dr. Davi, realizaram o meu sonho de ter um sorriso perfeito. Recomendo a MD Odontologia de olhos fechados."* — Bianca Sadkowski

6. *"Ser paciente da MD Frossard Odontologia me dá tranquilidade e segurança. Fui recuperado de graves doenças gengivais e dentais, tendo hoje um sorriso alegre e espontâneo. Alia-se a sua técnica avançada a humanização, ética e um ambiente familiar."* — Ilton Fajardo

7. *"Agradeço aos Drs Marcos, Davi Frossard e Equipe, toda a atenção e profissionalismo no meu tratamento dentário. Foi longo e tive que superar meu medo mas, valeu cada etapa. Foi feito o melhor em cada aspecto. Sorriso mais bonito e com certeza muito mais saudável."* — Nivaldo Teixeira de Souza

8. *"Na clínica MD Frossard consigo relaxar durante os procedimentos por saber que estou sempre em boas mãos. Brinco sempre com o Dr. Marcos Frossard que ele é um odontólogo com alma de artista."* — Elza Serra

9. *"Ao longo da vida, infelizmente tive algumas experiências negativas com profissionais da odontologia, o que me deixou receosa e insegura em relação aos tratamentos. No entanto, desde que comecei a me consultar com o Dr Davi, minha percepção mudou completamente. Trata-se de um profissional extremamente competente, ético, atencioso e paciente. Em todas as consultas, demonstra profundo conhecimento técnico, explica cada procedimento com clareza, tira dúvidas sem pressa e transmite muita segurança. Além da excelência profissional, o atendimento humanizado faz toda a diferença. É raro encontrar alguém que consiga unir tanta competência com empatia e respeito pelo paciente. Para quem procura um dentista de confiança, comprometido com a qualidade do tratamento e com o bem-estar dos pacientes, eu indico sem hesitar."* — Debora Vieira

10. *"Cheguei ao consultório sofrendo com a situação da minha boca. Após um mês, eu já sorria novamente. Sou muito grata ao Dr. Davi e sua equipe!"* — Nadja

11. *"A preocupação com minhas dores, a urgência no meu atendimento, a prontidão, a boa explicação me fizeram fã. Parabéns pelo excelente trabalho, em especial, ao Dr Davi Frossard."* — Raphaela Ferreira

---

## Rastreamento & Pixels

| Tag | ID |
|---|---|
| Google Ads | AW-1003091018 |
| Google Analytics 4 | G-7S27172376 |
| Google Tag Manager | GTM-TLR2C2T |
| Meta Pixel | 266409860211711 |
| Microsoft Ads UET | 163015443 |

**Meta Conversions API (CAPI):** ativa server-side via Cloudflare Worker (`/api/track-contact`). Evento: `Contact`, deduplicado com browser via `event_id`.

**Eventos de conversão:** `contato_whatsapp`, `contato_telefone`

**Consent Mode v2 (LGPD):** default `denied` para novos visitantes. Scripts carregados via delay-engine (primeira interação ou 3500ms).
⚠️ `analytics_storage` está em teste com valor `granted` — verificar status atual antes de mexer em `consent-default.ejs`.

**Microsoft Clarity:** instalado para heatmaps e gravações.

### PhoneTrack — números por canal
| Canal | Número |
|---|---|
| AD - Barra da Tijuca | (21) 3500-1436 |
| AD - Botafogo / Rio | (21) 3500-1693 |
| AD - Tratamentos / YouTube | (21) 3959-3999 |
| Facebook Ads | (21) 3959-2208 |
| Orgânico / Google Meu Negócio | (21) 3513-8479 |

---

## Google Ads — Estrutura das Campanhas

**ID da conta:** AW-1003091018

| Campanha | Tipo | Observação |
|---|---|---|
| Dentista Barra | Search (STAG) | Principal, maior volume |
| Dentista Botafogo | Search (STAG) | QS baixo nas kws principais |
| Dentista Downtown | Search | Menor volume |
| RJ / Rio de Janeiro | Search | CPA mais alto |
| Implantes | Search | Precisa de LP dedicada — QS crítico |
| PMax Local Barra | Performance Max | Melhor CPA da conta (R$13) |
| PMax Local Botafogo | Performance Max | Criada recentemente |

**Estratégia de lances:** Maximize Conversions (Smart Bidding)
**Value-based bidding:** cada LP define `contact_value` no front-matter para otimização por valor.

---

## Meta Ads — Configuração Botafogo

- **Objetivo:** Mensagens para WhatsApp
- **Segmentação:** raio 4 km a partir da Rua Marques, 15
- **Público:** 28–65 anos, interesses em saúde e estética
- **Orçamento aprendizado:** R$40–60/dia | **Otimização:** R$25–40/dia
- **KPI principal:** custo por mensagem iniciada (meta abaixo de R$15)
- **Criativos prontos:** carrossel 6 slides + vídeo de depoimentos (1080×1920, 69s) em `carousel_botafogo/`
- ⚠️ Evitar a palavra "personalizado" em títulos de anúncios (bloqueado pela política de saúde do Meta/Google)
