# Integração com o Firebase

Projeto Firebase: `engenhices`. Passos 1 a 4 e 6 feitos; falta publicar as regras com o UID
do administrador e, depois, o formulário de encomendas e o envio de fotos.

## 1. SDK — feito

O pacote `firebase` está instalado.

## 2. Variáveis de ambiente — feito localmente

Copie `.env.example` para `.env.local` e preencha com os valores do console
(Configurações do projeto → Seus apps → App da Web). Na Vercel, cadastre as
mesmas variáveis em *Settings → Environment Variables*.

## 3. Inicialização — feito

`client.ts` exporta `getFirebaseApp()`, que reaproveita a instância existente e devolve
`null` se as variáveis não estiverem definidas.

## 4. Fonte de dados — feito

`src/lib/criacoes.ts` lê a coleção `criacoes` pelo Firestore Lite (`servidor.ts`), com
cache de alguns minutos. O id de cada documento é o slug. Sem as variáveis de ambiente,
usa os dados demonstrativos.

## 5. Regras de segurança

Publicar regras **restritivas** antes de qualquer dado real:

- `criacoes`: leitura pública só de documentos publicados; escrita apenas para
  administradores autenticados (custom claim `admin`).
- `encomendas`: criação pública com validação de campos e tamanho; leitura e
  alteração só para administradores.
- Storage: upload de fotos de referência limitado por tipo e tamanho; leitura
  de imagens de produtos pública.

Nunca usar regras abertas (`allow read, write: if true`), nem em teste.

## 6. Área administrativa — feito

`/admin` (componentes em `src/components/admin`, operações em `painel.ts`) grava direto no
Firestore com o login Google. As regras em `/firestore.rules` só aceitam gravações do UID
do administrador e validam cada campo.
