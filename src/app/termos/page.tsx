import type { Metadata } from "next";
import Link from "next/link";
import { SecaoLegal } from "@/components/legal/SecaoLegal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Section";
import { lojaDeModelos, responsavelPelosDados, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Regras de uso do site da Engenhices: conteúdo, compras pelo Mercado Livre, modelos 3D, encomendas sob medida e responsabilidades.",
  alternates: { canonical: "/termos" },
};

/** Data da última revisão do texto. Atualize sempre que os termos mudarem. */
const ATUALIZADOS_EM = "18 de outubro de 2026";

const linkInterno = "font-bold text-laranja-escuro underline underline-offset-4";

export default function TermosPage() {
  const { nome, email } = responsavelPelosDados;
  const marca = siteConfig.name;

  return (
    <>
      <PageHeader
        eyebrow="Institucional"
        title="Termos de uso"
        description={`As regras para usar o site da ${marca}, comprar nossas criações e encomendar peças sob medida. Atualizados em ${ATUALIZADOS_EM}.`}
      />

      <Container className="py-14 sm:py-20">
        <div className="max-w-3xl space-y-12 text-base leading-relaxed text-grafite sm:text-lg">
          <SecaoLegal titulo="Em poucas palavras">
            <ul className="list-disc space-y-2 pl-5">
              <li>O site apresenta as criações, o Laboratório e recebe pedidos de orçamento.</li>
              <li>As compras são feitas no Mercado Livre e os modelos 3D, no {lojaDeModelos.nome}.</li>
              <li>
                Um pedido de orçamento não obriga ninguém: a encomenda só vale depois que você aceita o
                orçamento.
              </li>
              <li>Textos, fotos, vídeos, marca e modelos são da {marca}; peça autorização para reutilizar.</li>
            </ul>
          </SecaoLegal>

          <SecaoLegal titulo="Quem somos e aceitação">
            <p>
              O site {siteConfig.url.replace(/^https?:\/\//, "")} é mantido por {nome}, responsável pela
              marca {marca}. Ao usar o site, você concorda com estes termos e com a{" "}
              <Link href="/privacidade" className={linkInterno}>
                política de privacidade
              </Link>
              . Se não concordar, não use o site. Dúvidas:{" "}
              <a href={`mailto:${email}`} className={linkInterno}>
                {email}
              </a>
              .
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Compras pelo Mercado Livre">
            <p>
              O site é uma vitrine: as criações à venda têm um link para o anúncio oficial no Mercado
              Livre, onde a compra, o pagamento e a entrega acontecem. Preço, estoque, frete, prazos,
              trocas e devoluções seguem o que está no anúncio e as regras do Mercado Livre. Se houver
              diferença entre o site e o anúncio, vale o anúncio.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Modelos 3D para impressão">
            <p>
              Os modelos 3D das nossas peças são vendidos ou disponibilizados no {lojaDeModelos.nome}.
              A compra, o download e o que você pode fazer com o arquivo (uso pessoal, revenda de peças
              impressas etc.) seguem a licença indicada na página de cada modelo e as regras do{" "}
              {lojaDeModelos.nome}. O resultado da impressão depende da sua impressora, do material e
              das configurações usadas.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Encomendas sob medida">
            <h3 className="font-bold">Pedido de orçamento</h3>
            <p>
              O formulário de{" "}
              <Link href="/encomendas" className={linkInterno}>
                encomendas
              </Link>{" "}
              serve para você descrever o que precisa. Enviar o pedido não gera compromisso nem cobrança
              para nenhum dos lados. Analisamos a viabilidade de cada pedido e podemos recusar os que
              não forem possíveis de fazer, que estiverem fora do que trabalhamos ou que contrariarem
              estes termos.
            </p>

            <h3 className="font-bold">Orçamento e aceite</h3>
            <p>
              Se o pedido for viável, enviamos um orçamento pelo contato que você informou, com o que
              será feito, preço, prazo, forma de pagamento e de entrega. A encomenda só existe depois
              que você aceita o orçamento; o que estiver nele é o que foi combinado entre nós.
            </p>

            <h3 className="font-bold">O que você informa</h3>
            <p>
              Fazemos a peça com base nas informações que você envia: descrição, medidas, fotos e
              arquivos. Confira as medidas com cuidado; uma peça fabricada com medidas informadas
              erradas não é defeito de fabricação.
            </p>

            <h3 className="font-bold">Arquivos e ideias enviados</h3>
            <p>
              Ao enviar um arquivo 3D, foto ou desenho, você declara que tem o direito de usá-lo e de
              pedir que ele seja fabricado, sem violar direitos autorais, marcas ou patentes de outras
              pessoas. Usamos esse material só para analisar e fazer o seu pedido. Não fabricamos peças
              ilegais, perigosas ou que imitem produtos protegidos por marca ou patente de terceiros.
            </p>

            <h3 className="font-bold">Características das peças</h3>
            <p>
              Peças impressas em 3D podem ter pequenas variações de medida, linhas de camada visíveis e
              diferenças de cor e de acabamento em relação a fotos e telas. Salvo o que for combinado
              no orçamento, as peças não são indicadas para usos críticos, como segurança de pessoas,
              equipamentos médicos, contato com alimentos ou cargas elevadas.
            </p>

            <h3 className="font-bold">Seus direitos de consumidor</h3>
            <p>
              Nada nestes termos limita os direitos garantidos pelo Código de Defesa do Consumidor,
              inclusive os de garantia contra defeitos.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Conteúdo do site e do Laboratório">
            <p>
              Textos, fotos, vídeos, desenhos, a marca {marca}, o logotipo e os modelos apresentados
              pertencem à {marca} ou são usados com autorização. Você pode ver e compartilhar os links
              das páginas; para copiar, reproduzir ou usar esse conteúdo de outra forma, peça
              autorização antes.
            </p>
            <p>
              Os experimentos, testes e bastidores do Laboratório mostram o nosso processo e têm caráter
              informativo. Se você reproduzir algo, faça com cuidado e por sua conta: os resultados
              dependem de equipamentos, materiais e condições que não controlamos.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Links e conteúdo de terceiros">
            <p>
              O site tem links e vídeos de outras plataformas, como Mercado Livre, {lojaDeModelos.nome},
              YouTube e TikTok. Esses serviços têm termos e políticas próprios, e não respondemos pelo
              funcionamento ou pelo conteúdo deles.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Uso do site">
            <p>
              Não use o site para enviar conteúdo ilegal, ofensivo ou que não seja seu, para tentar
              acessar áreas restritas ou para sobrecarregar o serviço, como no envio automático de
              pedidos. Pedidos assim podem ser descartados.
            </p>
            <p>
              Trabalhamos para manter o site no ar e as informações corretas, mas ele pode ficar
              indisponível ou ter erros de tempos em tempos. Podemos mudar, incluir ou retirar
              criações, conteúdos e funções a qualquer momento.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Mudanças nestes termos">
            <p>
              Podemos atualizar estes termos. A data da última atualização fica no topo da página. Um
              orçamento já aceito segue os termos em vigor quando foi aceito.
            </p>
          </SecaoLegal>

          <SecaoLegal titulo="Lei aplicável e contato">
            <p>
              Estes termos seguem as leis do Brasil. Eventuais disputas podem ser resolvidas no foro do
              domicílio do consumidor, como prevê o Código de Defesa do Consumidor. Antes disso, fale
              com a gente:{" "}
              <a href={`mailto:${email}`} className={linkInterno}>
                {email}
              </a>
              .
            </p>
          </SecaoLegal>
        </div>
      </Container>
    </>
  );
}
