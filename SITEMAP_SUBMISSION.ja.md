# サイトマップ送信チェックリスト（1ページ）

**目標:** Google / Bing が `https://www.repocontext.dev` を素早く発見・インデックスすること。
サイトマップは既に **`/sitemap.xml`** にあります（Next.js `app/sitemap.ts`、全ページ + ブログ6記事を含む）。各検索エンジンに1回送信すれば完了。

## 開始前
- [ ] サイトが `https://www.repocontext.dev` で公開済み（localhost ではない）。
- [ ] `https://www.repocontext.dev/sitemap.xml` が有効な XML を返す（ブラウザで開いて確認）。
- [ ] `robots.txt` がクロールを許可している（サイトマップを参照しているはず）。

## 1. Google Search Console（最重要）
- [ ] https://search.google.com/search-console/ へ
- [ ] **プロパティを追加** → **ドメイン** を選択 → `repocontext.dev` を入力（www + 全サブドメイン対象）。
- [ ] 所有権の確認: GSC が表示する **TXT レコード** をコピー → Cloudflare → DNS → TXT を追加。数分待って「確認」をクリック。
- [ ] 左メニュー → **サイトマップ** → `sitemap.xml` を入力 → **送信**。
- [ ] 数日後: **インデックス → ページ** でインデックス済み URL 数を確認。
- [ ] 任意: **URL 検査** でブログ6記事を個別にインデックス申請（クロールを早める）。

## 2. Bing Webmaster Tools（Bing + ChatGPT/AI クローラーをカバー）
- [ ] https://www.bing.com/webmasters/ へ
- [ ] サイト `https://www.repocontext.dev` を追加し、同様に確認（TXT または GSC からインポート）。
- [ ] **サイトマップ** → `https://www.repocontext.dev/sitemap.xml` を送信。

## 3. 任意の追加リーチ
- [ ] **Yandex**（ru）— https://webmaster.yandex.com/（サイトマップ送信）。
- [ ] **Naver**（kr）— https://searchadvisor.naver.com/（韓国向けの場合）。
- [ ] **Cloudflare Indexing**（無料プランの場合）— 不要。

## 4. 送信後
- [ ] ブログ記事を**追加したら都度サイトマップを再送信**（ファイルは自動更新されるので、GSC/Bing で再度「送信」を押すだけ）。
- [ ] 毎週 **Search Console → パフォーマンス** を確認。「AGENTS.md generator」「CLAUDE.md private repo」などの表示回数/クリックを追跡。
- [ ] あるページが「発見されたがインデックスされていない」が >2 週間続く場合、トップページやブログ一覧からの内部リンクを強化する。

## 動作確認
```
# サイトマップは取得できるか？
curl -s https://www.repocontext.dev/sitemap.xml | head

# URL は何件あるか？
curl -s https://www.repocontext.dev/sitemap.xml | grep -c "<loc>"
```
件数は「トップページ + 全ルート（料金・ドキュメント・ブログ等）+ ブログ6記事」と一致するはず。
