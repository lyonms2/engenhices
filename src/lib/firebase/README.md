# Integração com o Firebase

Projeto Firebase: `engenhices`. Os passos 1 a 3 estão feitos; nenhuma página lê dados do
Firebase ainda. Este é o roteiro para concluir a integração sem reestruturar o site.

## 1. SDK — feito

O pacote `firebase` está instalado.

## 2. Variáveis de ambiente — feito localmente

Copie `.env.example` para `.env.local` e preencha com os valores do console
(Configurações do projeto → Seus apps → App da Web). Na Vercel, cadastre as
mesmas variáveis em *Settings → Environment Variables*.

## 3. Inicialização — feito

`client.ts` exporta `getFirebaseApp()`, que reaproveita a instância existente e devolve
`null` se as variáveis não estiverem definidas.

## 4. Trocar a fonte de dados

Só `src/lib/criacoes.ts` muda: as funções passam a consultar a coleção
`criacoes` (filtrando `status != "rascunho"`) e a converter `Timestamp` em
string ISO. Páginas e componentes não mudam.

## 5. Regras de segurança

Publicar regras **restritivas** antes de qualquer dado real:

- `criacoes`: leitura pública só de documentos publicados; escrita apenas para
  administradores autenticados (custom claim `admin`).
- `encomendas`: criação pública com validação de campos e tamanho; leitura e
  alteração só para administradores.
- Storage: upload de fotos de referência limitado por tipo e tamanho; leitura
  de imagens de produtos pública.

Nunca usar regras abertas (`allow read, write: if true`), nem em teste.

## 6. Área administrativa

A rota `/admin` só deve ser criada junto com o Firebase Authentication e a
verificação no servidor. Até lá ela não existe (responde 404).
