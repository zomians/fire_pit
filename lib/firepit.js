// firepit.js — 麻の葉 FIRE PIT パラメトリック幾何＋作図ユーティリティ
// C1: vanilla JS・依存ゼロ・ビルド工程なし（→ docs/adr/0001）。
// 旧 reference/legacy/drawing-utils.jsx / plan-view.jsx の React 実装を
// 素の vanilla 関数（SVG 文字列を返す）に書き換えて移植したもの。
//
// 唯一の入力（パラメータ）は R=3000（中心〜頂点）と fireR=500。
// 頂点 V1〜V6・18区画（S1-A〜S6-C）・焚き火部小六角形はすべて計算で導く。
//
// 公開 API（window.FirePit）:
//   hexagonGeometry(maxHeight)  外形六角形の寸法と頂点
//   hexVerts(R, cx, cy)          半径 R の point-up 六角形頂点（任意中心）
//   asanohaPieces(R)             18区画（中心原点・model 座標）
//   drawPlan(targetG, opts)      #figure(<g>) に A-01 平面図の本体を描く

(function (global) {
  'use strict';

  // 図面スタイル定数（template.html の CSS 変数と同値）。
  // SVG text には CSS 変数 var(--mono)/var(--sans) が継承されるため font はそれを使う。
  var STYLE = {
    ink: '#1a1a1a',
    paper: '#f5f1e8',
    dim: '#1a1a1a',
    thin: 0.6,
    med: 1.0,
    thick: 1.6,
    dimStroke: 0.5,
    sans: 'var(--sans)',
    mono: 'var(--mono)',
  };

  // ---- 幾何 ---------------------------------------------------------------

  // 正六角形(point-up)。全高 = 2R, 全幅 = √3R, 一辺 = R。
  // 角度は 90°(上)から 60° ずつ。SVG は y 下向きなので y = -R·sinθ。
  function hexagonGeometry(maxHeight) {
    maxHeight = maxHeight || 6000;
    var R = maxHeight / 2;
    var W = Math.sqrt(3) * R;
    var H = 2 * R;
    var side = R;
    var verts = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 2 + i * Math.PI / 3;
      verts.push({
        x: R * Math.cos(a),
        y: -R * Math.sin(a),
        label: 'V' + (i + 1),
      });
    }
    return { R: R, W: W, H: H, side: side, verts: verts };
  }

  // 半径 R の point-up 六角形頂点を任意中心 (cx,cy) で返す（焚き火部などに流用）。
  function hexVerts(R, cx, cy) {
    cx = cx || 0; cy = cy || 0;
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 2 + i * Math.PI / 3;
      pts.push({ x: cx + R * Math.cos(a), y: cy - R * Math.sin(a) });
    }
    return pts;
  }

  // 麻の葉 18区画。中心原点の model 座標。
  // 六角形を6つの正三角形(セクター)に分け、各セクターを重心スポークで A/B/C に3分割。
  //   A=(中心,Vi,g) / B=(Vi,Vi+1,g) / C=(Vi+1,中心,g)   g=セクター重心
  function asanohaPieces(R) {
    var pieces = [];
    for (var i = 0; i < 6; i++) {
      var a1 = Math.PI / 2 + i * Math.PI / 3;
      var a2 = Math.PI / 2 + (i + 1) * Math.PI / 3;
      var c = { x: 0, y: 0 };
      var v1 = { x: R * Math.cos(a1), y: -R * Math.sin(a1) };
      var v2 = { x: R * Math.cos(a2), y: -R * Math.sin(a2) };
      var g = { x: (c.x + v1.x + v2.x) / 3, y: (c.y + v1.y + v2.y) / 3 };
      var s = i + 1;
      pieces.push({ sector: s, sub: 'A', label: 'S' + s + '-A', pts: [c, v1, g] });
      pieces.push({ sector: s, sub: 'B', label: 'S' + s + '-B', pts: [v1, v2, g] });
      pieces.push({ sector: s, sub: 'C', label: 'S' + s + '-C', pts: [v2, c, g] });
    }
    return pieces;
  }

  // ---- SVG 文字列ヘルパ ----------------------------------------------------

  function n(v) { return Math.round(v * 100) / 100; }          // 座標を 2桁丸め
  function ptsAttr(pts) { return pts.map(function (p) { return n(p.x) + ',' + n(p.y); }).join(' '); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function poly(pts, attrs) {
    return '<polygon points="' + ptsAttr(pts) + '" ' + (attrs || '') + '/>';
  }
  function line(x1, y1, x2, y2, attrs) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" ' + (attrs || '') + '/>';
  }
  function text(x, y, str, attrs) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" ' + (attrs || '') + '>' + esc(str) + '</text>';
  }

  // ---- 作図部品（寸法線・北マーク・凡例・注記） ----------------------------

  // 水平寸法線（端は外向きの矢じり）。flip=true でラベルを下に。
  function hDim(x1, x2, y, label, flip) {
    var arrow = 5, tick = 6;
    var labelY = flip ? y + 14 : y - 6;
    var s = '<g stroke="' + STYLE.dim + '" stroke-width="' + STYLE.dimStroke + '" fill="none">';
    s += line(x1, y, x2, y);
    s += line(x1, y - tick, x1, y + tick);
    s += line(x2, y - tick, x2, y + tick);
    s += '<polyline points="' + n(x1 + arrow) + ',' + n(y - 2.5) + ' ' + n(x1) + ',' + n(y) + ' ' + n(x1 + arrow) + ',' + n(y + 2.5) + '"/>';
    s += '<polyline points="' + n(x2 - arrow) + ',' + n(y - 2.5) + ' ' + n(x2) + ',' + n(y) + ' ' + n(x2 - arrow) + ',' + n(y + 2.5) + '"/>';
    s += text((x1 + x2) / 2, labelY, label, 'font-size="10.5" font-family="' + STYLE.mono + '" fill="' + STYLE.dim + '" text-anchor="middle" stroke="none"');
    s += '</g>';
    return s;
  }

  // 垂直寸法線。flip=true でラベルを右に。
  function vDim(y1, y2, x, label, flip) {
    var arrow = 5, tick = 6;
    var s = '<g stroke="' + STYLE.dim + '" stroke-width="' + STYLE.dimStroke + '" fill="none">';
    s += line(x, y1, x, y2);
    s += line(x - tick, y1, x + tick, y1);
    s += line(x - tick, y2, x + tick, y2);
    s += '<polyline points="' + n(x - 2.5) + ',' + n(y1 + arrow) + ' ' + n(x) + ',' + n(y1) + ' ' + n(x + 2.5) + ',' + n(y1 + arrow) + '"/>';
    s += '<polyline points="' + n(x - 2.5) + ',' + n(y2 - arrow) + ' ' + n(x) + ',' + n(y2) + ' ' + n(x + 2.5) + ',' + n(y2 - arrow) + '"/>';
    s += text(flip ? x + 8 : x - 8, (y1 + y2) / 2, label,
      'font-size="10.5" font-family="' + STYLE.mono + '" fill="' + STYLE.dim + '" text-anchor="' + (flip ? 'start' : 'end') + '" dominant-baseline="middle" stroke="none"');
    s += '</g>';
    return s;
  }

  // 任意の辺に沿った寸法線（一辺 3000 用）。a,b は端点(描画座標)、off はオフセット量。
  // 法線は (refx,refy)=図形中心 から見て外側を向くよう自動反転する。
  function edgeDim(a, b, label, off, refx, refy) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    // 辺中点が中心から向く向きと法線の内積が負なら反転 → 常に外側を向く
    var mx0 = (a.x + b.x) / 2, my0 = (a.y + b.y) / 2;
    if (nx * (mx0 - refx) + ny * (my0 - refy) < 0) { nx = -nx; ny = -ny; }
    var ax1 = a.x + nx * off, ay1 = a.y + ny * off;
    var ax2 = b.x + nx * off, ay2 = b.y + ny * off;
    var mx = (ax1 + ax2) / 2, my = (ay1 + ay2) / 2;
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var lx = mx + nx * 12, ly = my + ny * 12;
    var s = '<g stroke="' + STYLE.dim + '" stroke-width="' + STYLE.dimStroke + '" fill="none">';
    s += line(a.x, a.y, a.x + nx * (off + 4), a.y + ny * (off + 4));
    s += line(b.x, b.y, b.x + nx * (off + 4), b.y + ny * (off + 4));
    s += line(ax1, ay1, ax2, ay2);
    s += text(lx, ly, label,
      'font-size="10.5" font-family="' + STYLE.mono + '" fill="' + STYLE.dim + '" text-anchor="middle" dominant-baseline="middle" stroke="none" transform="rotate(' + n(ang) + ' ' + n(lx) + ' ' + n(ly) + ')"');
    s += '</g>';
    return s;
  }

  // 北マーク（上向き＝N）。
  function northMark(cx, cy, r) {
    r = r || 24;
    var s = '<g>';
    s += '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="none" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thin + '"/>';
    s += '<polygon points="' + n(cx) + ',' + n(cy - r + 3) + ' ' + n(cx - 4) + ',' + n(cy + 2) + ' ' + n(cx) + ',' + n(cy) + ' ' + n(cx + 4) + ',' + n(cy + 2) + '" fill="' + STYLE.ink + '"/>';
    s += '<polygon points="' + n(cx) + ',' + n(cy + r - 3) + ' ' + n(cx - 4) + ',' + n(cy - 2) + ' ' + n(cx) + ',' + n(cy) + ' ' + n(cx + 4) + ',' + n(cy - 2) + '" fill="none" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thin + '"/>';
    s += text(cx, cy - r - 4, 'N', 'font-size="10" font-family="' + STYLE.mono + '" text-anchor="middle" fill="' + STYLE.ink + '"');
    s += '</g>';
    return s;
  }

  // 凡例（意匠確定分のみ。材質は構成未確定のため載せない）。
  function legend(x, y) {
    var w = 196, lineX1 = 12, lineX2 = 40, tx = 50;
    var s = '<g transform="translate(' + n(x) + ' ' + n(y) + ')" font-family="' + STYLE.sans + '" fill="' + STYLE.ink + '">';
    s += '<rect x="0" y="0" width="' + w + '" height="120" fill="' + STYLE.paper + '" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thin + '"/>';
    s += text(12, 20, '凡例 LEGEND', 'font-size="11" font-weight="600"');
    s += line(12, 28, w - 12, 28, 'stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thin + '"');
    var rows = [
      { sw: STYLE.thick, t: '外形線（正六角形 R=3000）' },
      { sw: STYLE.med, t: '区画分割線（重心スポーク）' },
      { sw: STYLE.thick, t: '焚き火部 ⌀1000' },
      { sw: STYLE.dimStroke, t: '寸法線', dim: true },
    ];
    var ry = 44;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      s += line(lineX1, ry, lineX2, ry, 'stroke="' + (r.dim ? STYLE.dim : STYLE.ink) + '" stroke-width="' + r.sw + '"');
      s += text(tx, ry + 3.5, r.t, 'font-size="9.5"');
      ry += 18;
    }
    s += '</g>';
    return s;
  }

  // 注記（DESIGN.md と同期。③ は構成依存のため A-01 では省略 → ①②④）。
  function notes(x, y) {
    var w = 300, h = 72;
    var s = '<g font-family="' + STYLE.mono + '" fill="' + STYLE.ink + '">';
    s += '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h + '" fill="' + STYLE.paper + '" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thin + '"/>';
    s += text(x + 10, y + 16, 'NOTES 注記', 'font-size="10" font-weight="600" fill="#222"');
    var lines = [
      '1) 全寸法 mm 単位。中心線より対称配置。',
      '2) 麻の葉文様 = 6セクター × 3分割 = 計18区画。',
      '4) 天端と周囲芝生面を面一 (GL±0)。',
    ];
    var ly = y + 32;
    for (var i = 0; i < lines.length; i++) {
      s += text(x + 10, ly, lines[i], 'font-size="9" fill="#333"');
      ly += 12;
    }
    s += '</g>';
    return s;
  }

  // ---- A-01 平面図本体 -----------------------------------------------------

  // targetG: 描画先 <g>（template の #figure）。
  // opts: { maxHeight=6000, fireR=500, cx, cy, scale } いずれも省略可。
  function drawPlan(targetG, opts) {
    opts = opts || {};
    var maxHeight = opts.maxHeight || 6000;
    var fireR = opts.fireR != null ? opts.fireR : 500;
    var scale = opts.scale || 0.084;          // mm → SVG px（A4 シート 1080×760 に収める）
    var cx = opts.cx != null ? opts.cx : 370;
    var cy = opts.cy != null ? opts.cy : 388;

    var geo = hexagonGeometry(maxHeight);
    var Wd = geo.W * scale, Hd = geo.H * scale;

    // model 座標 → 描画座標
    function P(p) { return { x: cx + p.x * scale, y: cy + p.y * scale }; }
    var verts = geo.verts.map(P);                          // V1..V6（描画座標）
    var pieces = asanohaPieces(geo.R);
    var fireVerts = hexVerts(fireR * scale, cx, cy);       // 焚き火部小六角形（描画座標）

    var svg = '';

    // タイトル（左上）
    svg += '<g font-family="' + STYLE.sans + '" fill="' + STYLE.ink + '">';
    svg += text(50, 58, '平面図 PLAN', 'font-size="18" font-weight="600"');
    svg += text(50, 76, '麻の葉文様 ファイヤーピット — 縮尺 S=1:50', 'font-size="11" fill="#444"');
    svg += '</g>';

    // 18区画（重心スポークによる分割線つき）。意匠のみ＝紙地塗り。
    for (var i = 0; i < pieces.length; i++) {
      var dp = pieces[i].pts.map(P);
      svg += poly(dp, 'fill="' + STYLE.paper + '" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.med + '" stroke-linejoin="miter"');
    }

    // 外形六角形（太線で強調）
    svg += poly(verts, 'fill="none" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thick + '"');

    // 焚き火部（中央くり抜き）
    svg += poly(fireVerts, 'fill="' + STYLE.paper + '" stroke="' + STYLE.ink + '" stroke-width="' + STYLE.thick + '"');

    // === 寸法線 ===
    // 全高 6000（左・縦）
    svg += vDim(verts[0].y, verts[3].y, cx - Wd / 2 - 46, '6000');
    // 全幅 5196（上・横）
    svg += hDim(cx - Wd / 2, cx + Wd / 2, verts[0].y - 30, '5196');
    // 一辺 3000（右上の辺 V1–V6）。法線は外形中心基準で外側へ。
    svg += edgeDim(verts[0], verts[5], '3000', 30, cx, cy);
    // 焚き火部 ⌀1000（中央・横）
    svg += hDim(cx - fireR * scale, cx + fireR * scale, cy - fireR * scale - 12, '⌀1000');

    // 北マーク・凡例・注記
    svg += northMark(992, 92, 24);
    svg += legend(844, 150);
    svg += notes(40, 648);

    targetG.innerHTML = svg;
  }

  global.FirePit = {
    STYLE: STYLE,
    hexagonGeometry: hexagonGeometry,
    hexVerts: hexVerts,
    asanohaPieces: asanohaPieces,
    drawPlan: drawPlan,
  };
})(window);
