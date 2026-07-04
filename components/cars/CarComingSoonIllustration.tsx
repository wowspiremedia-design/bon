export default function CarComingSoonIllustration() {
  return (
    <svg width="100%" viewBox="0 0 680 480" role="img">
      <title>Coming soon SUV rental illustration, sketch style with hills</title>
      <desc>
        A hand-sketched line-art illustration of an SUV with a roof rack and luggage, drawn with ink-style outline strokes, driving along a hill route with sketched mountain outlines behind it. The wheels rotate and the body has a gentle suspension bounce, staying in place while dust puffs from the rear wheel and dashed road markings scroll beneath it.
      </desc>
      <style>{`
        .wheel-l{transform-origin:255px 296px;animation:spin 1.1s linear infinite}
        .wheel-r{transform-origin:425px 296px;animation:spin 1.1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .car-body{animation:bounce .55s ease-in-out infinite}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .shadow{animation:shadowpulse .55s ease-in-out infinite}
        @keyframes shadowpulse{0%,100%{opacity:.14;transform:scaleX(1)}50%{opacity:.07;transform:scaleX(.9)}}
        .road-dashes{animation:roll .5s linear infinite}
        @keyframes roll{to{transform:translateX(-40px)}}
        .puff1{animation:puff 1.3s ease-out infinite}
        .puff2{animation:puff 1.3s ease-out infinite .4s}
        .puff3{animation:puff 1.3s ease-out infinite .8s}
        @keyframes puff{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.5}100%{opacity:0;transform:translate(-30px,-8px) scale(1.5)}}
      `}</style>
      <rect x="0" y="0" width="680" height="300" fill="#FAF6EC" />
      <polyline points="0,260 80,150 180,260" fill="none" stroke="#B4AFA3" strokeWidth="1.8" />
      <polyline points="460,260 580,145 680,260" fill="none" stroke="#B4AFA3" strokeWidth="1.8" />
      <polyline points="60,262 160,175 260,262" fill="none" stroke="#2C2C2A" strokeWidth="2" />
      <polyline points="380,262 480,170 580,262" fill="none" stroke="#2C2C2A" strokeWidth="2" />
      <line x1="130" y1="205" x2="145" y2="218" stroke="#2C2C2A" strokeWidth="1.3" />
      <line x1="140" y1="200" x2="155" y2="213" stroke="#2C2C2A" strokeWidth="1.3" />
      <line x1="150" y1="196" x2="165" y2="209" stroke="#2C2C2A" strokeWidth="1.3" />
      <line x1="450" y1="200" x2="465" y2="213" stroke="#2C2C2A" strokeWidth="1.3" />
      <line x1="460" y1="196" x2="475" y2="209" stroke="#2C2C2A" strokeWidth="1.3" />
      <line x1="0" y1="298" x2="680" y2="298" stroke="#8C8577" strokeWidth="1.5" />
      <g className="road-dashes">
        <line x1="4" y1="318" x2="20" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="44" y1="318" x2="60" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="84" y1="318" x2="100" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="124" y1="318" x2="140" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="164" y1="318" x2="180" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="204" y1="318" x2="220" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="244" y1="318" x2="260" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="284" y1="318" x2="300" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="324" y1="318" x2="340" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="364" y1="318" x2="380" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="404" y1="318" x2="420" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="444" y1="318" x2="460" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="484" y1="318" x2="500" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="524" y1="318" x2="540" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="564" y1="318" x2="580" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="604" y1="318" x2="620" y2="318" stroke="#8C8577" strokeWidth="2.5" />
        <line x1="644" y1="318" x2="660" y2="318" stroke="#8C8577" strokeWidth="2.5" />
      </g>
      <line x1="0" y1="338" x2="680" y2="338" stroke="#8C8577" strokeWidth="1.5" />
      <ellipse className="shadow" cx="340" cy="316" rx="150" ry="8" fill="#3A3A36" />
      <circle className="puff1" cx="222" cy="300" r="6" fill="none" stroke="#B4AFA3" strokeWidth="1.5" />
      <circle className="puff2" cx="222" cy="300" r="6" fill="none" stroke="#B4AFA3" strokeWidth="1.5" />
      <circle className="puff3" cx="222" cy="300" r="6" fill="none" stroke="#B4AFA3" strokeWidth="1.5" />
      <g className="car-body">
        <path
          d="M195 296 L195 270 Q195 250 213 240 C222 218 235 206 260 202 L400 200 C425 202 440 212 452 228 C462 240 470 248 480 254 Q487 258 488 270 L488 296 Z"
          fill="#FAF6EC"
          stroke="#1E6B2E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="228" y1="223" x2="465" y2="220" stroke="#1E6B2E" strokeWidth="1.5" />
        <line x1="280" y1="210" x2="280" y2="222" stroke="#1E6B2E" strokeWidth="1.5" />
        <line x1="345" y1="201" x2="345" y2="221" stroke="#1E6B2E" strokeWidth="1.5" />
        <line x1="410" y1="204" x2="410" y2="220" stroke="#1E6B2E" strokeWidth="1.5" />
        <line x1="228" y1="192" x2="452" y2="192" stroke="#2C2C2A" strokeWidth="4" strokeLinecap="round" />
        <rect x="270" y="182" width="5" height="10" fill="#2C2C2A" />
        <rect x="392" y="182" width="5" height="10" fill="#2C2C2A" />
        <rect x="292" y="166" width="86" height="22" rx="9" fill="#F0DCC0" stroke="#C97B4A" strokeWidth="1.8" />
        <line x1="292" y1="177" x2="378" y2="177" stroke="#C97B4A" strokeWidth="1.6" />
        <path d="M480 254 Q487 258 488 270" fill="none" stroke="#D9A441" strokeWidth="2.2" />
        <circle cx="480" cy="262" r="3" fill="#D9A441" />
      </g>
      <g className="wheel-l">
        <circle cx="255" cy="296" r="30" fill="#FAF6EC" stroke="#2C2C2A" strokeWidth="2.5" />
        <circle cx="255" cy="296" r="14" fill="none" stroke="#D9A441" strokeWidth="2" />
        <line x1="255" y1="296" x2="255" y2="284" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="255" y1="296" x2="255" y2="308" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="255" y1="296" x2="267" y2="296" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="255" y1="296" x2="243" y2="296" stroke="#2C2C2A" strokeWidth="1.6" />
      </g>
      <g className="wheel-r">
        <circle cx="425" cy="296" r="30" fill="#FAF6EC" stroke="#2C2C2A" strokeWidth="2.5" />
        <circle cx="425" cy="296" r="14" fill="none" stroke="#D9A441" strokeWidth="2" />
        <line x1="425" y1="296" x2="425" y2="284" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="425" y1="296" x2="425" y2="308" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="425" y1="296" x2="437" y2="296" stroke="#2C2C2A" strokeWidth="1.6" />
        <line x1="425" y1="296" x2="413" y2="296" stroke="#2C2C2A" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
