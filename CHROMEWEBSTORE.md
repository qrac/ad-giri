# Chrome Web Store Listing — AD斬り

> Last Updated: 2026-08-15

## Store Listing

- Extension Name: AD斬り
- Short Description: 広告・トラッカー系通信をデフォルトで斬り、サイトごとにワンクリックで解除します。
- Category: Productivity
- Single Purpose: 登録した広告・トラッカー系ドメインへの通信を遮断し、サイト単位のホワイトリストで解除する。
- Primary Language: Japanese

### Detailed Description

AD斬りは、登録した広告・トラッカー系ドメインへの通信をデフォルトで遮断する小さなChrome拡張です。

緑色のアイコンは通信ブロックが有効な状態です。現在のサイトでアイコンを押すと、そのサイトをホワイトリストへ追加してブロックを解除します。灰色のアイコンをもう一度押すとブロックを再開します。

設定画面ではホワイトリストの確認・個別削除と、遮断対象ドメインの編集ができます。

ページ本文やDOMは読み取りません。閲覧履歴、Telemetry、Analyticsを収集せず、外部サーバーへデータを送信しません。

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
| --- | --- | --- | --- |
| Store Icon | 128×128 PNG | Ready | `icons/on/icon-128.png` |
| Screenshot 1 | 1280×800 PNG | Ready | `store-assets/screenshot-1.png` |

## Permissions Justification

| Permission | Type | Justification |
| --- | --- | --- |
| `declarativeNetRequest` | permissions | ユーザーが登録した広告・トラッカー系ドメインへの通信を遮断し、ホワイトリストのサイトでは通信を許可するため。ページ本文は読み取らない。 |
| `storage` | permissions | 遮断対象ドメインとホワイトリストのhostnameだけを端末内に保存し、ブラウザ再起動後も設定を維持するため。 |
| `tabs` | permissions | タブ切り替え・ページ遷移時に現在のhostnameを確認してサイトごとのアイコン状態を表示し、クリックで設定変更したタブを再読み込みするため。ページ本文は読み取らない。 |
| `contextMenus` | permissions | 拡張アイコンの右クリックメニューに設定ページへの入口を1つ表示するため。 |

`host_permissions` は使用しない。

## Privacy & Data Use

- User data collection: No
- 遮断対象ドメインとホワイトリストのhostnameは機能設定として端末内にのみ保存し、外部送信しない
- ページ内容、閲覧履歴、個人情報、Telemetry、Analyticsを収集しない
- データを販売・第三者共有・信用判断に利用しない
- Privacy Policy: 公開前に `PRIVACY.md` を公開URLへ配置して記入する

### Data Use Certification

- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Distribution

- Visibility: Public
- Regions: All regions

## Developer Info

- Publisher Name: Qrac
- Contact Email: 公開前に記入
- Support URL: https://github.com/qrac/ad-giri/issues
- Homepage URL: https://github.com/qrac/ad-giri

## Version History

| Version | Date | Changes | Status |
| --- | --- | --- | --- |
| 1.0.0 | 2026-08-15 | Initial implementation | Draft |

## Pre-publish Checklist

- [x] `manifest.json` のname、version、descriptionを確認する
- [x] 全permissionが実装に必要で、上記説明と一致することを確認する
- [ ] `PRIVACY.md` を公開URLへ配置し、Dashboardの開示内容と一致させる
- [ ] 16 / 32 / 48 / 128pxアイコンを実機で確認する
- [x] 1280×800の正確なスクリーンショットを1枚以上用意する
- [x] Store descriptionと実装機能が一致することを確認する
- [x] `npm run check` と `npm test` を実行する
- [ ] unpacked extensionを手動確認する
- [ ] 公開者の連絡先とPrivacy Policy URLをDashboardで記入する

現時点では公開・申請を行わない。
