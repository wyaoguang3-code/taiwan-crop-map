# 台灣農作物地圖 Demo

一個互動式台灣農作物地圖單頁 web app — 點擊縣市查看當地的吉祥物、天氣預報、市場批發價格與種植要點。

底層來自 Claude Design 輸出的 self-contained HTML bundle；本 repo 解包並改寫了其中的 React 原始碼（[App.tsx](unpacked/App.tsx)），並新增即時資料串接與縣市客製背景圖的支援。

## Live demo

GitHub Pages: https://wyaoguang3-code.github.io/taiwan-crop-map/

## Features

- **互動地圖**：點擊 9 個縣市（台北、桃園、宜蘭、台中、花蓮、雲林、台南、高雄、屏東）切換右側資訊
- **即時天氣**：依選中縣市座標向 [Open-Meteo](https://open-meteo.com/) 抓當地天氣；抓資料前先用靜態 fallback 立即渲染
- **即時批發價格**：依縣市主打作物向 [農業部農產品交易行情 API](https://data.moa.gov.tw/) 抓批發均價，含最近 5 日折線圖
- **縣市背景圖切換**：可為任一縣市提供專屬的右面板 PNG（見下方「Adding a county variant」）
- **Yilan hover glow**：修好原版 SVG viewBox 裁切問題

## Repo layout

```
.
├── index.html                    # 建置後的單檔 demo（GitHub Pages 指向這支）
├── bundle-source.html            # Claude Design 輸出的原始 bundle（repack 來源）
├── unpack.py                     # 解包 bundle → unpacked/
├── repack.py                     # 重組 unpacked/App.tsx → index.html
├── unpacked/
│   ├── App.tsx                   # 主要 React 原始碼（改這個）
│   ├── left_panel.png            # 左側地圖底圖
│   ├── right_panel.png           # 右側面板預設底圖（台南彩椒寶寶）
│   └── right_panel_taichung.png  # 台中專屬底圖
└── README.md
```

## How it works

1. `bundle-source.html` 是 Claude Design 打包的自解壓縮 HTML — 內嵌 108 個 base64 資產（字型、React runtime、Babel、圖片）+ 一段 `<script type="text/babel">` 的 React 原始碼
2. `unpack.py` 把 manifest 裡所有資產解出來；React 原始碼以 `App.tsx` 之名落盤
3. 改 `App.tsx` 後跑 `python3 repack.py` → 把新版 React 塞回 template，並把 `unpacked/right_panel_<region>.png` 一併打包為 `window.RIGHT_PANEL_IMGS`，輸出 `index.html`

## Editing the code

```bash
# 解包一次（第一次或來源更新時）
python3 unpack.py

# 改 unpacked/App.tsx 後
python3 repack.py           # 產出 index.html
open index.html             # 本機預覽
```

## Adding a county variant

1. 從 Claude Design 匯出該縣市的設計 PNG / 螢幕擷圖
2. 裁切右面板部分（614 × 657 px）
3. 存成 `unpacked/right_panel_<region_id>.png`
   - region_id 可用：`taipei`、`taoyuan`、`yilan`、`taichung`、`hualien`、`yunlin`、`tainan`、`kaohsiung`、`pingtung`
4. 跑 `python3 repack.py` — 新圖會自動被納入

## Data sources

| 資料 | 來源 | 失敗時 |
|---|---|---|
| 天氣 | [Open-Meteo forecast API](https://open-meteo.com/en/docs) | 使用 `REGIONS_DATA[regionId].weather` 靜態值 |
| 作物批發價 | [農業部農產品交易行情 API](https://data.moa.gov.tw/) | 使用 `PRICE_FALLBACK[cropApi]` 靜態值 |

每個縣市的 `coords` 與 `cropApi` 都在 [App.tsx](unpacked/App.tsx) 裡的 `REGIONS_DATA`。

## License

Demo 視覺素材與 bundle 來自 Claude Design 輸出；程式碼修改部分供學習交流使用。
