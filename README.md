# Engenhices

**Do pensamento à criação.**

Site oficial da Engenhices, marca de invenções, experimentação, projetos criativos e
produtos físicos. O site reúne as três frentes da marca:

- **Engenhices Lab**: vídeos, experimentos, protótipos e bastidores (`/laboratorio`).
- **Engenhices Produtos**: criações à venda, com compra concluída no Mercado Livre (`/criacoes`).
- **Engenhices Projetos**: invenções próprias e encomendas personalizadas (`/encomendas`).

O site é uma vitrine: não tem carrinho, checkout, pagamento nem frete. Cada criação poderá
apontar para o seu anúncio oficial no Mercado Livre.

## Tecnologias

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) com TypeScript estrito
- Tailwind CSS 4
- ESLint
- Firebase (Authentication, Firestore e Storage) — **previsto, ainda não conectado**
- Vercel para hospedagem — **previsto, ainda não configurado**

## Como rodar localmente

Requisitos: Node.js 20.9 ou mais recente e npm.

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Nenhuma variável de ambiente é necessária para o site funcionar.

### Scripts

| Comando             | O que faz                                              |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento                            |
| `npm run build`     | Build de produção                                      |
| `npm run start`     | Serve o build de produção                              |
| `npm run lint`      | ESLint                                                 |
| `npm run typecheck` | Gera os tipos de rotas do Next e roda `tsc --noEmit`   |

## Estrutura

```
src/
  app/                  rotas (páginas, layout, sitemap, robots, ícone, Open Graph)
  components/
    brand/              logotipo
    layout/             cabeçalho, rodapé, navegação, menu móvel, cabeçalho de página
    ui/                 botão, seção, título de seção, selo, espaço reservado
    criacoes/           cartão e grade de criações
    laboratorio/        cartão de formato do Lab (com incorporação do YouTube)
    home/               seções da página inicial
  config/site.ts        nome, slogan, navegação e redes sociais
  types/criacao.ts      modelo tipado de uma criação
  data/                 conteúdo DEMONSTRATIVO (substituído pelo Firestore depois)
  lib/criacoes.ts       ponto único de leitura das criações
  lib/firebase/         configuração pública do Firebase e roteiro de integração
  lib/utils.ts          utilitários
```

### Conteúdo demonstrativo

As criações em `src/data/criacoes-demo.ts` são **exemplos** (`demo: true`), não produtos reais.
O site mostra o selo "Exemplo" nelas, não as inclui no sitemap e marca suas páginas com
`noindex`. Não há links de vídeos, redes sociais ou anúncios inventados: onde ainda não existe
um endereço real, o site mostra "em breve".

## Firebase (próxima etapa)

A arquitetura já separa a leitura de dados (`src/lib/criacoes.ts`) dos componentes. Para
conectar o Firestore, só essa camada muda. O roteiro completo, incluindo as regras de
segurança, está em [`src/lib/firebase/README.md`](src/lib/firebase/README.md).

Variáveis de ambiente previstas: veja [`.env.example`](.env.example). Copie para `.env.local`
(que não vai para o Git). Credenciais de conta de serviço nunca devem usar o prefixo
`NEXT_PUBLIC_` nem ser versionadas.

## Área administrativa

A rota `/admin` **não existe** nesta etapa (responde 404) e está bloqueada no `robots.txt`.
Ela será criada junto com o Firebase Authentication e a verificação de permissão no servidor,
para não haver uma tela que aparente segurança sem ter autenticação real.

## Implantação na Vercel

O projeto é compatível com a Vercel sem configuração extra:

1. Importe o repositório em <https://vercel.com/new>.
2. Framework: **Next.js** (detectado automaticamente).
3. Build command: `npm run build` · Output: padrão do Next.js · Install: `npm install`.
4. Variável recomendada: `NEXT_PUBLIC_SITE_URL` com o domínio final (usada em metadados,
   sitemap e Open Graph). As variáveis do Firebase só serão necessárias na etapa de integração.

## Observações

- `npm audit` aponta vulnerabilidades em `braces`/`micromatch`, dependências do
  `eslint-config-next`. São ferramentas de desenvolvimento e não entram no site publicado;
  a correção automática sugerida rebaixaria o Next.js, então não foi aplicada.
- O logotipo atual é tipográfico. O componente `src/components/brand/Logo.tsx` já está pronto
  para receber o arquivo vetorial definitivo.
