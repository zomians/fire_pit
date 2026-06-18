// section-view.jsx
// 断面図 — 麻の葉ファイヤーピット A-A断面
// 地面への埋め込みの深さがわかる図

const SectionView = () => {
  const VW = 1080, VH = 760;
  // 断面図: 横方向に6000mmの幅を表現
  // 縮尺 1:30 で描画 (鉛直方向は強調しない)
  const scale = 0.13; // 1mm実寸 = 0.13 SVGpx → 6000mm = 780px
  const cxScreen = VW / 2;
  const groundY = 380; // 地表面 GL のSVG y座標

  // 寸法
  const totalW = 5196;       // 平面で見た幅(対辺) — A-A断面なので対角6000で取る
  const cutW = 6000;         // V1-V4 を通る断面 → 全長6000mm
  const stoneT = 200;        // 石厚
  const burialBase = 100;    // 砕石路盤厚
  const sandBed = 30;        // 敷き砂(目地下)
  const fireR = 500;         // 焚き火部半径
  const firePitDepth = 250;  // 火床の深さ (石より少し深く)
  const fireBrickH = 100;    // 耐火煉瓦の高さ

  const halfW = (cutW * scale) / 2;
  const leftEdge = cxScreen - halfW;
  const rightEdge = cxScreen + halfW;
  const stoneTop = groundY;
  const stoneBottom = groundY + stoneT * scale;
  const baseBottom = stoneBottom + burialBase * scale;
  const fireLeft = cxScreen - fireR * scale;
  const fireRight = cxScreen + fireR * scale;
  const fireBottom = groundY + firePitDepth * scale;
  const fireBrickTop = fireBottom - fireBrickH * scale;

  // 麻の葉の各ピース境界(断面上に現れる縦線) — 対角線V1-V4を通る断面なので
  // 中心0と±R/2の位置に分割線が出る (簡略化)
  const splitsMm = [-3000, -1500, 0, 1500, 3000];

  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ background: DRAW.paper, display: 'block' }}>
      <defs>
        <pattern id="secGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={DRAW.grid} strokeWidth="0.5" />
        </pattern>
        <pattern id="secGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(26,26,26,0.13)" strokeWidth="0.6" />
        </pattern>
        {/* 石材ハッチ(断面用 — 斜め線) */}
        <pattern id="secStone" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(26,26,26,0.35)" strokeWidth="0.6" />
        </pattern>
        {/* 砕石ハッチ */}
        <pattern id="secGravel" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="none" stroke="rgba(26,26,26,0.5)" strokeWidth="0.5" />
          <circle cx="6" cy="5" r="0.7" fill="none" stroke="rgba(26,26,26,0.5)" strokeWidth="0.5" />
          <circle cx="3.5" cy="6.5" r="0.6" fill="none" stroke="rgba(26,26,26,0.5)" strokeWidth="0.5" />
        </pattern>
        {/* 土・地盤ハッチ */}
        <pattern id="secEarth" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(26,26,26,0.18)" strokeWidth="0.5" />
          <line x1="5" y1="0" x2="5" y2="6" stroke="rgba(26,26,26,0.18)" strokeWidth="0.5" />
        </pattern>
        {/* 耐火煉瓦 */}
        <pattern id="secBrick" width="12" height="6" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="12" height="6" fill="rgba(26,26,26,0.12)" />
          <line x1="0" y1="0" x2="12" y2="0" stroke="rgba(26,26,26,0.6)" strokeWidth="0.5" />
          <line x1="0" y1="3" x2="12" y2="3" stroke="rgba(26,26,26,0.6)" strokeWidth="0.5" />
          <line x1="6" y1="0" x2="6" y2="3" stroke="rgba(26,26,26,0.6)" strokeWidth="0.5" />
          <line x1="0" y1="3" x2="0" y2="6" stroke="rgba(26,26,26,0.6)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={VW} height={VH} fill="url(#secGrid)" />
      <rect x="0" y="0" width={VW} height={VH} fill="url(#secGridMajor)" />
      <rect x="20" y="20" width={VW - 40} height={VH - 40} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thick} />
      <rect x="28" y="28" width={VW - 56} height={VH - 56} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

      {/* === 地盤(地下部分)を描く === */}
      <rect
        x={leftEdge - 200} y={groundY}
        width={(rightEdge - leftEdge) + 400} height={VH - groundY - 60}
        fill="url(#secEarth)"
      />
      {/* 地盤の上限線(GL) */}
      <line
        x1={40} y1={groundY}
        x2={leftEdge - 4} y2={groundY}
        stroke={DRAW.ink} strokeWidth={DRAW.thick}
      />
      <line
        x1={rightEdge + 4} y1={groundY}
        x2={VW - 40} y2={groundY}
        stroke={DRAW.ink} strokeWidth={DRAW.thick}
      />
      {/* GL 表示 (左端) */}
      <g>
        <line x1={50} y1={groundY} x2={120} y2={groundY} stroke={DRAW.ink} strokeWidth={DRAW.med} />
        <text x={56} y={groundY - 6} fontSize="11" fontFamily={DRAW.mono} fill={DRAW.ink}>GL ±0</text>
        {/* 三角形の地盤マーク */}
        <polygon
          points={`100,${groundY} 106,${groundY + 8} 94,${groundY + 8}`}
          fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin}
        />
      </g>

      {/* 芝生表現(GLより少し下まで) */}
      <g>
        {Array.from({ length: 60 }).map((_, i) => {
          const x = 50 + i * 9;
          if (x > leftEdge - 4 && x < rightEdge + 4) return null;
          return (
            <line key={i} x1={x} y1={groundY} x2={x + 1.5} y2={groundY - 4}
              stroke="rgba(26,26,26,0.55)" strokeWidth="0.6" />
          );
        })}
      </g>

      {/* === 砕石路盤 === */}
      <rect
        x={leftEdge} y={stoneBottom}
        width={rightEdge - leftEdge} height={baseBottom - stoneBottom}
        fill="url(#secGravel)" stroke={DRAW.ink} strokeWidth={DRAW.med}
      />

      {/* === 石材本体 — 目地100mm を表現するため2分割で描画 === */}
      {/* まず石全体の外形(目地内側) */}
      <rect
        x={leftEdge} y={stoneTop}
        width={rightEdge - leftEdge} height={stoneBottom - stoneTop}
        fill="url(#secStone)"
        stroke={DRAW.ink} strokeWidth={DRAW.thick}
      />

      {/* 石材の分割線 (各ピース境界) — 目地100mm幅で表現 */}
      {splitsMm.map((mm, i) => {
        const x = cxScreen + mm * scale;
        // 焚き火部の中の線は省略
        if (Math.abs(mm) < fireR - 1) return null;
        // 目地端(両端は外周なので除外)
        if (mm === -3000 || mm === 3000) return null;
        const jointHalf = 50 * scale; // 目地半幅50mm
        return (
          <g key={i}>
            {/* 目地部分を白抜き */}
            <rect
              x={x - jointHalf} y={stoneTop}
              width={jointHalf * 2} height={stoneBottom - stoneTop}
              fill={DRAW.paper} stroke="none"
            />
            {/* 目地に砂利ハッチ */}
            <rect
              x={x - jointHalf} y={stoneTop}
              width={jointHalf * 2} height={stoneBottom - stoneTop}
              fill="url(#secGravel)" stroke="none"
            />
            {/* 目地の両側 縦線 */}
            <line x1={x - jointHalf} y1={stoneTop} x2={x - jointHalf} y2={stoneBottom}
              stroke={DRAW.ink} strokeWidth={DRAW.med} />
            <line x1={x + jointHalf} y1={stoneTop} x2={x + jointHalf} y2={stoneBottom}
              stroke={DRAW.ink} strokeWidth={DRAW.med} />
          </g>
        );
      })}

      {/* === 中央 焚き火部 (くり抜き) === */}
      <rect
        x={fireLeft} y={stoneTop}
        width={fireRight - fireLeft} height={fireBottom - stoneTop}
        fill={DRAW.paper}
        stroke="none"
      />
      {/* 焚き火部の輪郭 */}
      <path
        d={`M ${fireLeft},${stoneTop} L ${fireLeft},${fireBottom} L ${fireRight},${fireBottom} L ${fireRight},${stoneTop}`}
        fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thick}
      />
      {/* 耐火煉瓦 (火床下部) */}
      <rect
        x={fireLeft} y={fireBrickTop}
        width={fireRight - fireLeft} height={fireBottom - fireBrickTop}
        fill="url(#secBrick)" stroke={DRAW.ink} strokeWidth={DRAW.med}
      />
      {/* 砂利(火床上部) */}
      <g>
        {Array.from({ length: 24 }).map((_, i) => {
          const x = fireLeft + 6 + (i % 12) * ((fireRight - fireLeft - 12) / 11);
          const y = fireBrickTop - 4 - (i < 12 ? 0 : 8);
          return <circle key={i} cx={x} cy={y} r="1.4" fill="none" stroke="rgba(26,26,26,0.55)" strokeWidth="0.5" />;
        })}
      </g>
      {/* 焚き火炎(象徴的) */}
      <g opacity="0.9">
        <path
          d={`M ${cxScreen - 18},${fireBrickTop - 14}
              Q ${cxScreen - 8},${fireBrickTop - 30} ${cxScreen - 4},${fireBrickTop - 50}
              Q ${cxScreen + 2},${fireBrickTop - 28} ${cxScreen + 8},${fireBrickTop - 38}
              Q ${cxScreen + 14},${fireBrickTop - 18} ${cxScreen + 18},${fireBrickTop - 14} Z`}
          fill="none" stroke={DRAW.ink} strokeWidth={DRAW.med} strokeLinejoin="round"
        />
      </g>

      {/* === 寸法線 === */}
      {/* 全幅 6000 (上部) */}
      <HDim x1={leftEdge} x2={rightEdge} y={stoneTop - 110} label="6000  (A-A断面 全長)" />
      {/* 半割 3000 + 3000 */}
      <HDim x1={leftEdge} x2={cxScreen} y={stoneTop - 70} label="3000" />
      <HDim x1={cxScreen} x2={rightEdge} y={stoneTop - 70} label="3000" />
      {/* 焚き火部 1000 */}
      <HDim x1={fireLeft} x2={fireRight} y={stoneTop - 35} label="⌀1000" />

      {/* 縦寸法 (右側) */}
      <VDim y1={stoneTop} y2={stoneBottom} x={rightEdge + 60} label="200" flip />
      <VDim y1={stoneBottom} y2={baseBottom} x={rightEdge + 60} label="100" flip />
      <VDim y1={stoneTop} y2={baseBottom} x={rightEdge + 130} label="300" flip />

      {/* 焚き火部 縦寸法 (左側に引き出し) */}
      <VDim y1={stoneTop} y2={fireBottom} x={fireLeft - 50} label="250" />
      <VDim y1={fireBrickTop} y2={fireBottom} x={fireLeft - 110} label="100" />

      {/* 引き出し線 — 部材ラベル */}
      <Leader
        from={{ x: leftEdge + 60, y: (stoneTop + stoneBottom) / 2 }}
        to={{ x: leftEdge - 30, y: stoneTop - 140 }}
        label="① 琉球石灰岩 t=200" anchor="end"
      />
      <Leader
        from={{ x: leftEdge + 80, y: (stoneBottom + baseBottom) / 2 }}
        to={{ x: leftEdge - 30, y: stoneTop - 110 }}
        label="② 砕石路盤 t=100 (C-40)" anchor="end"
      />
      <Leader
        from={{ x: leftEdge - 60, y: groundY + 20 }}
        to={{ x: leftEdge - 30, y: stoneTop - 80 }}
        label="③ 既存地盤" anchor="end"
      />
      <Leader
        from={{ x: cxScreen + fireR * scale * 0.5, y: (fireBrickTop + fireBottom) / 2 }}
        to={{ x: rightEdge + 90, y: stoneBottom + 90 }}
        label="④ 耐火煉瓦 100×60×220 積み" anchor="start"
      />
      <Leader
        from={{ x: cxScreen, y: fireBrickTop - 2 }}
        to={{ x: rightEdge + 90, y: stoneBottom + 130 }}
        label="⑤ 砂利(火床上層)" anchor="start"
      />
      <Leader
        from={{ x: cxScreen - 1500 * scale, y: stoneTop + 4 }}
        to={{ x: leftEdge - 30, y: stoneTop - 50 }}
        label="⑦ 目地 100 砂利充填" anchor="end"
      />

      {/* 切断記号 A-A */}
      <g fontFamily={DRAW.mono} fill={DRAW.ink}>
        <circle cx={leftEdge - 28} cy={stoneTop - 18} r="11" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.med} />
        <text x={leftEdge - 28} y={stoneTop - 14} fontSize="11" textAnchor="middle" fontWeight="700">A</text>
        <circle cx={rightEdge + 28} cy={stoneTop - 18} r="11" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.med} />
        <text x={rightEdge + 28} y={stoneTop - 14} fontSize="11" textAnchor="middle" fontWeight="700">A</text>
      </g>

      {/* 凡例 */}
      <g transform={`translate(60, 540)`} fontFamily={DRAW.font} fill={DRAW.ink}>
        <rect x="0" y="0" width="240" height="160" fill={DRAW.paper} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="10" y="18" fontSize="11" fontWeight="600">凡例 LEGEND</text>
        <line x1="10" y1="26" x2="230" y2="26" stroke={DRAW.ink} strokeWidth={DRAW.thin} />

        <rect x="10" y="36" width="22" height="14" fill="url(#secStone)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="47" fontSize="10">① 琉球石灰岩 t=200</text>

        <rect x="10" y="56" width="22" height="14" fill="url(#secGravel)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="67" fontSize="10">② 砕石路盤 t=100</text>

        <rect x="10" y="76" width="22" height="14" fill="url(#secEarth)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="87" fontSize="10">③ 既存地盤(土)</text>

        <rect x="10" y="96" width="22" height="14" fill="url(#secBrick)" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
        <text x="40" y="107" fontSize="10">④ 耐火煉瓦</text>

        <text x="10" y="130" fontSize="9.5" fill="#444">石材天端 = GL ±0 (面一)</text>
        <text x="10" y="146" fontSize="9.5" fill="#444">焚き火部底盤 = GL −250</text>
      </g>

      {/* タイトル */}
      <g fontFamily={DRAW.font} fill={DRAW.ink}>
        <text x="50" y="58" fontSize="18" fontWeight="600">A-A 断面図 SECTION</text>
        <text x="50" y="76" fontSize="11" fill="#444">麻の葉文様 ファイヤーピット — 縮尺 S=1:30</text>
      </g>

      {/* タイトルブロック */}
      <TitleBlock
        x={VW - 360} y={VH - 100} w={320} h={70}
        project="麻の葉 FIRE PIT"
        title="A-A 断面図 SECTION"
        scale="1:30"
        sheet="A-02"
      />

      {/* 注記 */}
      <g fontFamily={DRAW.mono} fill={DRAW.ink}>
        <text x={VW - 700} y={VH - 95} fontSize="9.5" fill="#333">注 1) 全寸法 mm 単位。</text>
        <text x={VW - 700} y={VH - 80} fontSize="9.5" fill="#333">注 2) 砕石路盤は転圧の上、敷砂で天端高さ調整。</text>
        <text x={VW - 700} y={VH - 65} fontSize="9.5" fill="#333">注 3) 耐火煉瓦は耐火モルタル目地で組積。</text>
        <text x={VW - 700} y={VH - 50} fontSize="9.5" fill="#333">注 4) 周囲芝生面と石材天端を面一(GL±0)で揃える。</text>
      </g>
    </svg>
  );
};

window.SectionView = SectionView;
