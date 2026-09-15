# 網站地圖提交清單（單頁）

**目標：** 讓 Google / Bing 快速發現並收錄 `https://www.repocontext.dev`。
網站地圖已存在於 **`/sitemap.xml`**（Next.js `app/sitemap.ts`，包含全部頁面 + 6 篇部落格）。向各搜尋引擎提交一次即可。

## 開始前
- [ ] 網站已上線於 `https://www.repocontext.dev`（非 localhost）。
- [ ] `https://www.repocontext.dev/sitemap.xml` 回傳有效 XML（用瀏覽器開啟確認）。
- [ ] `robots.txt` 允許爬取（應已參照網站地圖）。

## 1. Google Search Console（最重要）
- [ ] 前往 https://search.google.com/search-console/
- [ ] **新增資源** → 選擇 **網域** → 輸入 `repocontext.dev`（涵蓋 www + 所有子網域）。
- [ ] 驗證擁有權：複製 GSC 提供的 **TXT 記錄** → Cloudflare → DNS → 新增 TXT。稍候數分鐘後點擊驗證。
- [ ] 左側選單 → **網站地圖** → 輸入 `sitemap.xml` → **提交**。
- [ ] 數天後：檢查 **索引 → 網頁** 查看已收錄數量。
- [ ] 選用：用 **網址檢查** 針對 6 篇部落格個別要求收錄（加速首次爬取）。

## 2. Bing Webmaster Tools（同時覆蓋 Bing + ChatGPT/AI 爬蟲）
- [ ] 前往 https://www.bing.com/webmasters/
- [ ] 新增網站 `https://www.repocontext.dev`，用相同方式驗證（TXT 或從 GSC 匯入）。
- [ ] **網站地圖** → 提交 `https://www.repocontext.dev/sitemap.xml`。

## 3. 選用額外觸及
- [ ] **Yandex**（ru）— https://webmaster.yandex.com/（提交網站地圖）。
- [ ] **Naver**（kr）— https://searchadvisor.naver.com/（若鎖定韓國市場）。
- [ ] **Cloudflare Indexing**（若為免費方案）— 非必要。

## 4. 提交之後
- [ ] 每當**新增部落格文章**就重新提交網站地圖（檔案會自動更新，只要在 GSC/Bing 再點一次「提交」）。
- [ ] 每週監看 **Search Console → 成效**，觀察 "AGENTS.md generator"、"CLAUDE.md private repo" 等詞的曝光/點擊。
- [ ] 若某頁顯示「已發現但尚未收錄」超過 2 週，加強從首頁或部落格索引對它的內部連結。

## 驗證是否成功
```
# 網站地圖能否存取？
curl -s https://www.repocontext.dev/sitemap.xml | head

# 包含多少網址？
curl -s https://www.repocontext.dev/sitemap.xml | grep -c "<loc>"
```
預期數量應等於：首頁 + 所有路由（價格、文件、部落格等）+ 6 篇部落格文章。
