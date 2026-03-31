# MD Frossard Odontologia

Site da clínica MD Frossard Odontologia.

## 🏗 Estrutura do Site

A arquitetura do projeto segue o padrão do Eleventy com as seguintes pastas e arquivos principais:

- `source/`: Diretório base onde fica grande parte do conteúdo original.
  - `_posts/`: Artigos do blog, escritos em formato Markdown (`.md`).
  - `_data/`: Arquivos de dados estruturados utilizados na renderização, como listas de categorias ou autores (ex: `authors.json`).
  - `tratamentos/`: Páginas detalhadas sobre cada tratamento odontológico.
- `functions/`: Funções backend / serverless rodando em Cloudflare Workers (ex: formulário de contato, rotas de API).
- `_site/` ou `public/`: Diretórios gerados automaticamente pelo processo de build. **Não modifique arquivos nessas pastas diretamente**, pois serão sobrescritos.
- `source/_data/config.yml`: Variáveis globais do site (título, seo, author, etc) lidas nativamente pelo Eleventy.
- `.eleventy.js`: Arquivo de configuração principal do Eleventy.
- `wrangler.toml`: Arquivo de configuração do Cloudflare Pages / Workers.
- `package.json`: Gerenciador das dependências e scripts de desenvolvimento do projeto Node.js.

## 🛠 Frameworks e Tecnologias Usadas

O site foi recentemente atualizado para uma stack moderna de alta performance visando velocidade e segurança:

- **Gerador de Site Estático (SSG):** [Eleventy (11ty)](https://11ty.dev/)
- **Templating Engines:** [EJS](https://ejs.co/) (layouts principais) e [Markdown](https://daringfireball.net/projects/markdown/) (artigos e páginas simples).
- **Hospedagem e Deploy:** Cloudflare Pages (migrado anteriormente de Firebase/Netlify).
- **Backend / Serverless:** Cloudflare Workers (funções em Edge).
- **Estilização e Recursos Visuais:** Sistema próprio no diretório do template usando variáveis CSS e design moderno.
- **Idioma do Conteúdo:** Português do Brasil (pt-BR).

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendamos a versão LTS atual)
- Gerenciador de pacotes npm (já incluído no Node)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) ativo localmente (via dependência de desenvolvimento).

### Passo a Passo

1. **Instale as dependências:**
   No diretório principal do projeto, rode:
   ```bash
   npm install
   ```

2. **Rodar apenas o site localmente (Rápido, focado em layout e conteúdo):**
   Inicia o servidor embutido do Eleventy com hot-reload ativo:
   ```bash
   npm run start
   ```
   Acesse no navegador: `http://localhost:4000`

3. **Fazer o Build estático dos arquivos:**
   Gera a versão final do site para produção:
   ```bash
   npm run build
   ```

4. **Testar ambiente simulando Cloudflare (Para homologar as Functions / Workers):**
   ```bash
   npm run start:cloudflare
   ```
   Isso iniciará o Wrangler, emulando perfeitamente o ambiente que será executado em produção no Cloudflare Pages. Garanta que o comando de build foi executado antes para que o diretório público esteja atualizado.

## 🌐 Como Fazer Deploy

O sistema está configurado com Integração Contínua provida pelo **Cloudflare Pages**.

- Todo **commit e push** para a branch principal de produção irá acionar automaticamente um novo build nos servidores da Cloudflare.
- O Cloudflare roda o comando de build base (`npm run build`) e implanta os arquivos resultantes em Edge locations para rápida distribuição.
- Não é necessário realizar deploy de forma manual nos servidores na nuvem, foque apenas em commitar o código devidamente validado localmente.

## 📌 Outras Informações Relevantes

- **Regra de Ouro:** Após cada alteração no código, **verifique se o site realiza a compilação local (build) de forma limpa e sem erros**. Não envie quebras para o repositório principal.
- **Gerenciando Entradas e Posts:** Novos conteúdos podem ser criados adicionando arquivos `.md` na pasta `source/_posts/`. Atente-se ao formato do "Front Matter" no topo do arquivo para declarar devidamente Título, Categoria, Autor, e demais metadados.
- **Variáveis de Ambiente:** Qualquer credencial ou API key necessária para as funções serverless deve ser declarada como uma secret local `.dev.vars` (e inserida via painel online na Cloudflare para a produção).
