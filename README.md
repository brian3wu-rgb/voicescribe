# VoiceScribe – AI 語音轉文字與摘要工具

> 上傳音檔、即時錄音或貼上連結，AI 自動生成逐字稿與重點整理

## 功能

- 🎵 **上傳音檔**：支援 MP3、WAV、M4A、MP4（最大 25MB）
- 🎤 **即時錄音**：瀏覽器內錄音，一鍵轉錄
- 🔗 **貼上連結**：直接輸入音訊 URL 轉錄
- 🗣 **說話者辨識**：自動分辨多位說話者
- 📝 **逐字稿**：帶時間戳記、可搜尋
- ✅ **重點摘要**：5-10 個核心要點
- 📋 **行動事項**：自動提取待辦事項
- 📊 **情緒分析**：分析整體對話情緒
- 📚 **章節切分**：自動偵測章節結構
- 💾 **多格式匯出**：TXT、PDF、Word、Notion、Google Docs

## 快速開始

### 1. 安裝 Node.js

```bash
brew install node    # macOS
```

### 2. 進入專案目錄

```bash
cd /Users/brian/Documents/Claude/voicescribe
```

### 3. 建立環境變數

```bash
cp .env.local.example .env.local
# 填入你的 API Key
```

`.env.local` 內容：
```
OPENAI_API_KEY=sk-...          # OpenAI Whisper
ANTHROPIC_API_KEY=sk-ant-...   # Claude Opus
```

### 4. 安裝套件

```bash
npm install
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器：[http://localhost:3000](http://localhost:3000)

## 部署（Vercel）

```bash
npm install -g vercel
vercel
```

在 Vercel Dashboard 設定環境變數：
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## 技術架構

| 層級 | 技術 |
|------|------|
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| 語音轉文字 | OpenAI Whisper API (`whisper-1`) |
| 摘要生成 | Anthropic Claude (`claude-opus-4-6`) |
| 部署 | Vercel / Node.js |

## API 端點

| 路由 | 方法 | 說明 |
|------|------|------|
| `/api/transcribe` | POST | 音檔 → 逐字稿（含時間戳記） |
| `/api/summarize` | POST | 逐字稿 → 摘要、行動事項、情緒 |
| `/api/fetch-url` | GET | 下載遠端音訊檔案 |

## 注意事項

- Whisper API 單檔上限 **25 MB**（官方限制）
- 轉錄時間依音檔長度而定，建議設定 `maxDuration = 120`
- 長音檔建議先壓縮為 128kbps MP3
