import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";
import { responsavelPelosDados, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a Engenhices trata os dados pessoais enviados pelo site: o que coleta, para quê, com quem compartilha e como exercer seus direitos (LGPD).",
  alternates: { canonical: "/privacidade" },
};

/** Data da última revisão do texto. Atualize sempre que a política mudar. */
const ATUALIZADA_EM = "18 de outubro de 2026";

/** Prazo de guarda dos pedidos encerrados, prometido no texto. */
const MESES_DE_GUARDA = 12;

export default function PrivacidadePage() {
  const { nome, documento, email } = responsavelPelosDados;
  const responsavelDefinido = Boolean(nome && email);

  // A política não vai ao ar sem dizer quem é o responsável e como contatá-lo.
  if (!responsavelDefinido && process.env.VERCEL_ENV === "production") {
    throw new Error("Preencha responsavelPelosDados (nome e e-mail) em src/config/site.ts.");
  }

  const contato = email ? (
    <a href={`mailto:${email}`} className="font-bold text-laranja-escuro underline underline-offset-4">
      {email}
    </a>
  ) : (
    <strong className="text-red-800">[e-mail de contato]</strong>
  );

  return (
    <>
      <PageHeader
        eyebrow="Institucional"
        title="Política de privacidade"
        description={`Como a ${siteConfig.name} trata os dados pessoais que você envia pelo site. Atualizada em ${ATUALIZADA_EM}.`}
      />

      <Container className="py-14 sm:py-20">
        <div className="max-w-3xl space-y-12 text-base leading-relaxed text-grafite sm:text-lg">
          {!responsavelDefinido && (
            <p role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              Rascunho: preencha o responsável e o e-mail em <code>src/config/site.ts</code> antes de publicar.
            </p>
          )}

          <Bloco titulo="Em poucas palavras">
            <ul className="list-disc space-y-2 pl-5">
              <li>Só coletamos dados quando você envia um pedido de orçamento.</li>
              <li>Usamos esses dados apenas para analisar e responder ao seu pedido.</li>
              <li>Não vendemos dados, não usamos cookies de rastreamento nem de publicidade.</li>
              <li>Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados.</li>
            </ul>
          </Bloco>

          <Bloco titulo="Quem é o responsável">
            <p>
              O responsável pelo tratamento dos seus dados (controlador, nos termos da Lei Geral de
              Proteção de Dados, Lei nº 13.709/2018) é{" "}
              <strong>{nome || <span className="text-red-800">[nome do responsável]</span>}</strong>
              {documento ? `, ${documento}` : ""}, que mantém a marca {siteConfig.name} e o site{" "}
              {siteConfig.url.replace(/^https?:\/\//, "")}. Para qualquer assunto sobre seus dados,
              escreva para {contato}.
            </p>
          </Bloco>

          <Bloco titulo="Quais dados coletamos">
            <h3 className="font-bold">Quando você envia um pedido de orçamento</h3>
            <p>
              Pelo formulário da página de <Link href="/encomendas" className="underline underline-offset-4">encomendas</Link>,
              coletamos o que você escolhe informar:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>nome e um contato (e-mail ou WhatsApp);</li>
              <li>a descrição do que você precisa, a finalidade, medidas e observações;</li>
              <li>fotos de referência, um arquivo 3D ou um link para um arquivo, se você enviar.</li>
            </ul>
            <p>
              Também registramos a data do pedido e a situação dele (por exemplo, em análise ou
              orçamento enviado).
            </p>

            <h3 className="font-bold">Para proteger o formulário</h3>
            <p>
              No momento do envio, o endereço IP é usado para limitar envios em sequência e evitar
              abuso. Ele fica apenas na memória do servidor por cerca de 10 minutos e não é gravado
              junto com o pedido.
            </p>

            <h3 className="font-bold">Ao navegar pelo site</h3>
            <p>
              Como qualquer site, o servidor que hospeda a {siteConfig.name} registra dados técnicos
              de acesso, como endereço IP, data e hora, página visitada e tipo de navegador. Esses
              registros são mantidos pelo provedor de hospedagem para segurança e funcionamento do
              site. Não usamos ferramentas de análise de audiência nem de publicidade.
            </p>
          </Bloco>

          <Bloco titulo="Para que usamos e com qual base legal">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Analisar e responder ao seu pedido de orçamento</strong>, entrar em contato
                pelo meio que você indicou e, se você aceitar, fabricar a peça. Base legal: o seu
                consentimento, dado ao marcar a caixa do formulário, e a realização de procedimentos
                preliminares a um contrato, a seu pedido (LGPD, art. 7º, I e V).
              </li>
              <li>
                <strong>Segurança do site</strong>, com os registros técnicos de acesso e o controle
                de envios. Base legal: legítimo interesse em manter o site seguro (LGPD, art. 7º, IX).
              </li>
            </ul>
            <p>
              Não usamos seus dados para enviar propaganda, não os vendemos e não tomamos decisões
              automatizadas sobre você.
            </p>
          </Bloco>

          <Bloco titulo="Com quem compartilhamos">
            <p>
              Para o site funcionar, os dados ficam guardados em serviços contratados, que os tratam
              apenas para nos prestar o serviço:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Google Firebase</strong>: banco de dados onde ficam os pedidos;</li>
              <li><strong>Cloudinary</strong>: armazenamento das fotos e arquivos 3D enviados;</li>
              <li><strong>Vercel</strong>: hospedagem do site.</li>
            </ul>
            <p>
              Esses serviços podem guardar os dados em servidores fora do Brasil, como nos Estados
              Unidos. Essa transferência internacional segue as garantias contratuais oferecidas por
              eles, conforme o art. 33 da LGPD.
            </p>
            <h3 className="font-bold">Conteúdo e links de outras plataformas</h3>
            <p>
              Algumas páginas exibem vídeos do YouTube e do TikTok. O YouTube é carregado no modo de
              privacidade aprimorada, que não grava cookies até você dar play; ao assistir, valem as
              políticas do YouTube e do TikTok. Miniaturas de vídeos podem ser carregadas dos
              servidores do YouTube.
            </p>
            <p>
              As compras são feitas no Mercado Livre e os modelos 3D são baixados no MakerWorld.
              Nesses sites, valem as políticas de privacidade deles.
            </p>
          </Bloco>

          <Bloco titulo="Por quanto tempo guardamos">
            <p>
              Mantemos os dados do pedido enquanto ele estiver em análise ou em andamento e por até{" "}
              {MESES_DE_GUARDA} meses depois de encerrado, para atender a eventuais dúvidas sobre o
              que foi combinado. Depois disso, o pedido é apagado, junto com as fotos e o arquivo 3D.
              Se você pedir, apagamos antes, a menos que a lei exija guardar alguma informação.
            </p>
          </Bloco>

          <Bloco titulo="Cookies">
            <p>
              O site não usa cookies próprios de rastreamento, de análise ou de publicidade. Cookies de
              terceiros só podem aparecer quando você assiste a um vídeo incorporado do YouTube ou do
              TikTok.
            </p>
          </Bloco>

          <Bloco titulo="Segurança">
            <p>
              O acesso aos pedidos é restrito ao responsável, com login e regras de acesso no banco
              de dados, e todo o site funciona com conexão criptografada (HTTPS). Nenhum sistema é
              totalmente invulnerável; se ocorrer um incidente que possa trazer risco a você,
              comunicaremos você e a Autoridade Nacional de Proteção de Dados (ANPD), como prevê a lei.
            </p>
          </Bloco>

          <Bloco titulo="Seus direitos">
            <p>Pela LGPD (art. 18), você pode, a qualquer momento e sem custo:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
              <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>pedir a eliminação dos dados tratados com o seu consentimento;</li>
              <li>pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários;</li>
              <li>pedir a portabilidade dos seus dados;</li>
              <li>saber com quem compartilhamos seus dados;</li>
              <li>revogar o consentimento.</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, escreva para {contato}. Respondemos em até 15
              dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados
              (ANPD).
            </p>
          </Bloco>

          <Bloco titulo="Menores de idade">
            <p>
              Os pedidos de orçamento devem ser feitos por maiores de 18 anos ou com a autorização de
              um responsável legal.
            </p>
          </Bloco>

          <Bloco titulo="Mudanças nesta política">
            <p>
              Podemos atualizar esta política quando o site mudar. A data da última atualização fica no
              topo da página; mudanças importantes também serão destacadas aqui.
            </p>
          </Bloco>
        </div>
      </Container>
    </>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}
