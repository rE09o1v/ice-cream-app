# 🍦 アイスクリーム注文アプリ (BlueRush|ブルーラッシュ)
このREADMEファイルは`2025/6/25`に更新されました

## 📋 パッチノート（更新履歴）

### v1.8.1 - 2025/6/25 (最新)
#### 🐛 バグ修正
- **商品詳細ページのスクロール位置修正**: 商品一覧でスクロールした位置が商品詳細ページに引き継がれてしまう問題を修正。商品詳細ページ遷移時に自動的に最上部にスクロールするように改善

#### 🎨 UI/UX改善
- **商品詳細ページの初期表示**: 商品情報（名前、説明、栄養成分など）が常に最初に表示されるようになり、ユーザビリティが向上

### v1.8.0 - 2025/6/25
#### ✨ 新機能
- **安全なデータリセット機能**: 商品データを保持して注文データと売上データのみをリセット
- **自動バックアップ機能**: リセット実行時に自動的にバックアップを作成
- **データ復元機能**: バックアップから注文データを復元可能
- **実行者記録機能**: リセット・復元の実行者名と時刻を記録
- **復元履歴の管理**: 復元操作の詳細な記録を保持

#### 🎨 UI/UX改善
- **管理画面レイアウト改善**: モバイル版の不自然な隙間を解消し、3行2列のきれいなグリッドレイアウトに変更
- **PC版ボタン整理**: 古い「全データリセット」ボタンを削除し、新機能に対応した統一されたボタン配置
- **新しいモーダルデザイン**: リセット確認と復元選択のための専用モーダルを追加

#### 🛡️ 安全性向上
- **商品データ保護**: 追加した商品や編集内容が失われることを防止
- **トレーサビリティ**: 全ての重要操作に実行者名と実行時刻を記録
- **復旧可能性**: バックアップによりデータ復元が可能

### v1.7.0 - 2025/6/25
#### ✨ 新機能
- **商品説明の編集機能**: 商品管理画面で詳細な商品説明を入力・編集可能
- **栄養成分情報の表示・編集**: 1個あたりの栄養成分情報を入力して商品詳細ページで表示
- **アレルゲン情報の表示・編集**: アレルゲン情報を入力して警告マーク付きで表示
- **商品詳細ページの情報充実**: 説明文、栄養成分、アレルゲン情報を色分けされたカードで表示

#### 🎨 UI/UX改善  
- **商品管理画面の改善**: 商品一覧カードで説明文の短縮版を表示して概要を把握しやすく改善
- **商品詳細ページのレイアウト向上**: 情報を整理してより見やすい構成に変更
- **サイトのURLを編集**: サイトのURLを`ice-cream-app-seven.vercel.app`から`bluerush.vercel.app`に変更
- **サイト名を変更**: サイト名を`1-F_BlueSeal`から`BlueRush Store | ブルーラッシュ`に変更

#### 🛠️ データベース拡張
- **商品データ構造の拡張**: `description`、`nutrition`、`allergens` フィールドを追加
- **初期データの充実**: 4商品（バニラ、チョコ、いちご、抹茶）すべてに詳細情報を追加

### v1.6.0 - 2025/6/24
#### 🐛 バグ修正
- **注文取り消しエラー修正**: Firestoreトランザクションの読み取り・書き込み順序を修正し、管理画面と整理券ページからの注文取り消しが正常に動作するように改善

#### 🎨 UI/UX改善
- **QRスキャナーのカメラ選択UI改善**: スマホでカメラ選択時の文字色を濃く、見やすいスタイルに変更
- **QRコード読み取り画面の視認性向上**: 注文時刻と商品詳細の文字を太字・濃色に変更してモバイルでの可読性を向上
- **代理注文UI大幅改善**: 選択中商品の一覧表示、視覚的フィードバック、商品詳細の明確化
- **モバイル管理画面の整理**: 対応中注文での不要な「代理」ラベルを削除してすっきりとした表示に改善

#### ✨ 新機能
- **管理画面での商品詳細表示**: 注文一覧で各注文の商品名と個数を詳細表示
- **代理注文の選択状態可視化**: 選択中の商品がリアルタイムで確認できる専用エリアを追加

### v1.5.0 - 2025/6/24
#### ✨ 新機能
- **代理注文機能**: スマートフォン非対応のお客様向けの代理注文システムを実装
- **管理画面からの直接完了機能**: QRコード読み取りを使わずに注文を完了状態にする機能を追加
- **全データリセット機能**: テスト用途でのデータ完全リセット機能を実装

#### 🎨 UI/UX改善
- **モバイル対応強化**: 白文字の視認性問題を修正（入力フィールドとエラーメッセージの色調整）

### v1.4.0 - 2025/6/24
#### ✨ 新機能
- **受け渡し完了時の感謝メッセージ**: QRコード読み取り完了時に専用の感謝ページを表示
- **整理券の再表示機能**: URLコピー機能で後から整理券を再表示可能
- **注文取り消し機能（お客様側）**: 整理券ページから注文を取り消し可能、在庫も自動復元

#### 🎨 UI/UX改善
- **感謝ページのデザイン調整**: 商品個数を緑色、合計金額ラベルを黒色に変更
- **リアルタイム画面遷移**: Firestoreの更新により自動的に適切なページに遷移

#### 🐛 バグ修正
- **再表示整理券の問題修正**: URLパラメータからの再表示時の注文ステータス確認を改善

### v1.3.0 - 2025/6/23
#### ✨ 新機能
- **画像アップロード機能**: Firebase Storageを使用した商品画像のアップロード・管理機能を実装
- **注文取り消し機能（スタッフ側）**: 管理画面で対応中注文を取り消し可能、在庫自動復元機能付き

#### 🎨 UI/UX改善
- **商品管理画面の改善**: 画像プレビュー、アップロード進捗表示、エラーハンドリングを追加

### v1.2.0 - 2025/6/23
#### 🐛 バグ修正
- **売上計算の修正**: 注文段階ではなく完了済み注文のみを売上に計上するよう変更
- **QRスキャナーの重複表示問題修正**: useEffectの依存関係を空配列に設定して修正

#### 🎨 UI/UX改善
- **管理画面表示の改善**: 「完了済み注文の売上」表示に変更して明確化

### v1.1.0 - 2025/6/23
#### ✨ 新機能
- **基本的な注文システム**: 商品選択、カート機能、整理券表示
- **QRコード読み取り機能**: スタッフ向けのQRスキャナー実装
- **管理画面**: 売上、在庫、注文管理のダッシュボード
- **商品管理機能**: 商品の追加・編集・削除、在庫管理

#### 🏗️ 技術基盤
- **Firebase統合**: Firestore、Storage、リアルタイム更新機能
- **Next.js + Tailwind CSS**: モダンなフロントエンド構成
- **モバイル対応**: レスポンシブデザインの実装

---

## 概要

このアプリは、アイスクリーム店での注文から商品受け渡しまでをデジタル化した注文システムです。お客様が商品を選択して注文し、整理券を受け取り、スタッフがQRコードを読み取って商品を受け渡すまでの一連の流れを管理できます。

## 主な機能

### お客様向け機能
- 🛒 **商品選択・注文**: 商品カタログからアイスクリームを選択して注文、商品詳細ページで説明・栄養成分・アレルゲン情報を確認可能
- 📱 **整理券表示**: QRコード付きの整理券を表示
- 🔄 **整理券再表示**: 整理券URLをコピーして後で再表示可能
- ❌ **注文取り消し**: 整理券ページから注文を取り消し可能（在庫も自動的に戻る）
- ✅ **受け渡し完了通知**: 商品受け渡し完了時に感謝メッセージを表示

### スタッフ向け機能
- 📊 **ダッシュボード**: 売上、在庫状況、注文状況をリアルタイム表示
- 📷 **QRコード読み取り**: お客様の整理券をスキャンして注文確認
- 📦 **商品管理**: 商品の追加・編集・削除、在庫管理、商品説明・栄養成分・アレルゲン情報の編集
- 🖼️ **画像アップロード**: Firebase Storageを使用した商品画像のアップロード・管理(6/23追加)
- 👥 **代理注文**: スマートフォン非対応のお客様向け代理注文機能(6/24追加)
- ✅ **受け渡し完了**: 管理画面から直接注文を完了状態にする機能(6/24追加)
- ❌ **注文取り消し**: 対応中の注文を取り消し可能
- 🔄 **安全なデータリセット**: 商品データを保持して注文・売上データのみをリセット(6/25追加)
- 💾 **バックアップ・復元**: 自動バックアップ作成とデータ復元機能(6/25追加)
- 📝 **実行者記録**: リセット・復元操作の実行者名と時刻を記録(6/25追加)

## セットアップ

### 1. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestore Databaseを有効化
3. **Firebase Storageを有効化**（画像アップロード機能のため）
4. Webアプリを追加して設定情報を取得
5. `src/app/page.js` の `firebaseConfig` を実際の設定に更新

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Firebase Storage設定

1. Firebase Consoleで「Storage」を選択
2. 「ルール」タブで以下のセキュリティルールを設定：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      allow read: if true;  // 誰でも読み取り可能
      allow write: if request.auth != null || true;  // 開発中は誰でも書き込み可能
    }
  }
}
```

**注意**: 本番環境では適切な認証ルールを設定してください。

### 3. 依存関係のインストール

```bash
npm install
```

### 4. アプリの起動

```bash
npm run dev
```

## 使い方

### お客様の利用方法

#### 1. 商品選択・注文
1. アプリを開く（デフォルトで注文ページが表示）
2. 商品カードから欲しいアイスクリームの「詳細を見る」ボタンをタップ
3. 商品詳細ページで商品説明、栄養成分、アレルゲン情報を確認
4. 数量を選択して「カートに入れる」ボタンをタップ
5. 成功メッセージが表示され、自動的に商品一覧に戻る
6. カートアイコンをタップして注文内容を確認
7. 「注文を確定して整理券を受け取る」ボタンをタップ

#### 2. 整理券の確認
- 整理番号とQRコードが表示されます
- 商品受け取り時にこの画面をスタッフに見せてください
- 「整理券URLをコピー」ボタンでURLを保存できます
- 「注文を取り消す」ボタンで注文を取り消すことができます（取り消し後は元に戻せません）

#### 3. 整理券の再表示
- コピーしたURLをブックマークまたはメモに保存しておくと、後で整理券を再表示できます
- 再表示時は注文ステータスに応じて適切なページが表示されます：
  - **対応中**: 整理券ページが表示され、QRコード読み取りを待機
  - **完了済み**: 感謝メッセージページが表示される
  - **取り消し済み**: 注文ページに戻り、取り消し通知が表示される

#### 4. 商品受け取り
- スタッフがQRコードを読み取ると、自動的に感謝メッセージページに切り替わります
- 「新しい注文をする」ボタンで再度注文できます

#### 5. 注文取り消し
- 整理券ページで「注文を取り消す」ボタンをタップ
- 確認ダイアログで「OK」を選択
- 取り消し後は在庫も自動的に戻され、注文ページに戻ります
- **注意**: 取り消し後は元に戻せません

### スタッフの利用方法

#### 1. 管理画面へのアクセス
1. ヘッダーの「管理」タブをタップ
2. パスワードを入力（デフォルト: `staff1fstd`）
3. 管理画面にアクセス

#### 2. ダッシュボードの確認
- **全体の売上**: 完了済み注文の合計売上を表示
- **在庫状況**: 各商品のリアルタイム在庫数を表示
- **注文状況**: 対応中・完了・取り消しの注文数を表示
- **最新注文一覧**: 最新10件の注文を表示

#### 3. QRコード読み取り
1. 「QRスキャン」ボタンをタップ
2. お客様の整理券のQRコードをカメラにかざす
3. 注文内容を確認
4. 「受け渡し完了」ボタンをタップ

#### 4. 商品管理
1. 「商品管理」ボタンをタップ
2. 商品の追加・編集・削除が可能
3. 在庫数の調整も可能
4. 商品説明、栄養成分情報、アレルゲン情報の編集が可能
   - **商品説明**: 商品の詳細な説明文を入力
   - **栄養成分**: 1個あたりの栄養成分情報を入力
   - **アレルゲン情報**: 含まれるアレルゲンを入力

#### 5. 画像アップロード機能
- **画像選択**: 「画像を選択」ボタンから商品画像をアップロード
- **対応形式**: JPEG、PNG、WebP（5MB以下）
- **プレビュー**: アップロード前に画像プレビューを表示
- **自動削除**: 商品削除時に画像も自動的に削除
- **代替入力**: 画像URLを直接入力することも可能

#### 6. 代理注文
1. 「代理注文」ボタンをタップ
2. 商品を選択して数量を指定
3. 「注文確定」ボタンで代理注文を作成
4. 代理注文には「代理」ラベルが表示される

#### 7. 受け渡し完了
- 最新注文一覧で「対応中」の注文に「受け渡し完了」ボタンが表示
- QRコード読み取りを使わずに直接完了処理が可能
- 代理注文の場合は特にこの機能を使用

#### 8. 注文取り消し
- 最新注文一覧で「対応中」の注文に「取り消し」ボタンが表示
- 取り消し時は在庫も自動的に戻されます

#### 9. 安全なデータリセット（v1.8.0で改良）
1. 「注文データリセット」ボタンをタップ
2. 実行者名を入力（必須）
3. リセット内容を確認して実行
- **リセット内容**: 注文データと売上データのみをリセット（商品データは保持）
- **自動バックアップ**: 実行前に自動的にバックアップを作成
- **実行者記録**: 実行者名と時刻を記録
- **注意**: 商品データ（商品名、価格、説明文など）は保持されます

#### 10. データ復元機能（v1.8.0で追加）
1. 「データ復元」ボタンをタップ
2. 復元するバックアップを一覧から選択
3. 実行者名を入力（必須）
4. 復元内容を確認して実行
- **復元内容**: 選択したバックアップ時点の注文データと売上データを復元
- **復元記録**: 復元実行者名と復元詳細を記録
- **注意**: 現在の注文データは完全に置き換えられます

## 技術仕様

### フレームワーク
- **Next.js**: Reactベースのフルスタックフレームワーク
- **Tailwind CSS**: スタイリング
- **Firebase**: バックエンド（Firestore、Storage、認証）

### 主要ライブラリ
- **html5-qrcode**: QRコード読み取り
- **lucide-react**: アイコン
- **firebase/firestore**: データベース操作
- **firebase/storage**: 画像ストレージ

### データ構造

#### 商品 (products)
```javascript
{
  id: "商品ID",
  name: "商品名",
  price: 価格,
  stock: 在庫数,
  maxStock: 在庫上限,
  imageUrl: "画像URL（Firebase Storageまたは外部URL）",
  description: "商品説明",
  nutrition: "栄養成分情報（1個あたり）",
  allergens: "アレルゲン情報"
}
```

#### 注文 (orders)
```javascript
{
  id: "注文ID",
  items: [商品リスト],
  totalAmount: 合計金額,
  createdAt: 作成日時,
  ticketNumber: 整理番号,
  status: "pending|completed|cancelled",
  isProxy: true/false, // 代理注文フラグ
  completedAt: 完了日時（完了時のみ）,
  cancelledAt: 取り消し日時（取り消し時のみ）
}
```

#### バックアップ (backups)
```javascript
{
  id: "バックアップID",
  executorName: "実行者名",
  createdAt: 作成日時,
  ordersData: [注文データ配列],
  latestOrderNumber: 整理番号,
  type: "orders_reset"
}
```

#### 復元ログ (restoreLog)
```javascript
{
  backupId: "復元元バックアップID",
  executorName: "復元実行者名",
  restoredAt: 復元実行日時,
  originalBackupDate: 元のバックアップ作成日時,
  originalExecutor: "元の実行者名"
}
```

## 画像アップロード機能について

### 機能概要
- Firebase Storageを使用した商品画像のアップロード・管理
- 商品管理画面から画像をアップロード可能
- アップロードした画像は商品カードに表示

### 対応形式・制限
- **対応形式**: JPEG、PNG、WebP
- **ファイルサイズ**: 5MB以下
- **保存場所**: Firebase Storage (`product-images/` フォルダ)

### 料金について
Firebase Storageの料金体系（2024年時点）：
- **無料枠**: 5GBのストレージ、1GB/日のダウンロード
- **従量課金**: 無料枠を超えた場合
  - ストレージ: $0.026/GB/月
  - ダウンロード: $0.12/GB

### セキュリティ
- 画像は公開アクセス可能（商品表示のため）
- 本番環境では適切な認証ルールを設定することを推奨

## 注意事項

### セキュリティ
- 管理画面のパスワードは適切に管理してください
- パスワードを変更したい場合は別途ご連絡ください
- Firebase Storageのセキュリティルールを適切に設定してください

### パフォーマンス
- 画像は最適化されたサイズを使用してください
- 大きな画像ファイルはアップロード前にリサイズすることを推奨

### 開発期間中
- 継続的に開発を進めるのでテストデータの内容(商品名、画像、在庫数)が変わることがあります

## トラブルシューティング

### よくある問題

#### お客様がスマートフォンを持っていない
- 管理画面の「代理注文」機能を使用
- 代理注文作成後、整理券番号を小さな紙に書いて渡す
- 商品準備完了後、管理画面の「受け渡し完了」ボタンで処理

#### QRコードが読み取れない
- カメラの権限を確認
- 明るい環境で読み取りを試行
- QRコードが汚れていないか確認
- 注文が取り消されていないか確認（取り消し済みの場合は読み取れません）

#### 注文が反映されない
- インターネット接続を確認
- ブラウザを再読み込み

#### 管理画面にアクセスできない
- パスワードを確認
- ブラウザのキャッシュをクリア
- 再度ログインを試行

#### 注文取り消しができない
- 注文が既に完了していないか確認
- インターネット接続を確認
- ブラウザを再読み込みして再試行

#### 整理券を再表示しても画面が変わらない
- インターネット接続を確認
- ブラウザを再読み込み
- 注文ステータスを確認（完了済みや取り消し済みの場合は適切なページが表示されます）
- URLが正しくコピーされているか確認

#### 画像がアップロードできない
- ファイルサイズが5MB以下か確認
- 対応形式（JPEG、PNG、WebP）か確認
- インターネット接続を確認
- Firebase Storageが有効化されているか確認
- ブラウザのキャッシュをクリアして再試行

#### 画像が表示されない
- 画像URLが正しいか確認
- Firebase Storageのセキュリティルールを確認
- 画像ファイルが削除されていないか確認
- ブラウザのキャッシュをクリアして再試行

#### 代理注文が作成できない
- 商品の在庫が十分か確認
- インターネット接続を確認
- ブラウザを再読み込みして再試行
- Firestoreのトランザクションエラーの場合は少し時間をおいて再試行

#### 受け渡し完了ボタンが表示されない
- 注文ステータスが「対応中」であることを確認
- ブラウザを再読み込み
- 注文が取り消されていないか確認

#### 全データリセットが完了しない
- インターネット接続を確認
- 処理完了まで少し時間がかかる場合があります
- ブラウザを再読み込みして結果を確認
- Firebase Consoleで直接データを確認

#### データリセットで商品データも消えてしまった
- v1.8.0以降は商品データは保持されます
- 古いバージョンを使用している場合は商品管理画面から再度追加してください
- 今後は新しいリセット機能をご利用ください

#### バックアップが作成されない
- インターネット接続を確認
- Firebase Firestoreが正常に動作しているか確認
- ブラウザのコンソールでエラーメッセージを確認
- 実行者名が正しく入力されているか確認

#### 復元機能でバックアップ一覧が表示されない
- インターネット接続を確認
- Firebase Firestoreの`backups`コレクションを確認
- ブラウザを再読み込みして再試行
- 過去にリセットを実行していない場合はバックアップが存在しません

#### 復元後もデータが変わらない
- ブラウザを完全に再読み込み（Ctrl+F5またはCmd+Shift+R）
- 復元ログを確認して実行が完了しているか確認
- Firebase Consoleで`orders`コレクションを直接確認
- キャッシュの問題の可能性があるため、ブラウザのキャッシュをクリア

#### 実行者名が記録されない
- 実行者名入力欄が空白でないか確認
- 特殊文字や絵文字が含まれていないか確認
- ブラウザを再読み込みして再試行

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題や質問がある場合は、速やかにご連絡いただくか、GitHubのIssuesページでお知らせください。
