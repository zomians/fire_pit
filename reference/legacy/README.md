# reference/legacy — 旧 claude design 成果物

本リポジトリを起こす前に claude design で一発制作された旧成果物の一部。**再現の参照元（RE 入力）**であり、真実の源ではない。技術構成は React 18 + Babel standalone（CDN）+ JSX で、本リポジトリの方針（vanilla JS・依存ゼロ → ADR-0001）とは異なる。

## ここにあるもの（選別して残した）
- `*.jsx` … 描画ロジック本体。`drawing-utils.jsx` の `hexagonGeometry` / `asanohaPieces` 等の**幾何計算が `lib/firepit.js` への移植元**。
  - `drawing-utils.jsx` 共通ユーティリティ（幾何・寸法線・表題欄）
  - `plan-view.jsx` A-01 平面図 / `section-view.jsx` A-02 断面 / `cutting-pattern.jsx` A-03 切り出し
  - `design-canvas.jsx` Figma 風キャンバス（React 専用・参照のみ）
- `設計図.html` … 旧ローダ（CDN 依存・参照のみ）。
- `uploads/` … 麻柄（意匠参照）・注記スクリーンショット。

## 捨てたもの（盲目移植しない方針で除外）
- `*-print.html`（A3 印刷ローダ）… 冗長。本リポジトリは A4・自前テンプレで作り直す。
- `麻の葉 FIRE PIT 設計図 (standalone).html`（1.3MB）… claude design 専用バンドルのブラックボックス。再生成可・人が編集できないため除外。
- 花ブロック関連（`hana-*.jsx` / `花ブロック設計図.html`）… **スコープ外**（→ 別案件 `hana_block`）。
- `.DS_Store` / `.thumbnail` … OS / ツールの生成物。

## 注意
- これらは**却下A案（琉球石灰岩 切り出し石）前提**の図を含む。材質・目地・下地の値は確定構成ではない（確定構成は ADR-0002・芝生目地案＝芝生帯＋洗い出し区画島）。
- 幾何（六角形・18区画・焚き火部）は意匠確定分なので移植対象。
