# DSP 從零帶做教室

[開啟教學網站](https://alex27298067.github.io/dsp-study-classroom/)

繁體中文 DSP 初學者課程，包含 10 個入門單元、2024 與 2026 考古題共 43 小題、約 2 小時 54 分鐘有聲影片，以及 126 頁逐題詳解。

手機可使用直式影片，電腦可切換橫式 1080p。支援選題、搜尋、0.75–2 倍速、逐步跳轉、觀看位置與完成紀錄。紀錄只儲存在本機瀏覽器，不需登入。

## 使用

開啟網站後，先看入門單元，再依年份選題。遇到「換你做」請暫停，用紙筆完成後再看小測解答。互動練習頁可修改數字進行練習。

[完整長片、旁白與離線學習包](https://github.com/alex27298067/dsp-study-classroom/releases/tag/v1.0.0) 放在 Releases。`books/` 包含 PDF 與可編輯 DOCX。`media/phone/` 與 `media/wide/` 為 53 段分題影片。

## 網站維護

純靜態 HTML、CSS、JavaScript，不需安裝套件或建置。GitHub Pages 使用 `main` 分支根目錄；`.nojekyll` 保留靜態資源原樣。`course-data.js` 保存影片、講義頁碼及每一步的時間。

本機可在此目錄執行 `python -m http.server 8080` 後開啟 `http://localhost:8080/`。正式網站由 GitHub Pages 提供影片分段讀取。

## 內容與來源

內容依使用者提供的兩份考古題及期中考教室程式整理。語音為 AI 合成。詳見 [工具與來源](sources.txt)。互動練習內嵌 MathJax，授權見 [MathJax_LICENSE.txt](MathJax_LICENSE.txt)。原始題目與程式素材保留其原有權利，本儲存庫不另授予第三方素材授權。
