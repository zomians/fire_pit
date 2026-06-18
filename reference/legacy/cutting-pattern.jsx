// cutting-pattern.jsx
// 石の切り出しパターン詳細図 — 麻の葉ファイヤーピット
// 各石材ピースに番号を付け、寸法を記入

const CuttingPattern = () => {
  const VW = 1080, VH = 760;
  // 切り出し図はやや大きめに
  const planSize = 540;
  const scale = planSize / 6000;
  const cx = 360, cy = VH / 2 + 10;

  const { R: Rmm, verts: vertsMm } = hexagonGeometry(6000);
  const R = Rmm * scale;
  const verts = vertsMm.map(v => ({ x: cx + v.x * scale, y: cy + v.y * scale }));

  // 6セクター × 3ピース = 18ピース
  // 各セクター i (0..5): 大三角(中心,v_i,v_{i+1}) を3分割
  // ピースA: (center, v_i, g)
  // ピースB: (v_i, v_{i+1}, g)
  // ピースC: (v_{i+1}, center, g)
  // ここで g = 大三角の重心
  const fireRmm = 500; // 焚き火部半径

  // 各ピースの計算 (mm単位)
  const piecesMm = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (Math.PI / 2) + (i * Math.PI / 3);
    const a2 = (Math.PI / 2) + ((i + 1) * Math.PI / 3);
    const v1 = { x: Rmm * Math.cos(a1), y: -Rmm * Math.sin(a1) };
    const v2 = { x: Rmm * Math.cos(a2), y: -Rmm * Math.sin(a2) };
    const c = { x: 0, y: 0 };
    const g = { x: (v1.x + v2.x + c.x) / 3, y: (v1.y + v2.y + c.y) / 3 };
    piecesMm.push({ id: `S${i + 1}-A`, label: `${i + 1}A`, sector: i + 1, sub: 'A', pts: [c, v1, g] });
    piecesMm.push({ id: `S${i + 1}-B`, label: `${i + 1}B`, sector: i + 1, sub: 'B', pts: [v1, v2, g] });
    piecesMm.push({ id: `S${i + 1}-C`, label: `${i + 1}C`, sector: i + 1, sub: 'C', pts: [v2, c, g] });
  }

  // 焚き火部の小六角形(石をくり抜くピース)
  const fireHexPieces = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (Math.PI / 2) + (i * Math.PI / 3);
    const a2 = (Math.PI / 2) + ((i + 1) * Math.PI / 3);
    fireHexPieces.push({
      v1: { x: fireRmm * Math.cos(a1), y: -fireRmm * Math.sin(a1) },
      v2: { x: fireRmm * Math.cos(a2), y: -fireRmm * Math.sin(a2) },
    });
  }

  // 主要寸法計算
  // セクター0の大三角形: 中心(0,0), v1=上頂点(0,-3000), v2=右上頂点(2598,-1500)
  // 一辺 = 3000mm
  // 重心位置: g = ((0+0+2598)/3, (0-3000-1500)/3) = (866, -1500)
  // 中心〜重心 距離 = √(866² + 1500²) ≈ 1732mm
  // 重心〜v1 距離 = √(866² + 1500²) ≈ 1732mm
  // 重心〜v2 距離 = √(1732² + 0²) = 1732mm (実は等距離: 大三角は正三角形なので重心は外接円中心、外接円半径=辺/√3=1732)
  // つまりA, B, Cいずれも (3000, 1732, 1732) mm の二等辺三角形

  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ background: DRAW.paper, display: 'block' }}>
      <defs>
        <pattern id="cutGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={DRAW.grid} strokeWidth="0.5" />
        </pattern>
        <pattern id="cutGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(26,26,26,0.13)" strokeWidth="0.6" />
        </pattern>
        <pattern id="cutStone" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.35" fill="rgba(26,26,26,0.22)" />
          <circle cx="3.8" cy="3.8" r="0.25" fill="rgba(26,26,26,0.18)" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={VW} height={VH} fill="url(#cutGrid)" />
      <rect x="0" y="0" width={VW} height={VH} fill="url(#cutGridMajor)" />
      <rect x="20" y="20" width={VW - 40} height={VH - 40} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thick} />
      <rect x="28" y="28" width={VW - 56} height={VH - 56} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

      {/* === 全体図(左側) === */}
      <g>
        {/* 各ピースを描画 — 目地100mm内側にインセット */}
        {piecesMm.map((p, idx) => {
          const drawPts = p.pts.map(pt => ({ x: cx + pt.x * scale, y: cy + pt.y * scale }));
          const inset = shrinkPolygon(drawPts, 50 * scale);
          const pts = inset.map(pt => `${pt.x},${pt.y}`).join(' ');
          // セクター1だけハイライト
          const isHighlight = p.sector === 1;
          // ラベル位置はインセット後の重心
          const cxP = inset.reduce((s, pt) => s + pt.x, 0) / inset.length;
          const cyP = inset.reduce((s, pt) => s + pt.y, 0) / inset.length;
          return (
            <g key={idx}>
              <polygon
                points={pts}
                fill={isHighlight ? 'rgba(26,26,26,0.10)' : 'url(#cutStone)'}
                stroke={DRAW.ink}
                strokeWidth={DRAW.med}
                strokeLinejoin="miter"
              />
              <text
                x={cxP} y={cyP}
                fontSize="9" fontFamily={DRAW.mono}
                fill={DRAW.ink} textAnchor="middle" dominantBaseline="middle"
                fontWeight="600"
              >{p.label}</text>
            </g>
          );
        })}

        {/* 焚き火部のくり抜き */}
        {(() => {
          const fireVerts = [];
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 2) + (i * Math.PI / 3);
            fireVerts.push({
              x: cx + fireRmm * scale * Math.cos(a),
              y: cy - fireRmm * scale * Math.sin(a),
            });
          }
          return (
            <polygon
              points={fireVerts.map(v => `${v.x},${v.y}`).join(' ')}
              fill={DRAW.paper}
              stroke={DRAW.ink}
              strokeWidth={DRAW.thick}
              strokeDasharray="4 3"
            />
          );
        })()}
        {/* 焚き火部ラベル */}
        <text x={cx} y={cy} fontSize="10" fontFamily={DRAW.mono} fill={DRAW.ink}
          textAnchor="middle" dominantBaseline="middle" fontStyle="italic">FIRE ⌀1000</text>

        {/* 外周 */}
        <polygon
          points={verts.map(v => `${v.x},${v.y}`).join(' ')}
          fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thick}
        />
      </g>

      {/* セクター番号(外側に丸ラベル) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a1 = (Math.PI / 2) + (i * Math.PI / 3);
        const a2 = (Math.PI / 2) + ((i + 1) * Math.PI / 3);
        const am = (a1 + a2) / 2;
        const r = R + 30;
        const x = cx + r * Math.cos(am);
        const y = cy - r * Math.sin(am);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.med} />
            <text x={x} y={y} fontSize="11" fontFamily={DRAW.mono} fontWeight="700"
              textAnchor="middle" dominantBaseline="middle" fill={DRAW.ink}>{i + 1}</text>
          </g>
        );
      })}

      {/* セクション1ハイライトのコール */}
      <Leader
        from={{ x: cx + 30, y: cy - 130 }}
        to={{ x: cx + 200, y: cy - 220 }}
        label="セクター①の3ピース詳細 →"
        anchor="start"
      />

      {/* === 詳細図(右側) — セクター1の単一ピース === */}
      <g transform={`translate(${VW - 380}, 100)`}>
        <rect x="0" y="0" width="340" height="500" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="14" y="22" fontSize="13" fontFamily={DRAW.font} fontWeight="600" fill={DRAW.ink}>
          ピース詳細 (代表) — セクター①
        </text>
        <text x="14" y="38" fontSize="10" fontFamily={DRAW.mono} fill="#444">縮尺 S=1:25  /  単位 mm</text>
        <line x1="14" y1="46" x2="326" y2="46" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

        {/* セクター1の三角形を拡大表示 */}
        {(() => {
          // セクター1: i=0 → v1=(0,-3000), v2=(2598,-1500), c=(0,0)
          // 表示用に中心を移動&スケール
          const pScale = 0.058; // 大三角(辺3000)を ~174px で
          const ox = 170, oy = 220;
          const c = { x: 0, y: 0 };
          const v1 = { x: 0, y: -3000 };
          const v2 = { x: 2598, y: -1500 };
          const g = { x: (c.x + v1.x + v2.x) / 3, y: (c.y + v1.y + v2.y) / 3 };
          const tr = (p) => ({ x: ox + p.x * pScale, y: oy + p.y * pScale });
          const C = tr(c), V1 = tr(v1), V2 = tr(v2), G = tr(g);

          return (
            <g>
              {/* ピース 1A: c, v1, g */}
              <polygon
                points={`${C.x},${C.y} ${V1.x},${V1.y} ${G.x},${G.y}`}
                fill="rgba(26,26,26,0.08)"
                stroke={DRAW.ink} strokeWidth={DRAW.med}
              />
              {/* ピース 1B: v1, v2, g */}
              <polygon
                points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${G.x},${G.y}`}
                fill="rgba(26,26,26,0.04)"
                stroke={DRAW.ink} strokeWidth={DRAW.med}
              />
              {/* ピース 1C: v2, c, g */}
              <polygon
                points={`${V2.x},${V2.y} ${C.x},${C.y} ${G.x},${G.y}`}
                fill="rgba(26,26,26,0.12)"
                stroke={DRAW.ink} strokeWidth={DRAW.med}
              />

              {/* ピース番号 */}
              <text x={(C.x + V1.x + G.x) / 3} y={(C.y + V1.y + G.y) / 3}
                fontSize="14" fontFamily={DRAW.mono} fontWeight="700"
                textAnchor="middle" dominantBaseline="middle" fill={DRAW.ink}>1A</text>
              <text x={(V1.x + V2.x + G.x) / 3} y={(V1.y + V2.y + G.y) / 3}
                fontSize="14" fontFamily={DRAW.mono} fontWeight="700"
                textAnchor="middle" dominantBaseline="middle" fill={DRAW.ink}>1B</text>
              <text x={(V2.x + C.x + G.x) / 3} y={(V2.y + C.y + G.y) / 3}
                fontSize="14" fontFamily={DRAW.mono} fontWeight="700"
                textAnchor="middle" dominantBaseline="middle" fill={DRAW.ink}>1C</text>

              {/* 頂点ラベル */}
              <circle cx={C.x} cy={C.y} r="2.5" fill={DRAW.ink} />
              <circle cx={V1.x} cy={V1.y} r="2.5" fill={DRAW.ink} />
              <circle cx={V2.x} cy={V2.y} r="2.5" fill={DRAW.ink} />
              <circle cx={G.x} cy={G.y} r="2.5" fill={DRAW.ink} />
              <text x={C.x - 6} y={C.y + 14} fontSize="9" fontFamily={DRAW.mono} fill="#444">C(中心)</text>
              <text x={V1.x + 6} y={V1.y - 4} fontSize="9" fontFamily={DRAW.mono} fill="#444">V₁</text>
              <text x={V2.x + 4} y={V2.y - 4} fontSize="9" fontFamily={DRAW.mono} fill="#444">V₂</text>
              <text x={G.x + 5} y={G.y - 5} fontSize="9" fontFamily={DRAW.mono} fill="#444">G(重心)</text>

              {/* 寸法線 — V1-V2 (辺=3000) */}
              {(() => {
                const dx = V2.x - V1.x, dy = V2.y - V1.y;
                const len = Math.hypot(dx, dy);
                const nx = -dy / len, ny = dx / len;
                const off = 22;
                return (
                  <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
                    <line x1={V1.x + nx * off} y1={V1.y + ny * off}
                      x2={V2.x + nx * off} y2={V2.y + ny * off} />
                    <line x1={V1.x} y1={V1.y} x2={V1.x + nx * (off + 4)} y2={V1.y + ny * (off + 4)} />
                    <line x1={V2.x} y1={V2.y} x2={V2.x + nx * (off + 4)} y2={V2.y + ny * (off + 4)} />
                    <text
                      x={(V1.x + V2.x) / 2 + nx * (off + 12)}
                      y={(V1.y + V2.y) / 2 + ny * (off + 12)}
                      fontSize="10" fontFamily={DRAW.mono} fill={DRAW.dim}
                      textAnchor="middle" dominantBaseline="middle"
                    >3000</text>
                  </g>
                );
              })()}
              {/* C-V1 (3000) */}
              <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
                <line x1={C.x - 22} y1={C.y} x2={C.x - 22} y2={V1.y} />
                <line x1={C.x} y1={C.y} x2={C.x - 26} y2={C.y} />
                <line x1={V1.x} y1={V1.y} x2={V1.x - 26} y2={V1.y} />
                <text x={C.x - 26} y={(C.y + V1.y) / 2} fontSize="10" fontFamily={DRAW.mono}
                  fill={DRAW.dim} textAnchor="end" dominantBaseline="middle">3000</text>
              </g>
              {/* C-G (重心まで 1732) */}
              <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none" strokeDasharray="3 2">
                <line x1={C.x} y1={C.y} x2={G.x} y2={G.y} opacity="0.4" />
              </g>
              <text x={(C.x + G.x) / 2 + 6} y={(C.y + G.y) / 2 + 12}
                fontSize="9" fontFamily={DRAW.mono} fill="#666">R=1732</text>
            </g>
          );
        })()}

        {/* 寸法表 */}
        <g transform="translate(14, 330)" fontFamily={DRAW.mono} fill={DRAW.ink}>
          <text x="0" y="0" fontSize="11" fontFamily={DRAW.font} fontWeight="600">各ピース寸法 (代表)</text>
          <line x1="0" y1="6" x2="312" y2="6" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

          <text x="0" y="22" fontSize="10" fontWeight="600">ピース</text>
          <text x="60" y="22" fontSize="10" fontWeight="600">辺a</text>
          <text x="120" y="22" fontSize="10" fontWeight="600">辺b</text>
          <text x="180" y="22" fontSize="10" fontWeight="600">辺c</text>
          <text x="240" y="22" fontSize="10" fontWeight="600">厚 t</text>
          <line x1="0" y1="28" x2="312" y2="28" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

          <text x="0" y="42" fontSize="10">A (×6)</text>
          <text x="60" y="42" fontSize="10">3000</text>
          <text x="120" y="42" fontSize="10">1732</text>
          <text x="180" y="42" fontSize="10">1732</text>
          <text x="240" y="42" fontSize="10">200</text>

          <text x="0" y="58" fontSize="10">B (×6)</text>
          <text x="60" y="58" fontSize="10">3000</text>
          <text x="120" y="58" fontSize="10">1732</text>
          <text x="180" y="58" fontSize="10">1732</text>
          <text x="240" y="58" fontSize="10">200</text>

          <text x="0" y="74" fontSize="10">C (×6)</text>
          <text x="60" y="74" fontSize="10">3000</text>
          <text x="120" y="74" fontSize="10">1732</text>
          <text x="180" y="74" fontSize="10">1732</text>
          <text x="240" y="74" fontSize="10">200</text>
          <line x1="0" y1="82" x2="312" y2="82" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

          <text x="0" y="100" fontSize="10" fill="#444">※ 中央焚き火側の3頂点は ⌀1000 円弧で切除 (B以外)</text>
          <text x="0" y="115" fontSize="10" fill="#444">※ 全ピース合同 — 全 18枚 + 焚き火部 1式</text>
          <text x="0" y="130" fontSize="10" fill="#444">※ 目地 100mm を考慮し、各辺 −50mm 控除のこと</text>
        </g>
      </g>

      {/* === 切り出しリスト(下) === */}
      <g transform={`translate(60, ${VH - 180})`} fontFamily={DRAW.font} fill={DRAW.ink}>
        <rect x="0" y="0" width="640" height="120" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="14" y="20" fontSize="12" fontWeight="600">石材 切り出しリスト STONE CUT LIST</text>
        <line x1="14" y1="28" x2="626" y2="28" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

        <g fontFamily={DRAW.mono} fontSize="10">
          <text x="14" y="46" fontWeight="600">No.</text>
          <text x="60" y="46" fontWeight="600">部位</text>
          <text x="160" y="46" fontWeight="600">形状</text>
          <text x="290" y="46" fontWeight="600">寸法 (mm)</text>
          <text x="450" y="46" fontWeight="600">数量</text>
          <text x="510" y="46" fontWeight="600">備考</text>
          <line x1="14" y1="52" x2="626" y2="52" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

          <text x="14" y="68">01</text>
          <text x="60" y="68">外周ピース A・B・C</text>
          <text x="160" y="68">二等辺三角形</text>
          <text x="290" y="68">2900 × 1682 × 1682 × t200</text>
          <text x="450" y="68">18</text>
          <text x="510" y="68">琉球石灰岩 / 目地100控除済</text>

          <text x="14" y="84">02</text>
          <text x="60" y="84">中央焚き火 縁石</text>
          <text x="160" y="84">扇形 (R500 内側)</text>
          <text x="290" y="84">⌀1000 内接 / t200</text>
          <text x="450" y="84">—</text>
          <text x="510" y="84">No.01に含む(切除部)</text>

          <text x="14" y="100">03</text>
          <text x="60" y="100">耐火煉瓦</text>
          <text x="160" y="100">煉瓦</text>
          <text x="290" y="100">230 × 114 × 65</text>
          <text x="450" y="100">約30</text>
          <text x="510" y="100">焚き火床積上げ用</text>
        </g>
      </g>

      {/* タイトル */}
      <g fontFamily={DRAW.font} fill={DRAW.ink}>
        <text x="50" y="58" fontSize="18" fontWeight="600">石の切り出しパターン詳細図</text>
        <text x="50" y="76" fontSize="11" fill="#444">CUTTING PATTERN — 縮尺 全体 S=1:50 / 詳細 S=1:25</text>
      </g>

      {/* タイトルブロック */}
      <TitleBlock
        x={VW - 360} y={VH - 100} w={320} h={70}
        project="麻の葉 FIRE PIT"
        title="切り出しパターン CUT PATTERN"
        scale="1:50/25"
        sheet="A-03"
      />
    </svg>
  );
};

window.CuttingPattern = CuttingPattern;
