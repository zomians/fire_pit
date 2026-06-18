// drawing-utils.jsx
// 麻の葉ファイヤーピット 設計図用 共通ユーティリティ
// テクニカル図面風のスタイル定数と、麻の葉ジオメトリの計算関数

const DRAW = {
  ink: '#1a1a1a',
  paper: '#f5f1e8',  // off-white drafting paper
  paperDark: '#ebe5d6',
  grid: 'rgba(26,26,26,0.08)',
  hatch: 'rgba(26,26,26,0.55)',
  dim: '#1a1a1a',
  dimText: '#1a1a1a',
  thin: 0.6,
  med: 1.0,
  thick: 1.6,
  dimStroke: 0.5,
  font: '"Helvetica Neue", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
  mono: '"SF Mono", "Courier New", monospace',
};

// 麻の葉パターンのジオメトリ計算
// 正六角形(point-up)が縦6000mmに内接する場合
// 高さ = 2R = 6000  →  R(中心から頂点) = 3000
// 幅 = √3 × R = 5196.15
// 一辺 = R = 3000
function hexagonGeometry(maxHeight = 6000) {
  const R = maxHeight / 2;          // 外接円半径 = 3000
  const W = Math.sqrt(3) * R;       // 幅 ≈ 5196
  const H = 2 * R;                  // 高さ = 6000
  const side = R;                   // 一辺の長さ = 3000

  // 6つの頂点 (point-up: 上下が頂点、左右がフラット)
  // 角度は90°(上)から60°ずつ
  const verts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 2) + (i * Math.PI / 3);
    verts.push({
      x: R * Math.cos(angle),
      y: -R * Math.sin(angle), // SVGはy下向き
      label: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'][i],
    });
  }
  return { R, W, H, side, verts };
}

// 麻の葉文様のピース計算
// 正六角形を中心から6つの大三角形(正三角形)に分割し、
// 各大三角形をさらに3つの細長い二等辺三角形に分割する
// 各大三角形の中点から3本の線を内部に引いて、3つの小三角形を作る
function asanohaPieces(R, fireR) {
  // 6つの大三角形の頂点
  const pieces = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (Math.PI / 2) + (i * Math.PI / 3);
    const a2 = (Math.PI / 2) + ((i + 1) * Math.PI / 3);
    const v1 = { x: R * Math.cos(a1), y: -R * Math.sin(a1) };
    const v2 = { x: R * Math.cos(a2), y: -R * Math.sin(a2) };
    const center = { x: 0, y: 0 };
    // 大三角形 (center, v1, v2)
    // 麻の葉: 各辺の中点を結ぶことで内部に3つの小三角形を作る
    const m1 = { x: (center.x + v1.x) / 2, y: (center.y + v1.y) / 2 }; // 中心-v1の中点
    const m2 = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };          // v1-v2の中点
    const m3 = { x: (center.x + v2.x) / 2, y: (center.y + v2.y) / 2 }; // 中心-v2の中点

    // 麻の葉の一区画は3つの小三角形:
    // P1: center, m1, m3 (内側の小三角)
    // P2: m1, v1, m2     (頂点側の小三角)
    // P3: m2, v2, m3     (もう一つの頂点側の小三角)
    // しかし伝統的な麻の葉はもう少し違う。実際には:
    // 各大三角形を3つの二等辺三角形に分割する: 中点(m2)から中心線、各頂点から内側へ
    // ここでは v1, v2, m2 の3点と center から伸びる構造で:
    // T1: center, v1, m2
    // T2: center, m2, v2
    // のように2分割もある。
    //
    // 伝統的な「麻の葉」は: 大三角形(center,v1,v2)の中に、
    // m2(辺中点)からcenterへ線を引き、さらにv1,v2それぞれからm2の反対側に...
    // → 結局、6つの大三角形 × 内部3分割 = 18ピース構成にする
    // 内部3分割: 各大三角形の重心から3頂点へ線を引く形 (3つの細三角形)
    const g = {
      x: (center.x + v1.x + v2.x) / 3,
      y: (center.y + v1.y + v2.y) / 3,
    };
    pieces.push({
      sector: i + 1,
      sub: 'A',
      pts: [center, v1, g],
    });
    pieces.push({
      sector: i + 1,
      sub: 'B',
      pts: [v1, v2, g],
    });
    pieces.push({
      sector: i + 1,
      sub: 'C',
      pts: [v2, center, g],
    });
  }
  return pieces;
}

// 麻の葉文様の正統な内分線を描画用に返す
// 大六角形を6つの正三角形に分けたあと、各正三角形内部に
// 「中点を結ぶ」3本の線を追加し、計12本の線で麻の葉模様を作る
function asanohaLines(R) {
  const lines = [];
  // 大三角形を構成する線: 中心から各頂点 (6本) はベース構造
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 2) + (i * Math.PI / 3);
    lines.push({
      type: 'spoke',
      from: { x: 0, y: 0 },
      to: { x: R * Math.cos(a), y: -R * Math.sin(a) },
    });
  }
  // 各大三角形の内部に: 辺の中点を結ぶ追加線
  // 各セクター: center-v1-v2 の三角形で
  //   m1=midpoint(center,v1), m2=midpoint(v1,v2), m3=midpoint(center,v2)
  //   m1-m2, m2-m3, m1-m3 を結ぶ → 中央の小三角形を作る
  for (let i = 0; i < 6; i++) {
    const a1 = (Math.PI / 2) + (i * Math.PI / 3);
    const a2 = (Math.PI / 2) + ((i + 1) * Math.PI / 3);
    const v1 = { x: R * Math.cos(a1), y: -R * Math.sin(a1) };
    const v2 = { x: R * Math.cos(a2), y: -R * Math.sin(a2) };
    const c = { x: 0, y: 0 };
    const m1 = { x: (c.x + v1.x) / 2, y: (c.y + v1.y) / 2 };
    const m2 = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
    // 麻の葉の決定的な特徴: 各正三角形内に「中心点(g)」を作り、
    // m2からcenterへ線を引く (これで大三角形が2つに分かれる)
    lines.push({
      type: 'asanoha',
      from: m2,
      to: c,
    });
    // さらに v1とv2の中点から、隣接する辺の中点へ
  }
  return lines;
}

// 寸法線(矢印付き)コンポーネント — SVG用
function DimLine({ x1, y1, x2, y2, label, offset = 0, side = 'top', tickSize = 8 }) {
  // x1,y1 → x2,y2 の寸法線。offsetだけ垂直方向にずらす
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len; // 法線
  const ox = nx * offset, oy = ny * offset;
  const ax1 = x1 + ox, ay1 = y1 + oy;
  const ax2 = x2 + ox, ay2 = y2 + oy;
  // 矢印のサイズ
  const arrow = 6;
  const ux = dx / len, uy = dy / len;
  // ラベル位置(中央)
  const mx = (ax1 + ax2) / 2, my = (ay1 + ay2) / 2;
  // ラベルを線から少し離す
  const labelOffset = 10;
  const lx = mx + nx * labelOffset * (offset >= 0 ? 1 : -1) * 0;
  const ly = my;
  return (
    <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
      {/* 延長線 */}
      <line x1={x1} y1={y1} x2={ax1 + nx * 4} y2={ay1 + ny * 4} />
      <line x1={x2} y1={y2} x2={ax2 + nx * 4} y2={ay2 + ny * 4} />
      {/* 寸法線 */}
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} />
      {/* 矢じり (両端) */}
      <line x1={ax1} y1={ay1} x2={ax1 + ux * arrow + nx * arrow * 0.4} y2={ay1 + uy * arrow + ny * arrow * 0.4} />
      <line x1={ax1} y1={ay1} x2={ax1 + ux * arrow - nx * arrow * 0.4} y2={ay1 + uy * arrow - ny * arrow * 0.4} />
      <line x1={ax2} y1={ay2} x2={ax2 - ux * arrow + nx * arrow * 0.4} y2={ay2 - uy * arrow + ny * arrow * 0.4} />
      <line x1={ax2} y1={ay2} x2={ax2 - ux * arrow - nx * arrow * 0.4} y2={ay2 - uy * arrow - ny * arrow * 0.4} />
      {/* ラベル */}
      <text
        x={mx + nx * (offset >= 0 ? 12 : -12)}
        y={my + ny * (offset >= 0 ? 12 : -12)}
        fontSize="11"
        fontFamily={DRAW.mono}
        fill={DRAW.dimText}
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="none"
        style={{ paintOrder: 'stroke' }}
        strokeWidth="3"
        // background-mask
      >
        {label}
      </text>
    </g>
  );
}

// 単純化した水平/垂直寸法線(よりキレイ)
function HDim({ x1, x2, y, label, flip = false }) {
  const arrow = 5;
  const tick = 6;
  const labelY = flip ? y + 14 : y - 6;
  return (
    <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - tick} x2={x1} y2={y + tick} />
      <line x1={x2} y1={y - tick} x2={x2} y2={y + tick} />
      {/* 矢じり */}
      <polyline points={`${x1 + arrow},${y - 2.5} ${x1},${y} ${x1 + arrow},${y + 2.5}`} />
      <polyline points={`${x2 - arrow},${y - 2.5} ${x2},${y} ${x2 - arrow},${y + 2.5}`} />
      <text
        x={(x1 + x2) / 2}
        y={labelY}
        fontSize="10.5"
        fontFamily={DRAW.mono}
        fill={DRAW.dimText}
        textAnchor="middle"
        stroke="none"
      >{label}</text>
    </g>
  );
}

function VDim({ y1, y2, x, label, flip = false }) {
  const arrow = 5;
  const tick = 6;
  return (
    <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - tick} y1={y1} x2={x + tick} y2={y1} />
      <line x1={x - tick} y1={y2} x2={x + tick} y2={y2} />
      <polyline points={`${x - 2.5},${y1 + arrow} ${x},${y1} ${x + 2.5},${y1 + arrow}`} />
      <polyline points={`${x - 2.5},${y2 - arrow} ${x},${y2} ${x + 2.5},${y2 - arrow}`} />
      <text
        x={flip ? x + 8 : x - 8}
        y={(y1 + y2) / 2}
        fontSize="10.5"
        fontFamily={DRAW.mono}
        fill={DRAW.dimText}
        textAnchor={flip ? 'start' : 'end'}
        dominantBaseline="middle"
        stroke="none"
      >{label}</text>
    </g>
  );
}

// 引き出し線 (リーダーライン)
function Leader({ from, to, label, anchor = 'start', dy = 0 }) {
  return (
    <g stroke={DRAW.dim} strokeWidth={DRAW.dimStroke} fill="none">
      <circle cx={from.x} cy={from.y} r="1.6" fill={DRAW.dim} stroke="none" />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
      <text
        x={to.x + (anchor === 'start' ? 4 : -4)}
        y={to.y + dy}
        fontSize="10"
        fontFamily={DRAW.mono}
        fill={DRAW.dim}
        textAnchor={anchor}
        dominantBaseline="middle"
        stroke="none"
      >{label}</text>
    </g>
  );
}

// 北マーク
function NorthMark({ cx, cy, r = 22 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.thin} />
      <polygon
        points={`${cx},${cy - r + 3} ${cx - 4},${cy + 2} ${cx},${cy} ${cx + 4},${cy + 2}`}
        fill={DRAW.ink}
      />
      <polygon
        points={`${cx},${cy + r - 3} ${cx - 4},${cy - 2} ${cx},${cy} ${cx + 4},${cy - 2}`}
        fill="none"
        stroke={DRAW.ink}
        strokeWidth={DRAW.thin}
      />
      <text x={cx} y={cy - r - 4} fontSize="10" fontFamily={DRAW.mono} textAnchor="middle" fill={DRAW.ink}>N</text>
    </g>
  );
}

// タイトルブロック (右下のラベル)
function TitleBlock({ x, y, w, h, title, scale, sheet, project }) {
  return (
    <g fontFamily={DRAW.font} fill={DRAW.ink}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={DRAW.ink} strokeWidth={DRAW.med} />
      <line x1={x} y1={y + 22} x2={x + w} y2={y + 22} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
      <line x1={x} y1={y + h - 22} x2={x + w} y2={y + h - 22} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
      <line x1={x + w * 0.55} y1={y + 22} x2={x + w * 0.55} y2={y + h - 22} stroke={DRAW.ink} strokeWidth={DRAW.thin} />
      <text x={x + 8} y={y + 15} fontSize="10" fontFamily={DRAW.mono}>PROJECT</text>
      <text x={x + w - 8} y={y + 15} fontSize="10" fontFamily={DRAW.mono} textAnchor="end">{sheet}</text>
      <text x={x + 8} y={y + 38} fontSize="13" fontWeight="600">{project}</text>
      <text x={x + 8} y={y + 56} fontSize="11" fill="#444">{title}</text>
      <text x={x + w * 0.55 + 8} y={y + 38} fontSize="10" fontFamily={DRAW.mono}>SCALE</text>
      <text x={x + w * 0.55 + 8} y={y + 54} fontSize="12" fontFamily={DRAW.mono}>{scale}</text>
      <text x={x + 8} y={y + h - 7} fontSize="9" fontFamily={DRAW.mono} fill="#666">単位: mm  /  作図: 2026.04</text>
    </g>
  );
}

// 多角形を内側に縮小 — 各頂点を重心方向に「等距離」だけ動かす簡易版
// 三角形ピースで spike が出ないシンプルな方法。
// 注: 厳密な「辺オフセット」ではなく、辺方向の控除幅は近似になる。
// 目地100mmを正確に出すには、辺ごとの控除量を法線方向で再計算する必要があるが、
// 三角形では重心引き寄せでも見た目は十分整う。
function shrinkPolygon(pts, d) {
  // 重心
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  // 各頂点について、重心方向に dだけ移動
  // ただし「辺の中点が法線方向にちょうどd移動する」ようにスケール係数を求める
  // 三角形の場合: 内接円の中心は重心ではなく内心。簡略化のため、
  // 各頂点を重心へ向かうベクトルの単位方向に factor だけ移動
  // factor = d / sin(角度/2) のような補正が理想だが、ここでは三角形=正三角形に近いので
  // factor = d * 2 (経験則: 重心からの距離が辺中点の2倍であるため) で近似
  return pts.map(p => {
    const vx = cx - p.x, vy = cy - p.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len, uy = vy / len;
    // 二等辺三角形(辺3000-1732-1732)では、頂点の角度が約30°〜120°程度。
    // 内側に等距離移動だと辺の控除量が頂点ごとに違うが、
    // ピースが小さい(全体6000mmに対して目地100mm = 1.7%)ので視覚的には許容。
    // 最も鋭角な頂点でも spike が出ないように、移動量に上限を設ける。
    const move = Math.min(d * 2.0, len * 0.35);
    return { x: p.x + ux * move, y: p.y + uy * move };
  });
}

// 多角形を内側にオフセット (各辺を法線方向にdだけ内側へ移動)
// miter制限つき: 鋭角な頂点で spike が伸びすぎないようにクランプ
function insetPolygon(pts, d, miterLimit = 2.0) {
  const n = pts.length;
  const offsetEdges = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const ex = b.x - a.x, ey = b.y - a.y;
    const len = Math.hypot(ex, ey) || 1;
    let nx = -ey / len, ny = ex / len;
    offsetEdges.push({ a, b, nx, ny });
  }
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    area += (p2.x - p1.x) * (p2.y + p1.y);
  }
  const sign = area > 0 ? 1 : -1;
  const lines = offsetEdges.map(e => {
    const ox = e.nx * d * sign, oy = e.ny * d * sign;
    return {
      x1: e.a.x + ox, y1: e.a.y + oy,
      x2: e.b.x + ox, y2: e.b.y + oy,
    };
  });
  const newPts = [];
  for (let i = 0; i < n; i++) {
    const L1 = lines[(i - 1 + n) % n];
    const L2 = lines[i];
    const p = lineIntersect(L1, L2);
    const orig = pts[i];
    if (!p) { newPts.push(orig); continue; }
    // miter制限: 元の頂点からの移動距離が d * miterLimit を超えたらクランプ
    const dx = p.x - orig.x, dy = p.y - orig.y;
    const moveLen = Math.hypot(dx, dy);
    const maxMove = d * miterLimit;
    if (moveLen > maxMove && moveLen > 0) {
      newPts.push({
        x: orig.x + dx / moveLen * maxMove,
        y: orig.y + dy / moveLen * maxMove,
      });
    } else {
      newPts.push(p);
    }
  }
  return newPts;
}

function lineIntersect(L1, L2) {
  const x1 = L1.x1, y1 = L1.y1, x2 = L1.x2, y2 = L1.y2;
  const x3 = L2.x1, y3 = L2.y1, x4 = L2.x2, y4 = L2.y2;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

Object.assign(window, {
  DRAW, hexagonGeometry, asanohaPieces, asanohaLines,
  DimLine, HDim, VDim, Leader, NorthMark, TitleBlock,
  insetPolygon, shrinkPolygon,
});
