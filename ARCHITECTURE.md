# ARCHITECTURE — 構造と作り

## 全体構造
```
BRIEF.md  CONTEXT.md  ARCHITECTURE.md  DESIGN.md  README.md
docs/adr/                 個別決定の記録（例: vanilla JS 採用）
reference/
  legacy/                 旧 claude design 成果物（RE 入力 = 再現の参照元）
    *.jsx                   描画ロジック本体（hexagonGeometry 等の幾何はここから移植）
    設計図.html             旧ローダ（CDN/React。参照専用）
    uploads/                麻柄・注記スクショ
    README.md               何を残し何を捨てたか（provenance）
template/
  template.html           図面シートのコピー元（図面枠＋表題欄＋vanilla JS フック。CSS インライン）
lib/
  firepit.js              パラメトリック幾何＋作図ユーティリティ（vanilla JS・依存ゼロ）
sheets/                   各図面シート（template を複製し lib を参照）
  a-01-plan.html
  a-02-section.html       （構成決定後）
  a-03-detail.html        （構成決定後）
```

## 技術方針（C1 — vanilla JS・依存ゼロ・パラメトリック）
- **React / Babel / CDN を使わない。** 各図面は自己完結の HTML で、読込時に**素の vanilla JS** が幾何を計算して SVG を生成する。外部依存はフォント（Google Fonts）のみ。
- **パラメトリックを維持。** 六角形 R＝3000、焚き火半径＝500 などを唯一の入力とし、頂点・18区画・焚き火部を計算で導く（手で座標を打たない）。幾何は旧 `drawing-utils.jsx` の `hexagonGeometry` 等をそのまま vanilla 化して `lib/firepit.js` に移植。
- **共有は `lib/firepit.js` に1本化**し、各シートが相対 `<script src="../lib/firepit.js">`（classic script）で読む。`file://` で開いて印刷できる。
- **ビルド工程なし。** ブラウザで開けばそのまま描画・印刷できる。
- 決定根拠は ADR-0001。

## 命名規則
- 図面シート: `sheets/a-0N-<役割>.html`（例: `a-01-plan.html`）。単体で開いて何の図か分かる自己説明的な名前。
- 共有ライブラリ: `lib/firepit.js`。
- ADR: `docs/adr/000N-<topic>.md`。

## 真実の源
- **寸法・割付・決定**は docs（BRIEF / DESIGN / ADR）に。
- **パラメトリック幾何・作図部品**は `lib/firepit.js` に。
- **図面シート**は template を複製し、lib を呼んで本体 SVG を生成する薄い殻。
- 旧成果物 `reference/legacy/` は**参照（再現の照合先）**であって源ではない。

## hana_block（姉妹案件）からの意図的な逸脱
本リポジトリは hana_block の doc 構成・図面シート方針を雛形に流用するが、以下を意図的に変える:
- hana_block は「**生成器を作らない・1ファイル完全自己完結・手作図**」。fire_pit は焚き火台の幾何が3シートで反復するため、**パラメトリック幾何を共有 `lib/` に持つ**（C1）。CDN/ビルドなしの原則は踏襲。
- 構造単位: hana_block は `patterns/<slug>/`（意匠×サイズ）。fire_pit は単一成果物のため `sheets/<sheet>`。

## 工程
**① 意匠の幾何を `lib/firepit.js` に確定** → **② A-01 平面図を template+lib で起こす**（意匠確定分で先行可）→ **③ 構成要素（材料・工法）を決定**（→ ADR）→ **④ A-02 断面・A-03 構成詳細を構成に従って起こす**。

## 将来の再検討点（C2）
図面数が増える／量産・多バリエーション化する場合は、オフライン生成スクリプト（Node → 静的 SVG をコミット）への移行を再検討する。現時点ではオーバースペック。
