---
title: Chrome 拡張を作成しました
description: ページタイトルとURLをハイパーリンクにしてコピーできるChrome拡張機能「PageLink Copy Button」を作成しました。
pubDate: 2026-08-28
tags:
  - chrome-extension
  - typescript
  - wxt
---

## はじめに

ページタイトルとURLをハイパーリンクにしてコピーできるChrome拡張機能、[PageLink Copy Button](https://github.com/toshi-hm/pagelink-copy-button)を作成しました。

ページを開いたときに表示されるボタンをクリックすると、ページタイトルを表示文字列にしたリンクをクリップボードへコピーできます。

## できること

- ページ右下のボタンからページリンクをコピー
- ボタンをドラッグして好きな位置へ移動
- 右クリックメニューからページリンクをコピー
- ボタンの表示・非表示を切り替え

コピーに成功するとボタンの色が変わり、完了したことが分かるようになっています。ボタンの位置は保存されるため、使いやすい場所に配置しておけます。

## 技術構成

Bun、TypeScript、WXTを使って開発しています。Chrome MV3向けにビルドし、現在はChromeウェブストアではなく、ビルドした拡張機能を読み込んで利用する形にしています。

## おわりに

ソースコードとセットアップ方法は、[GitHubリポジトリ](https://github.com/toshi-hm/pagelink-copy-button)で公開しています。
