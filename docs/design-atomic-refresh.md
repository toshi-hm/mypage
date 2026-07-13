# UI刷新・Atomic Design設計

## コンセプト

デザインテーマは「Bright Studio」。明るいアイボリーを土台に、ブルー、シトラス、コーラルを役割別に使う。整然としたプロダクトUIの情報階層と、ポートフォリオらしい非対称レイアウトを共存させる。

- Page Flows / Mobbin の事例から、短い導線、明確な現在地、反復可能なカード構造を採用
- 均一なカードグリッドだけにせず、オフセット、変形した角丸、円形アクセントでリズムを作る
- 色、影、角丸、幅をデザイントークン化し、ライト・ダーク両テーマで意味を揃える
- Webフォントや画像を追加せず、表示性能と可読性を維持する

## Atomic Design

```text
src/components/
├── atoms/       # 単独で意味を持つ最小UI（TagList、ThemeToggle）
├── molecules/   # Atomとテキストを組み合わせた反復UI
│   ├── ArticleCard
│   ├── CareerItem
│   ├── LinkCard
│   ├── PageHeader
│   ├── SectionHeading
│   └── WorkCard
├── organisms/   # ページ横断または大きな独立セクション
│   ├── HomeHero
│   ├── SiteFooter
│   └── SiteHeader
└── islands/     # Astroの技術境界。対話・描画ロジックとStorybookを配置
```

`layouts` はテンプレート層、`pages` はコンテンツ取得とコンポーネントの組み合わせに限定する。色や余白などの共通判断は `global.css` のトークンに集約し、各Atomic componentはトークンだけを参照する。

## UX原則

1. 主要ページは共通のPageHeaderで目的を即座に伝える。
2. ヘッダーはスクロール中も現在地と主要導線を維持する。
3. 記事、制作物、リンクは見た目を区別し、コンテンツ種別を走査しやすくする。
4. 44px以上の操作領域、明示的なfocus、reduced motion、AA以上のコントラストを維持する。
5. モバイルでは装飾を減らし、情報順序と操作性を優先する。
