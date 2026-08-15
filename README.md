# AD切り

AD切りは、少数の広告・トラッカー系ドメインへの通信をデフォルトで遮断する小さなChrome拡張です。

ツールバーの緑色のアイコンは、現在のサイトで通信ブロックが有効であることを示します。アイコンを押すと、そのサイトをホワイトリストへ追加してブロックを解除し、灰色のアイコンへ切り替えます。もう一度押すとホワイトリストから削除してブロックを再開します。

右クリックの「設定」では、ホワイトリストの確認・削除と、遮断対象ドメインの編集ができます。

## 初期の対象ドメイン

- `doubleclick.net`
- `googlesyndication.com`

設定画面のtextareaで、1行につき1ドメインとして自由に変更できます。

## 意図的に実装していないもの

- ページ本文やDOMの読み取り・解析
- 閲覧履歴、広告ブロック統計、Telemetry、Analytics
- 外部API、リモートコード、リモート設定、Cloud Sync
- EasyList / EasyPrivacy、要素非表示、巨大なフィルターリスト
- AI機能

## Chromeに読み込む

```sh
npm install
npm run build
```

1. Chromeで `chrome://extensions` を開く
2. 「デベロッパー モード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」を選ぶ
4. このリポジトリの `dist` ディレクトリを指定する

## 開発とテスト

```sh
npm run dev       # distを監視ビルド
npm run check     # JSDoc型チェック、Unit Test、build
npm test          # Unit Test
```

## Permissions

| Permission | 理由 |
| --- | --- |
| `declarativeNetRequest` | 登録した対象ドメインへの広告・トラッカー系通信を遮断し、ホワイトリストのサイトでは許可するため |
| `storage` | 対象ドメインとホワイトリストのhostnameを端末内に保存するため |
| `tabs` | タブ切り替え・遷移時に現在のhostnameを確認し、サイトごとのアイコンを更新・クリック後に再読み込みするため |
| `contextMenus` | 拡張アイコンの右クリックに「設定」を1項目だけ表示するため |

`host_permissions`、Content Script、外部通信は使用しません。保存するのは対象ドメインとホワイトリストのhostnameだけで、パス、クエリ、ページタイトル、本文は保存しません。詳細は [PRIVACY.md](PRIVACY.md) を参照してください。
