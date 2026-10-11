/**
 * Ilustração do hero: uma peça em vista isométrica, como sai da prancheta,
 * com cotas, linhas de camada (impressão 3D) e o bico da impressora.
 * Puramente decorativa — escondida de leitores de tela.
 *
 * Projeção: P(x, y, z) = (240 + 0,866x − 0,866y, 250 + 0,5x + 0,5y − z),
 * para um bloco de 160 × 100 × 60 com um furo de Ø 24 no topo.
 */

const camadas = Array.from({ length: 9 }, (_, i) => (i + 1) * 6);

export function DesenhoTecnico({ className }: { className?: string }) {
  return (
    <svg
      viewBox="90 60 400 380"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      strokeLinejoin="round"
    >
      {/* Eixos de referência */}
      <g stroke="#6b6f72" strokeWidth="0.75" strokeDasharray="2 4">
        <path d="M240 190 L240 110" />
        <path d="M266 255 L330 218" />
      </g>

      {/* Faces do bloco */}
      <polygon points="240,190 378.6,270 292,320 153.4,240" fill="#2b3134" stroke="#f5f3ee" strokeWidth="1.5" />
      <polygon points="378.6,270 292,320 292,380 378.6,330" fill="#1b1f21" stroke="#f5f3ee" strokeWidth="1.5" />
      <polygon points="153.4,240 292,320 292,380 153.4,300" fill="#232829" stroke="#f5f3ee" strokeWidth="1.5" />

      {/* Linhas de camada nas faces laterais */}
      <g stroke="#f5f3ee" strokeOpacity="0.12" strokeWidth="0.75">
        {camadas.map((k) => (
          <g key={k}>
            <path d={`M153.4 ${240 + k} L292 ${320 + k}`} />
            <path d={`M292 ${320 + k} L378.6 ${270 + k}`} />
          </g>
        ))}
      </g>

      {/* Furo no topo */}
      <ellipse cx="266" cy="255" rx="29" ry="17" fill="#161a1b" stroke="#f5f3ee" strokeWidth="1.5" />
      <path d="M237 255 a29 17 0 0 0 58 0" stroke="#ff6b00" strokeWidth="1.5" />

      {/* Trajetória do bico sobre o topo */}
      <path
        d="M205 228 L300 283 M222 218 L330 280 M262 210 L352 262"
        stroke="#ff6b00"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* Bico da impressora */}
      <g>
        <rect x="314" y="128" width="40" height="26" fill="#2b3134" stroke="#f5f3ee" strokeWidth="1.25" />
        <path d="M322 154 L346 154 L338 172 L330 172 Z" fill="#ff6b00" />
        <path d="M334 172 L334 196" stroke="#ff6b00" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="334" cy="198" r="2.5" fill="#ff6b00" />
        <path d="M334 128 L334 96" stroke="#6b6f72" strokeWidth="1" />
      </g>

      {/* Cota do comprimento (160) */}
      <g stroke="#a4a8aa" strokeWidth="0.75">
        <path d="M153.4 300 L127 315" />
        <path d="M292 380 L265.6 395" />
        <path d="M131.75 312.5 L270.3 392.5" stroke="#ff6b00" />
        <path d="M131.75 312.5 l7 1.2 l-3.5 3.6 z M270.3 392.5 l-7 -1.2 l3.5 -3.6 z" fill="#ff6b00" stroke="none" />
      </g>
      <text
        x="196"
        y="346"
        transform="rotate(30 196 346)"
        fill="#f5f3ee"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        textAnchor="middle"
      >
        160.0
      </text>

      {/* Cota da altura (60) */}
      <g stroke="#a4a8aa" strokeWidth="0.75">
        <path d="M378.6 270 L408 270" />
        <path d="M378.6 330 L408 330" />
        <path d="M402 270 L402 330" stroke="#ff6b00" />
        <path d="M402 270 l-2.5 7 l5 0 z M402 330 l-2.5 -7 l5 0 z" fill="#ff6b00" stroke="none" />
      </g>
      <text
        x="418"
        y="300"
        transform="rotate(-90 418 300)"
        fill="#f5f3ee"
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        textAnchor="middle"
      >
        60.0
      </text>

      {/* Chamada do furo */}
      <path d="M244 246 L188 170 L130 170" stroke="#a4a8aa" strokeWidth="0.75" />
      <circle cx="244" cy="246" r="2" fill="#a4a8aa" />
      <text x="130" y="162" fill="#f5f3ee" fontFamily="ui-monospace, monospace" fontSize="11">
        Ø 24 · PROF 40
      </text>

      {/* Carimbo */}
      <g fontFamily="ui-monospace, monospace" fontSize="9" fill="#a4a8aa">
        <rect x="330" y="398" width="150" height="34" fill="none" stroke="#6b6f72" strokeWidth="0.75" />
        <path d="M330 415 L480 415 M420 398 L420 432" stroke="#6b6f72" strokeWidth="0.75" />
        <text x="336" y="410">VISTA ISO</text>
        <text x="426" y="410">ESC 1:2</text>
        <text x="336" y="427" fill="#ff6b00">PROTÓTIPO</text>
        <text x="426" y="427">REV. A</text>
      </g>
    </svg>
  );
}
