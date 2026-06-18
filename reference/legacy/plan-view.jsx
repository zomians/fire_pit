// plan-view.jsx
// 平面図 (上から見た図) — 麻の葉ファイヤーピット 6000mm × 6000mm
// 寸法線・凡例・北マーク・タイトルブロック付き

const PlanView = () => {
  // 縮尺: 図面上 1mm SVG = 1mm 実寸の比率を決める
  // SVGビューポート: 1080 × 760 (A3横っぽい比率)
  const VW = 1080, VH = 760;
  // 平面図エリア: 中央付近、約 540×540 で六角形を描く
  // 実寸6000mmを画面540pxに収める → スケール 1:11.11 (≈1:11)
  // つまり 6000mm を SVG の 540px で表す
  const planSize = 540;
  const scale = planSize / 6000; // 0.09 mm/svgpx
  const cx = 380, cy = VH / 2 + 10;

  const { R: Rmm, W: Wmm, H: Hmm, side: sideMm, verts: vertsMm } = hexagonGeometry(6000);
  const R = Rmm * scale;       // 描画用半径
  const Wd = Wmm * scale;
  const Hd = Hmm * scale;

  // 六角形頂点 (描画座標)
  const verts = vertsMm.map(v => ({ x: cx + v.x * scale, y: cy + v.y * scale }));

  // 麻の葉構成線
  const center = { x: cx, y: cy };
  const fireRmm = 500; // 焚き火部の半径 = 直径1000mmの半分
  const fireR = fireRmm * scale;

  // 麻の葉ピース (3分割×6セクター = 18ピース)
  const piecesMm = asanohaPieces(Rmm, fireRmm);

  // 焚き火部用の小六角形 (直径1000mm)
  // ユーザー選択: 中央の小さな六角形をくり抜く
  const fireHexVerts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 2) + (i * Math.PI / 3);
    fireHexVerts.push({
      x: cx + fireR * Math.cos(angle),
      y: cy - fireR * Math.sin(angle),
    });
  }

  // ハッチング用 patternId (火床用)
  const fireHexPath = fireHexVerts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') + ' Z';

  // 主要寸法
  // - 全幅 (横幅) = √3 × 3000 ≈ 5196mm
  // - 全高 (縦幅) = 6000mm
  // - 一辺 = 3000mm
  // - 焚き火部 = 直径1000mm

  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ background: DRAW.paper, display: 'block' }}>
      <defs>
        {/* 製図グリッド */}
        <pattern id="planGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={DRAW.grid} strokeWidth="0.5" />
        </pattern>
        <pattern id="planGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(26,26,26,0.14)" strokeWidth="0.6" />
        </pattern>
        {/* 芝生ハッチ (周囲) */}
        <pattern id="grassHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(26,26,26,0.18)" strokeWidth="0.5" />
        </pattern>
        {/* 焚き火床ハッチ (砂利) */}
        <pattern id="firePitHatch" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.7" fill="rgba(26,26,26,0.55)" />
        </pattern>
        {/* 目地ハッチ (砂利) — 薄め */}
        <pattern id="jointHatch" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.5" fill="rgba(26,26,26,0.32)" />
          <circle cx="4.5" cy="4.5" r="0.4" fill="rgba(26,26,26,0.22)" />
        </pattern>
        {/* 石材ハッチ (琉球石灰岩) — 細点描 */}
        <pattern id="stoneHatch" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.35" fill="rgba(26,26,26,0.22)" />
          <circle cx="3.8" cy="3.8" r="0.25" fill="rgba(26,26,26,0.18)" />
        </pattern>
      </defs>

      {/* グリッド背景 */}
      <rect x="0" y="0" width={VW} height={VH} fill="url(#planGrid)" />
      <rect x="0" y="0" width={VW} height={VH} fill="url(#planGridMajor)" />

      {/* 図面枠 */}
      <rect x="20" y="20" width={VW - 40} height={VH - 40} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thick} />
      <rect x="28" y="28" width={VW - 56} height={VH - 56} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

      {/* 芝生エリア (六角形の外側を芝生で表現) */}
      <g>
        {/* 芝生は六角形の少し外側まで */}
        <rect x="80" y="60" width="600" height={VH - 130} fill="url(#grassHatch)" opacity="0.6" />
        <rect x="80" y="60" width="600" height={VH - 130} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin} strokeDasharray="2 3" opacity="0.5" />
      </g>

      {/* 麻の葉パターン本体 — 背景色 */}
      <polygon
        points={verts.map(v => `${v.x},${v.y}`).join(' ')}
        fill={DRAW.paper}
        stroke="none"
      />

      {/* 目地下地 (ベース) — ピース間の砂利が見える背景 */}
      <polygon
        points={verts.map(v => `${v.x},${v.y}`).join(' ')}
        fill={DRAW.paper}
        stroke="none"
      />
      <polygon
        points={verts.map(v => `${v.x},${v.y}`).join(' ')}
        fill="url(#jointHatch)"
        stroke="none"
        opacity="0.7"
      />

      {/* 各ピースを石材ハッチで塗る — 目地100mmぶん内側にインセット */}
      {piecesMm.map((p, idx) => {
        // 描画座標で 50mm × scale だけ内側にインセット
        const drawPts = p.pts.map(pt => ({ x: cx + pt.x * scale, y: cy + pt.y * scale }));
        const inset = shrinkPolygon(drawPts, 50 * scale);
        const pts = inset.map(pt => `${pt.x},${pt.y}`).join(' ');
        return (
          <polygon
            key={idx}
            points={pts}
            fill="url(#stoneHatch)"
            stroke={DRAW.ink}
            strokeWidth={DRAW.med}
            strokeLinejoin="miter"
          />
        );
      })}

      {/* 中央の焚き火部 (くり抜き) — こちらは目地と独立して残す */}
      <polygon
        points={fireHexVerts.map(p => `${p.x},${p.y}`).join(' ')}
        fill={DRAW.paper}
        stroke={DRAW.ink}
        strokeWidth={DRAW.thick}
      />
      <polygon
        points={fireHexVerts.map(p => `${p.x},${p.y}`).join(' ')}
        fill="url(#firePitHatch)"
        stroke="none"
      />

      {/* 外周ガイド線 (細・破線) — 6000mmの基準六角形 */}
      <polygon
        points={verts.map(v => `${v.x},${v.y}`).join(' ')}
        fill="none"
        stroke={DRAW.ink}
        strokeWidth={DRAW.thin}
        strokeDasharray="4 3"
        opacity="0.6"
      />

      {/* 中心マーク */}
      <g stroke={DRAW.ink} strokeWidth={DRAW.thin} fill="none">
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} />
        <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} />
        <circle cx={cx} cy={cy} r="3" fill={DRAW.ink} />
      </g>

      {/* === 寸法線 === */}
      {/* 縦の全長 6000mm: 図の左側 */}
      <VDim
        y1={verts[0].y}
        y2={verts[3].y}
        x={cx - Wd / 2 - 50}
        label="6000"
      />
      {/* 横の全幅: 上側 */}
      <HDim
        x1={cx - Wd / 2}
        x2={cx + Wd / 2}
        y={verts[0].y - 30}
        label="5196"
      />
      {/* 一辺 3000mm: 右上の辺 */}
      {(() => {
        // V1(top)-V2(右上) の辺
        const a = verts[0], b = verts[1];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len; // 外側法線
        const off = 32;
        const ax = mx + nx * off, ay = my + ny * off;
        return (
          <g>
            <line
              x1={a.x + nx * off} y1={a.y + ny * off}
              x2={b.x + nx * off} y2={b.y + ny * off}
              stroke={DRAW.dim} strokeWidth={DRAW.dimStroke}
            />
            <line x1={a.x} y1={a.y} x2={a.x + nx * (off + 4)} y2={a.y + ny * (off + 4)} stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} />
            <line x1={b.x} y1={b.y} x2={b.x + nx * (off + 4)} y2={b.y + ny * (off + 4)} stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} />
            <text
              x={ax + nx * 12} y={ay + ny * 12}
              fontSize="10.5" fontFamily={DRAW.mono}
              fill={DRAW.dim} textAnchor="middle" dominantBaseline="middle"
              transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${ax + nx * 12}, ${ay + ny * 12})`}
            >3000</text>
          </g>
        );
      })()}

      {/* 焚き火部 直径 1000mm */}
      <HDim
        x1={cx - fireR}
        x2={cx + fireR}
        y={cy - fireR - 14}
        label="⌀1000"
      />

      {/* 引き出し線(リーダー)で材料注釈 */}
      <Leader
        from={{ x: cx + Math.cos(-Math.PI / 6) * R * 0.55, y: cy + Math.sin(-Math.PI / 6) * R * 0.55 }}
        to={{ x: cx + Wd / 2 + 70, y: cy - 80 }}
        label="琉球石灰岩 t=200"
        anchor="start"
      />
      <Leader
        from={{ x: cx + fireR * 0.5, y: cy + fireR * 0.5 }}
        to={{ x: cx + Wd / 2 + 70, y: cy + 30 }}
        label="焚き火床 砂利+耐火レンガ"
        anchor="start"
      />
      <Leader
        from={{ x: cx - Math.cos(Math.PI / 6) * R * 0.62, y: cy - Math.sin(Math.PI / 6) * R * 0.62 }}
        to={{ x: cx + Wd / 2 + 70, y: cy - 180 }}
        label="目地 100 砂利充填"
        anchor="start"
      />
      <Leader
        from={{ x: 90, y: 200 }}
        to={{ x: 60, y: 175 }}
        label="既存 芝生"
        anchor="start"
      />

      {/* 北マーク */}
      <NorthMark cx={VW - 90} cy={90} r={26} />

      {/* 凡例 */}
      <g transform={`translate(${VW - 230}, 160)`} fontFamily={DRAW.font} fill={DRAW.ink}>
        <rect x="0" y="0" width="200" height="180" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="10" y="18" fontSize="11" fontWeight="600">凡例 LEGEND</text>
        <line x1="10" y1="26" x2="190" y2="26" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

        <rect x="10" y="36" width="22" height="14" fill="url(#stoneHatch)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="47" fontSize="10">琉球石灰岩 t=200</text>

        <rect x="10" y="58" width="22" height="14" fill="url(#firePitHatch)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="69" fontSize="10">焚き火床 (砂利+耐火煉瓦)</text>

        <rect x="10" y="80" width="22" height="14" fill="url(#grassHatch)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="91" fontSize="10">既存 芝生／土</text>

        <line x1="10" y1="106" x2="32" y2="106" stroke={DRAW.ink} strokeWidth={DRAW.thick} />
        <text x="40" y="110" fontSize="10">石材外周線</text>

        <line x1="10" y1="122" x2="32" y2="122" stroke={DRAW.ink} strokeWidth={DRAW.med} />
        <text x="40" y="126" fontSize="10">石材分割線</text>

        <line x1="10" y1="138" x2="32" y2="138" stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} />
        <text x="40" y="142" fontSize="10">寸法線</text>

        <text x="10" y="160" fontSize="9.5" fontFamily={DRAW.mono} fill="#222" fontWeight="600">目地 = 100mm</text>
        <text x="10" y="173" fontSize="9" fontFamily={DRAW.mono} fill="#444">単位: mm</text>
      </g>

      {/* タイトル */}
      <g fontFamily={DRAW.font} fill={DRAW.ink}>
        <text x="50" y="58" fontSize="18" fontWeight="600">平面図 PLAN</text>
        <text x="50" y="76" fontSize="11" fill="#444">麻の葉文様 ファイヤーピット — 縮尺 S=1:50</text>
      </g>

      {/* タイトルブロック */}
      <TitleBlock
        x={VW - 360} y={VH - 100} w={320} h={70}
        project="麻の葉 FIRE PIT"
        title="平面図 PLAN VIEW"
        scale="1:50"
        sheet="A-01"
      />

      {/* 注記 — 図面右下、タイトルブロックの上に配置 */}
      <g fontFamily={DRAW.mono} fill={DRAW.ink}>
        <rect x={VW - 660} y={VH - 178} width={290} height={70}
          fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.thin} opacity="0.95" />
        <text x={VW - 650} y={VH - 162} fontSize="10" fontWeight="600" fill="#222">NOTES 注記</text>
        <text x={VW - 650} y={VH - 148} fontSize="9" fill="#333">1) 全寸法 mm 単位。中心線より対称配置。</text>
        <text x={VW - 650} y={VH - 136} fontSize="9" fill="#333">2) 麻の葉文様 = 6セクター × 3分割 = 計18石。</text>
        <text x={VW - 650} y={VH - 124} fontSize="9" fill="#333">3) 目地 100mm (砂利充填) / 各石は基準線−50。</text>
        <text x={VW - 650} y={VH - 112} fontSize="9" fill="#333">4) 石材天端と周囲芝生面を面一 (GL±0)。</text>
      </g>
    </svg>
  );
};

window.PlanView = PlanView;
