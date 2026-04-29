
const { useState, useRef } = React;

/* ── REGION DATA ─────────────────────────────────────────── */
const REGIONS_DATA = {
  taipei:    { name:'台北市',  charType:'leafy',     mascotName:'菠菜寶寶',   mascotDesc:'哈囉！我是來自台北的菠菜寶寶！這裡氣候溫和濕潤，很適合葉菜類生長，快來看看今天的天氣和市場資訊吧！', coords:[25.0330,121.5654], cropApi:'菠菜',   weather:{temp:24,desc:'晴時多雲',hum:72,rain:15,fore:[{l:'明天',t:23,icon:'cloud'},{l:'後天',t:22,icon:'cloud'},{l:'週五',t:25,icon:'sun'}]}, price:{val:45,chg:2}, tips:['喜歡涼爽潮濕環境','需要充足水分','土壤保持濕潤','定期施肥促進生長'], crops:[{name:'高麗菜寶寶',type:'leafy'},{name:'番茄寶寶',type:'tomato'},{name:'青椒寶寶',type:'bellpepper'},{name:'韭菜寶寶',type:'leafy'},{name:'芹菜寶寶',type:'leafy'}] },
  // priceMarket intentionally omitted — 桃農 only trades 牛番茄 ~2 days/month,
  // so we drop the market filter and use the national volume-weighted average
  // (still scoped to 牛番茄 品種).
  taoyuan:   { name:'桃園市',  charType:'tomato',    mascotName:'番茄寶寶',   mascotDesc:'哈囉！我是來自桃園的番茄寶寶！這裡土壤肥沃，陽光充足，是我最愛的家鄉！', coords:[24.9937,121.3010], cropApi:'番茄', priceVariety:'番茄-牛番茄', weather:{temp:26,desc:'晴天',hum:65,rain:5,fore:[{l:'明天',t:25,icon:'sun'},{l:'後天',t:24,icon:'sun'},{l:'週五',t:26,icon:'cloud'}]}, price:{val:65,chg:-2}, tips:['喜歡充足日照','土壤排水要良好','適當修剪枝葉','定期充足澆水'], crops:[{name:'番茄寶寶',type:'tomato'},{name:'草莓寶寶',type:'tomato'},{name:'高麗菜寶寶',type:'leafy'},{name:'蘿蔔寶寶',type:'radish'},{name:'花椰菜寶寶',type:'broccoli'}] },
  yilan:     { name:'宜蘭縣',  charType:'radish',    mascotName:'白蘿蔔寶寶', mascotDesc:'哈囉！我是來自宜蘭的白蘿蔔寶寶！這裡雨水充足，土壤深厚肥沃，很適合根莖類作物生長！', coords:[24.7021,121.7377], cropApi:'蘿蔔', weather:{temp:22,desc:'多雲有雨',hum:85,rain:45,fore:[{l:'明天',t:22,icon:'cloud'},{l:'後天',t:21,icon:'cloud'},{l:'週五',t:23,icon:'cloud'}]}, price:{val:35,chg:1}, tips:['喜歡涼爽環境','需要深層土壤','保持土壤濕潤','注意排水良好'], crops:[{name:'白蘿蔔寶寶',type:'radish'},{name:'芋頭寶寶',type:'radish'},{name:'蔥寶寶',type:'onion'},{name:'高麗菜寶寶',type:'leafy'},{name:'青椒寶寶',type:'bellpepper'}] },
  taichung:  { name:'台中市',  charType:'pumpkin',   mascotName:'南瓜寶寶',   mascotDesc:'哈囉！我是來自台中的南瓜寶寶！這裡氣候適中溫暖，讓我長得又大又圓，超開心的！', coords:[24.1477,120.6736], cropApi:'南瓜', weather:{temp:27,desc:'多雲',hum:68,rain:12,fore:[{l:'明天',t:26,icon:'cloud'},{l:'後天',t:25,icon:'sun'},{l:'週五',t:27,icon:'sun'}]}, price:{val:55,chg:3}, tips:['喜歡充足日照','土壤排水良好','適量澆水','定期施有機肥'], crops:[{name:'南瓜寶寶',type:'pumpkin'},{name:'玉米寶寶',type:'corn'},{name:'高麗菜寶寶',type:'leafy'},{name:'番茄寶寶',type:'tomato'},{name:'洋蔥寶寶',type:'onion'}] },
  hualien:   { name:'花蓮縣',  charType:'eggplant',  mascotName:'茄子寶寶',   mascotDesc:'哈囉！我是來自花蓮的茄子寶寶！這裡有潔淨的空氣和肥沃土壤，讓我健康美麗的成長！', coords:[23.9871,121.6015], cropApi:'茄子', weather:{temp:26,desc:'晴天',hum:70,rain:8,fore:[{l:'明天',t:25,icon:'sun'},{l:'後天',t:26,icon:'sun'},{l:'週五',t:27,icon:'sun'}]}, price:{val:48,chg:-1}, tips:['喜歡溫暖環境','需要充足日照','保持土壤適當濕度','注意防止病蟲害'], crops:[{name:'茄子寶寶',type:'eggplant'},{name:'番茄寶寶',type:'tomato'},{name:'辣椒寶寶',type:'bellpepper'},{name:'苦瓜寶寶',type:'pumpkin'},{name:'南瓜寶寶',type:'pumpkin'}] },
  yunlin:    { name:'雲林縣',  charType:'onion',     mascotName:'洋蔥寶寶',   mascotDesc:'哈囉！我是來自雲林的洋蔥寶寶！雲林是台灣的農業大縣，我在這裡曬太陽長大，超自豪！', coords:[23.7092,120.4313], cropApi:'洋蔥', weather:{temp:29,desc:'晴天',hum:62,rain:5,fore:[{l:'明天',t:28,icon:'sun'},{l:'後天',t:27,icon:'sun'},{l:'週五',t:30,icon:'sun'}]}, price:{val:38,chg:4}, tips:['喜歡溫暖乾燥','充足日照很重要','土壤鬆軟排水好','注意預防病蟲害'], crops:[{name:'洋蔥寶寶',type:'onion'},{name:'花生寶寶',type:'pumpkin'},{name:'蒜頭寶寶',type:'onion'},{name:'玉米寶寶',type:'corn'},{name:'高麗菜寶寶',type:'leafy'}] },
  tainan:    { name:'台南市',  charType:'bellpepper',mascotName:'彩椒寶寶',   mascotDesc:'哈囉！我是來自台南的彩椒寶寶！這裡陽光充足，很適合我生長，快來看看今天的天氣和市場資訊吧！', coords:[22.9999,120.2269], cropApi:'彩椒', weather:{temp:28,desc:'多雲時晴',hum:70,rain:10,fore:[{l:'明天',t:27,icon:'cloud'},{l:'後天',t:26,icon:'cloud'},{l:'週五',t:28,icon:'sun'}]}, price:{val:120,chg:5}, tips:['喜歡溫暖乾燥的環境','需要充足的日照','土壤保持排水良好','定期施肥，促進生長'], crops:[{name:'番茄寶寶',type:'tomato'},{name:'洋蔥寶寶',type:'onion'},{name:'玉米寶寶',type:'corn'},{name:'蘆筍寶寶',type:'asparagus'},{name:'花椰菜寶寶',type:'broccoli'}] },
  kaohsiung: { name:'高雄市',  charType:'broccoli',  mascotName:'花椰菜寶寶', mascotDesc:'哈囉！我是來自高雄的花椰菜寶寶！高雄充足的陽光讓我長得翠綠茂盛，超級有活力！', coords:[22.6273,120.3014], cropApi:'花椰菜', weather:{temp:30,desc:'晴天',hum:65,rain:5,fore:[{l:'明天',t:29,icon:'sun'},{l:'後天',t:28,icon:'sun'},{l:'週五',t:31,icon:'sun'}]}, price:{val:58,chg:-3}, tips:['喜歡充足日照','土壤排水要好','涼爽時期生長最佳','防蟲害很重要'], crops:[{name:'花椰菜寶寶',type:'broccoli'},{name:'番茄寶寶',type:'tomato'},{name:'蘆筍寶寶',type:'asparagus'},{name:'玉米寶寶',type:'corn'},{name:'洋蔥寶寶',type:'onion'}] },
  pingtung:  { name:'屏東縣',  charType:'pineapple', mascotName:'鳳梨寶寶',   mascotDesc:'哈囉！我是來自屏東的鳳梨寶寶！屏東熱帶氣候讓我曬得金黃甜蜜，每一口都是陽光的味道！', coords:[22.6690,120.4873], cropApi:'鳳梨', weather:{temp:32,desc:'大晴天',hum:60,rain:3,fore:[{l:'明天',t:31,icon:'sun'},{l:'後天',t:30,icon:'sun'},{l:'週五',t:32,icon:'sun'}]}, price:{val:75,chg:6}, tips:['喜歡炎熱環境','耐旱性強','土壤排水要良好','充足日照是關鍵'], crops:[{name:'鳳梨寶寶',type:'pineapple'},{name:'芒果寶寶',type:'pumpkin'},{name:'蓮霧寶寶',type:'tomato'},{name:'香蕉寶寶',type:'corn'},{name:'木瓜寶寶',type:'pumpkin'}] },
};

/* ── MAP POLYGON PATHS ───────────────────────────────────── */
const MAP_POLYS = [
  { id:'xinbei',    name:'新北市',  color:'#c2e4b2', path:'M 122,8 L 178,4 L 212,22 L 220,55 L 208,80 L 178,88 L 142,86 L 112,76 L 106,50 L 112,22 Z', label:false },
  { id:'taipei',    name:'台北市',  color:'#9ed49e', path:'M 148,12 L 174,8 L 192,20 L 188,44 L 168,50 L 148,42 Z', label:true, cx:170,cy:30, charType:'leafy', cs:0.55 },
  { id:'taoyuan',   name:'桃園市',  color:'#f9caca', path:'M 108,50 L 150,42 L 172,58 L 165,90 L 138,96 L 108,90 L 90,74 Z', label:true, cx:133,cy:70, charType:'tomato', cs:0.55 },
  { id:'yilan',     name:'宜蘭縣',  color:'#e4ede4', path:'M 186,10 L 222,26 L 236,56 L 228,88 L 208,96 L 184,82 L 172,62 L 174,28 Z', label:true, cx:206,cy:60, charType:'radish', cs:0.5 },
  { id:'hsinmiao',  name:'新竹苗栗',color:'#d8eef0', path:'M 84,78 L 112,72 L 140,86 L 132,124 L 102,130 L 74,116 Z', label:false },
  { id:'taichung',  name:'台中市',  color:'#fde8b8', path:'M 56,118 L 96,110 L 132,120 L 136,160 L 126,184 L 86,190 L 50,174 L 42,150 Z', label:true, cx:89,cy:151, charType:'pumpkin', cs:0.62 },
  { id:'nantou',    name:'南投縣',  color:'#e5efda', path:'M 118,118 L 154,112 L 172,136 L 166,178 L 140,188 L 116,174 Z', label:false },
  { id:'hualien',   name:'花蓮縣',  color:'#d4cae8', path:'M 176,58 L 228,72 L 242,164 L 234,224 L 206,232 L 178,220 L 162,180 L 166,110 Z', label:true, cx:202,cy:158, charType:'eggplant', cs:0.6 },
  { id:'changhua',  name:'彰化縣',  color:'#e8f5d8', path:'M 42,168 L 76,160 L 108,170 L 100,198 L 70,204 L 36,190 Z', label:false },
  { id:'yunlin',    name:'雲林縣',  color:'#fddab8', path:'M 35,196 L 72,190 L 94,208 L 86,236 L 55,242 L 26,224 Z', label:true, cx:62,cy:215, charType:'onion', cs:0.55 },
  { id:'chiayi',    name:'嘉義縣市',color:'#d4edd8', path:'M 26,230 L 62,224 L 84,244 L 76,272 L 44,278 L 18,258 Z', label:false },
  { id:'tainan',    name:'台南市',  color:'#ffd095', path:'M 18,265 L 60,258 L 82,280 L 74,312 L 40,318 L 12,298 Z', label:true, cx:46,cy:288, charType:'bellpepper', cs:0.62 },
  { id:'kaohsiung', name:'高雄市',  color:'#cce8b0', path:'M 40,315 L 80,308 L 110,328 L 102,362 L 68,368 L 30,348 Z', label:true, cx:70,cy:338, charType:'broccoli', cs:0.6 },
  { id:'taitung',   name:'台東縣',  color:'#ddd8f0', path:'M 202,228 L 238,218 L 250,312 L 236,358 L 204,362 L 178,342 L 176,280 Z', label:false },
  { id:'pingtung',  name:'屏東縣',  color:'#e2f5cc', path:'M 68,362 L 104,356 L 126,374 L 118,398 L 84,402 L 48,385 Z', label:true, cx:88,cy:378, charType:'pineapple', cs:0.58 },
];

/* ── SVG CHARACTERS ─────────────────────────────────────── */
const LeafyChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="5" rx="16" ry="19" fill="#7bc47e"/>
    <ellipse cx="-6" cy="-13" rx="9" ry="6" fill="#56a85a" transform="rotate(-25,-6,-13)"/>
    <ellipse cx="6" cy="-13" rx="9" ry="6" fill="#56a85a" transform="rotate(25,6,-13)"/>
    <ellipse cx="0" cy="-9" rx="6" ry="8" fill="#68b86c"/>
    <circle cx="-5" cy="3" r="3.2" fill="#222"/>
    <circle cx="5" cy="3" r="3.2" fill="#222"/>
    <circle cx="-3.8" cy="2" r="1.2" fill="white"/>
    <circle cx="6.2" cy="2" r="1.2" fill="white"/>
    <path d="M-4 11 Q0 14 4 11" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-10" cy="7" rx="5" ry="3.5" fill="#e07070" opacity="0.3"/>
    <ellipse cx="10" cy="7" rx="5" ry="3.5" fill="#e07070" opacity="0.3"/>
  </g>
);

const TomatoChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <circle cx="0" cy="5" r="19" fill="#e8534a"/>
    <ellipse cx="0" cy="-11" rx="3" ry="8" fill="#4e9e30"/>
    <ellipse cx="-5" cy="-12" rx="7" ry="4" fill="#5aaa3a" transform="rotate(-30,-5,-12)"/>
    <ellipse cx="5" cy="-12" rx="7" ry="4" fill="#5aaa3a" transform="rotate(30,5,-12)"/>
    <circle cx="-6" cy="3" r="3.2" fill="#222"/>
    <circle cx="6" cy="3" r="3.2" fill="#222"/>
    <circle cx="-4.8" cy="2" r="1.2" fill="white"/>
    <circle cx="7.2" cy="2" r="1.2" fill="white"/>
    <path d="M-4 11 Q0 15 4 11" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-12" cy="7" rx="5.5" ry="3.5" fill="#c03030" opacity="0.28"/>
    <ellipse cx="12" cy="7" rx="5.5" ry="3.5" fill="#c03030" opacity="0.28"/>
  </g>
);

const BellPepperChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="6" rx="23" ry="27" fill="#f08030"/>
    <ellipse cx="-5" cy="-2" rx="9" ry="13" fill="#f89848" opacity="0.45"/>
    <rect x="-3.5" y="-21" width="7" height="13" rx="3.5" fill="#5a8a3a"/>
    <ellipse cx="-14" cy="-13" rx="12" ry="5.5" fill="#7ab848" transform="rotate(-38,-14,-13)"/>
    <ellipse cx="14" cy="-13" rx="12" ry="5.5" fill="#7ab848" transform="rotate(38,14,-13)"/>
    <ellipse cx="-7.5" cy="3" rx="5" ry="6" fill="#222"/>
    <ellipse cx="7.5" cy="3" rx="5" ry="6" fill="#222"/>
    <circle cx="-5.8" cy="1.5" r="2" fill="white"/>
    <circle cx="9.2" cy="1.5" r="2" fill="white"/>
    <ellipse cx="-16" cy="11" rx="7.5" ry="5" fill="#c06020" opacity="0.28"/>
    <ellipse cx="16" cy="11" rx="7.5" ry="5" fill="#c06020" opacity="0.28"/>
    <path d="M-6 16 Q0 21 6 16" stroke="#222" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="-30" cy="5" rx="8" ry="5.5" fill="#e87828" transform="rotate(-18,-30,5)"/>
    <ellipse cx="30" cy="5" rx="8" ry="5.5" fill="#e87828" transform="rotate(18,30,5)"/>
    <ellipse cx="-9" cy="32" rx="8" ry="5.5" fill="#d06828"/>
    <ellipse cx="9" cy="32" rx="8" ry="5.5" fill="#d06828"/>
  </g>
);

const EggplantChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="14" ry="22" fill="#7b52b8"/>
    <ellipse cx="-2" cy="0" rx="6" ry="10" fill="#9068d0" opacity="0.38"/>
    <ellipse cx="-5" cy="-15" rx="8" ry="5.5" fill="#5a8a3a" transform="rotate(-22,-5,-15)"/>
    <ellipse cx="5" cy="-15" rx="8" ry="5.5" fill="#5a8a3a" transform="rotate(22,5,-15)"/>
    <rect x="-2.5" y="-21" width="5" height="9" rx="2.5" fill="#4a7a2a"/>
    <circle cx="-4.5" cy="4" r="3.2" fill="#222"/>
    <circle cx="4.5" cy="4" r="3.2" fill="#222"/>
    <circle cx="-3.3" cy="3" r="1.2" fill="white"/>
    <circle cx="5.7" cy="3" r="1.2" fill="white"/>
    <path d="M-3 13 Q0 17 3 13" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-10" cy="10" rx="5" ry="3.2" fill="#5a38a8" opacity="0.32"/>
    <ellipse cx="10" cy="10" rx="5" ry="3.2" fill="#5a38a8" opacity="0.32"/>
  </g>
);

const PumpkinChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="-8" cy="5" rx="12" ry="17" fill="#ef9520"/>
    <ellipse cx="0" cy="5" rx="14" ry="19" fill="#f4a030"/>
    <ellipse cx="8" cy="5" rx="12" ry="17" fill="#ef9520"/>
    <rect x="-2.5" y="-15" width="5" height="9" rx="2.5" fill="#5a8a3a"/>
    <ellipse cx="10" cy="-9" rx="8" ry="4.5" fill="#7ab848" transform="rotate(32,10,-9)"/>
    <circle cx="-5.5" cy="3" r="3.2" fill="#222"/>
    <circle cx="5.5" cy="3" r="3.2" fill="#222"/>
    <circle cx="-4.3" cy="2" r="1.2" fill="white"/>
    <circle cx="6.7" cy="2" r="1.2" fill="white"/>
    <path d="M-4 11 Q0 15 4 11" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-12" cy="8" rx="5" ry="3.2" fill="#d07020" opacity="0.32"/>
    <ellipse cx="12" cy="8" rx="5" ry="3.2" fill="#d07020" opacity="0.32"/>
  </g>
);

const BroccoliChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <rect x="-5.5" y="0" width="11" height="24" rx="4" fill="#8ab858"/>
    <circle cx="0" cy="-7" r="15" fill="#58983a"/>
    <circle cx="-10" cy="-5" r="10" fill="#4a8a2a"/>
    <circle cx="10" cy="-5" r="10" fill="#4a8a2a"/>
    <circle cx="0" cy="-12" r="10" fill="#58983a"/>
    <circle cx="-5" cy="1" r="3.2" fill="#222"/>
    <circle cx="5" cy="1" r="3.2" fill="#222"/>
    <circle cx="-3.8" cy="0" r="1.2" fill="white"/>
    <circle cx="6.2" cy="0" r="1.2" fill="white"/>
    <path d="M-3.5 8 Q0 11 3.5 8" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-11" cy="4" rx="4.5" ry="3" fill="#387820" opacity="0.32"/>
    <ellipse cx="11" cy="4" rx="4.5" ry="3" fill="#387820" opacity="0.32"/>
  </g>
);

const PineappleChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="15" ry="22" fill="#f8c840"/>
    {[-6,0,6].map(x=>[0,6,12,18].map(y=><ellipse key={x+'-'+y} cx={x} cy={y-4} rx="3.5" ry="2.8" fill="#eab830"/>))}
    <ellipse cx="-8" cy="-15" rx="5.5" ry="13" fill="#5aaa3a" transform="rotate(-22,-8,-15)"/>
    <ellipse cx="0" cy="-18" rx="5.5" ry="14" fill="#4a9a2a"/>
    <ellipse cx="8" cy="-15" rx="5.5" ry="13" fill="#5aaa3a" transform="rotate(22,8,-15)"/>
    <circle cx="-5" cy="5" r="3.2" fill="#222"/>
    <circle cx="5" cy="5" r="3.2" fill="#222"/>
    <circle cx="-3.8" cy="4" r="1.2" fill="white"/>
    <circle cx="6.2" cy="4" r="1.2" fill="white"/>
    <path d="M-4 13 Q0 17 4 13" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-11" cy="9" rx="5.5" ry="3.2" fill="#d8a820" opacity="0.32"/>
    <ellipse cx="11" cy="9" rx="5.5" ry="3.2" fill="#d8a820" opacity="0.32"/>
  </g>
);

const RadishChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="15" ry="23" fill="#f4f0ec"/>
    <ellipse cx="-6" cy="-15" rx="7" ry="9" fill="#5aaa3a" transform="rotate(-22,-6,-15)"/>
    <ellipse cx="6" cy="-15" rx="7" ry="9" fill="#5aaa3a" transform="rotate(22,6,-15)"/>
    <rect x="-2.5" y="-8" width="5" height="8" rx="2.5" fill="#4a9a2a"/>
    <line x1="2" y1="29" x2="5" y2="41" stroke="#c8c0b0" strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="-5" cy="5" r="3.2" fill="#222"/>
    <circle cx="5" cy="5" r="3.2" fill="#222"/>
    <circle cx="-3.8" cy="4" r="1.2" fill="white"/>
    <circle cx="6.2" cy="4" r="1.2" fill="white"/>
    <path d="M-4 13 Q0 17 4 13" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-11" cy="9" rx="5.5" ry="3.5" fill="#d8d0c0" opacity="0.38"/>
    <ellipse cx="11" cy="9" rx="5.5" ry="3.5" fill="#d8d0c0" opacity="0.38"/>
  </g>
);

const OnionChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="17" ry="21" fill="#d8b8e8"/>
    <ellipse cx="0" cy="5" rx="13" ry="16" fill="#c8a8d8"/>
    <ellipse cx="-4.5" cy="-14" rx="4.5" ry="13" fill="#6aba4a" transform="rotate(-16,-4.5,-14)"/>
    <ellipse cx="4.5" cy="-14" rx="4.5" ry="13" fill="#6aba4a" transform="rotate(16,4.5,-14)"/>
    <circle cx="-5.5" cy="5" r="3.2" fill="#222"/>
    <circle cx="5.5" cy="5" r="3.2" fill="#222"/>
    <circle cx="-4.3" cy="4" r="1.2" fill="white"/>
    <circle cx="6.7" cy="4" r="1.2" fill="white"/>
    <path d="M-4 13 Q0 16 4 13" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-12" cy="9" rx="5.5" ry="3.5" fill="#b898c8" opacity="0.35"/>
    <ellipse cx="12" cy="9" rx="5.5" ry="3.5" fill="#b898c8" opacity="0.35"/>
  </g>
);

const CornChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="0" cy="5" rx="13" ry="23" fill="#f8d840"/>
    {[-7,-2,3,8].flatMap((x,xi)=>[-14,-8,-2,4,10].map((y,yi)=>(
      <ellipse key={`${xi}-${yi}`} cx={x} cy={y+5} rx="3" ry="2.4" fill="#eac828"/>
    )))}
    <ellipse cx="-10" cy="-17" rx="9" ry="14" fill="#5aaa3a" transform="rotate(-22,-10,-17)"/>
    <ellipse cx="10" cy="-17" rx="9" ry="14" fill="#4a9a2a" transform="rotate(22,10,-17)"/>
    <circle cx="-4.5" cy="3" r="3.2" fill="#222"/>
    <circle cx="4.5" cy="3" r="3.2" fill="#222"/>
    <circle cx="-3.3" cy="2" r="1.2" fill="white"/>
    <circle cx="5.7" cy="2" r="1.2" fill="white"/>
    <path d="M-3 10 Q0 14 3 10" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-10" cy="6" rx="4.5" ry="3" fill="#d8a820" opacity="0.32"/>
    <ellipse cx="10" cy="6" rx="4.5" ry="3" fill="#d8a820" opacity="0.32"/>
  </g>
);

const AsparagusChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <rect x="-7.5" y="-14" width="15" height="38" rx="7.5" fill="#8ab848"/>
    <ellipse cx="0" cy="-18" rx="9" ry="7.5" fill="#6a9838"/>
    <ellipse cx="-7" cy="-13" rx="7" ry="4.5" fill="#7aaa48" transform="rotate(-22,-7,-13)"/>
    <ellipse cx="7" cy="-13" rx="7" ry="4.5" fill="#7aaa48" transform="rotate(22,7,-13)"/>
    <circle cx="-4.5" cy="2" r="3.2" fill="#222"/>
    <circle cx="4.5" cy="2" r="3.2" fill="#222"/>
    <circle cx="-3.3" cy="1" r="1.2" fill="white"/>
    <circle cx="5.7" cy="1" r="1.2" fill="white"/>
    <path d="M-3 9 Q0 13 3 9" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-10" cy="5" rx="4.5" ry="3" fill="#6a8838" opacity="0.38"/>
    <ellipse cx="10" cy="5" rx="4.5" ry="3" fill="#6a8838" opacity="0.38"/>
  </g>
);

/* Persimmon — orange round with brown calyx */
const PersimmonChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="-30" cy="6" rx="10" ry="13" fill="#e87838" transform="rotate(-25,-30,6)"/>
    <ellipse cx="30" cy="6" rx="10" ry="13" fill="#e87838" transform="rotate(25,30,6)"/>
    <circle cx="0" cy="5" r="27" fill="#ec7d33"/>
    <ellipse cx="-7" cy="-4" rx="9" ry="13" fill="#f49853" opacity="0.4"/>
    <ellipse cx="-9" cy="-22" rx="9" ry="6" fill="#7d5a3a" transform="rotate(-30,-9,-22)"/>
    <ellipse cx="9" cy="-22" rx="9" ry="6" fill="#7d5a3a" transform="rotate(30,9,-22)"/>
    <ellipse cx="0" cy="-24" rx="6" ry="7" fill="#8c6a4a"/>
    <ellipse cx="0" cy="-28" rx="3" ry="5" fill="#5a4530"/>
    <circle cx="-9" cy="3" r="4" fill="#222"/>
    <circle cx="9" cy="3" r="4" fill="#222"/>
    <circle cx="-7.2" cy="2" r="1.5" fill="white"/>
    <circle cx="10.8" cy="2" r="1.5" fill="white"/>
    <path d="M-5 13 Q0 18 5 13" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="-15" cy="9" rx="6" ry="4" fill="#c84028" opacity="0.32"/>
    <ellipse cx="15" cy="9" rx="6" ry="4" fill="#c84028" opacity="0.32"/>
    <ellipse cx="-11" cy="34" rx="9" ry="6" fill="#c75a25"/>
    <ellipse cx="11" cy="34" rx="9" ry="6" fill="#c75a25"/>
  </g>
);

/* Melon — light green netted with leaf */
const MelonChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="-30" cy="6" rx="10" ry="13" fill="#9ec665" transform="rotate(-25,-30,6)"/>
    <ellipse cx="30" cy="6" rx="10" ry="13" fill="#9ec665" transform="rotate(25,30,6)"/>
    <circle cx="0" cy="5" r="27" fill="#abd472"/>
    <ellipse cx="-7" cy="-4" rx="9" ry="13" fill="#c5e290" opacity="0.5"/>
    {/* netting lines */}
    <path d="M-22 -10 Q 0 -8 22 -10" stroke="#7aa850" strokeWidth="1.2" fill="none" opacity="0.55"/>
    <path d="M-25 5 Q 0 8 25 5" stroke="#7aa850" strokeWidth="1.2" fill="none" opacity="0.55"/>
    <path d="M-22 18 Q 0 21 22 18" stroke="#7aa850" strokeWidth="1.2" fill="none" opacity="0.55"/>
    <path d="M-10 -22 Q -8 5 -10 28" stroke="#7aa850" strokeWidth="1.2" fill="none" opacity="0.45"/>
    <path d="M10 -22 Q 8 5 10 28" stroke="#7aa850" strokeWidth="1.2" fill="none" opacity="0.45"/>
    {/* stem & leaf */}
    <rect x="-2.5" y="-30" width="5" height="9" rx="2.5" fill="#5a8a3a"/>
    <ellipse cx="9" cy="-30" rx="9" ry="5" fill="#7ab848" transform="rotate(35,9,-30)"/>
    <circle cx="-9" cy="3" r="4" fill="#222"/>
    <circle cx="9" cy="3" r="4" fill="#222"/>
    <circle cx="-7.2" cy="2" r="1.5" fill="white"/>
    <circle cx="10.8" cy="2" r="1.5" fill="white"/>
    <path d="M-5 13 Q0 18 5 13" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="-15" cy="9" rx="6" ry="4" fill="#e89858" opacity="0.4"/>
    <ellipse cx="15" cy="9" rx="6" ry="4" fill="#e89858" opacity="0.4"/>
    <ellipse cx="-11" cy="34" rx="9" ry="6" fill="#88b250"/>
    <ellipse cx="11" cy="34" rx="9" ry="6" fill="#88b250"/>
  </g>
);

/* Bamboo shoot — tapered cone with green leaves on top */
const BambooShootChar = ({cx=0,cy=0,s=1}) => (
  <g transform={`translate(${cx},${cy}) scale(${s})`}>
    <ellipse cx="-26" cy="8" rx="9" ry="13" fill="#ecdcb0" transform="rotate(-25,-26,8)"/>
    <ellipse cx="26" cy="8" rx="9" ry="13" fill="#ecdcb0" transform="rotate(25,26,8)"/>
    <path d="M -22 32 L -16 -8 L -8 -28 L 0 -38 L 8 -28 L 16 -8 L 22 32 Z" fill="#f0deb0"/>
    <ellipse cx="-7" cy="-4" rx="6" ry="22" fill="#fff5d8" opacity="0.45"/>
    <path d="M -18 14 Q 0 11 18 14" stroke="#cdb888" strokeWidth="1.4" fill="none"/>
    <path d="M -14 -2 Q 0 -5 14 -2" stroke="#cdb888" strokeWidth="1.2" fill="none"/>
    <path d="M -10 -16 Q 0 -19 10 -16" stroke="#cdb888" strokeWidth="1" fill="none"/>
    {/* top leaves */}
    <path d="M -10 -28 L -5 -50 L 2 -32 Z" fill="#7aaa48"/>
    <path d="M -2 -32 L 1 -55 L 7 -32 Z" fill="#5a9838"/>
    <path d="M 2 -32 L 9 -48 L 12 -28 Z" fill="#7aaa48"/>
    <path d="M -12 -26 L -10 -42 L -5 -28 Z" fill="#6aa040"/>
    <circle cx="-7" cy="3" r="3.5" fill="#222"/>
    <circle cx="7" cy="3" r="3.5" fill="#222"/>
    <circle cx="-5.5" cy="2" r="1.3" fill="white"/>
    <circle cx="8.5" cy="2" r="1.3" fill="white"/>
    <path d="M-4 11 Q0 15 4 11" stroke="#222" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="-13" cy="8" rx="5" ry="3" fill="#e89858" opacity="0.4"/>
    <ellipse cx="13" cy="8" rx="5" ry="3" fill="#e89858" opacity="0.4"/>
    <ellipse cx="-9" cy="36" rx="8" ry="5" fill="#d4c290"/>
    <ellipse cx="9" cy="36" rx="8" ry="5" fill="#d4c290"/>
  </g>
);

const CHAR_COMPS = { leafy:LeafyChar, tomato:TomatoChar, bellpepper:BellPepperChar,
  eggplant:EggplantChar, pumpkin:PumpkinChar, broccoli:BroccoliChar,
  pineapple:PineappleChar, radish:RadishChar, onion:OnionChar,
  corn:CornChar, asparagus:AsparagusChar,
  persimmon:PersimmonChar, melon:MelonChar, bamboo:BambooShootChar };

const CharSVG = ({type, cx=0, cy=0, s=1}) => {
  const C = CHAR_COMPS[type];
  return C ? <C cx={cx} cy={cy} s={s}/> : null;
};

/* ── IMAGE-BASED MAP (real screenshot + SVG click overlay) ── */
// Exact SVG coordinates provided by user
const COUNTY_ZONES = [
  {id:'taipei',    cx:390, cy:53,  r:26},
  {id:'taoyuan',   cx:310, cy:107, r:26},
  {id:'yilan',     cx:440, cy:160, r:24},
  {id:'taichung',  cx:278, cy:208, r:30},
  {id:'hualien',   cx:375, cy:291, r:28},
  {id:'yunlin',    cx:187, cy:280, r:26},
  {id:'tainan',    cx:178, cy:394, r:30},
  {id:'kaohsiung', cx:312, cy:416, r:26},
  {id:'pingtung',  cx:240, cy:515, r:26},
];

const LEGEND_ZONES = [
  {id:'all',      label:'全部作物', cx:72,  cy:237, r:24},
  {id:'leafy',    label:'蔬菜類',   cx:73,  cy:275, r:18},
  {id:'root',     label:'根莖類',   cx:80,  cy:308, r:18},
  {id:'fruit',    label:'果菜類',   cx:76,  cy:341, r:18},
  {id:'legume',   label:'豆類',     cx:72,  cy:374, r:18},
  {id:'other',    label:'其他',     cx:71,  cy:412, r:18},
  {id:'explore',  label:'探索模式', cx:93,  cy:586, r:28},
];

const TaiwanMap = ({selected, onSelect, onLegend}) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{position:'relative',width:'100%',height:'100%',overflow:'visible'}}>
      {/* Real image — scales so height=100%; left-panel portion fills width naturally */}
      <img
        src={window.LEFT_PANEL_IMG}
        alt="台灣地圖"
        style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'fill',pointerEvents:'none',userSelect:'none',imageRendering:'high-quality'}}
      />

      {/* SVG overlay — viewBox matches original image left-panel coordinate space.
          overflow:visible lets hover glows extend past the viewBox (e.g. Yilan near the east edge). */}
      <svg
        style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',overflow:'visible'}}
        viewBox="0 0 450 657"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>



        {COUNTY_ZONES.map(z => {
          const isSel = selected === z.id;
          const isHov = hovered === z.id && !isSel;
          return (
            <g key={z.id}
              onClick={() => onSelect(z.id)}
              onMouseEnter={() => setHovered(z.id)}
              onMouseLeave={() => setHovered(null)}
              style={{cursor:'pointer'}}>

              {/* Hover glow */}
              {isHov && (
                <circle cx={z.cx} cy={z.cy} r={z.r+8}
                  fill="rgba(255,255,255,0.28)" filter="url(#glow)"/>
              )}



              {/* Invisible hit area */}
              <circle cx={z.cx} cy={z.cy} r={z.r+6} fill="transparent"/>
            </g>
          );
        })}
        {/* Legend + Explore click zones */}
        {LEGEND_ZONES.map(z => (
          <g key={z.id} onClick={() => onLegend && onLegend(z.id)}
            onMouseEnter={() => setHovered('l_'+z.id)}
            onMouseLeave={() => setHovered(null)}
            style={{cursor:'pointer'}}>
            {hovered === 'l_'+z.id && <circle cx={z.cx} cy={z.cy} r={z.r+6} fill="rgba(255,255,255,0.28)" filter="url(#glow)"/>}
            <circle cx={z.cx} cy={z.cy} r={z.r+4} fill="transparent"/>
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ── WEATHER ICONS ──────────────────────────────────────── */
const SunIcon = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="9" fill="#f8c840"/>
    {[0,45,90,135,180,225,270,315].map(a=>(
      <line key={a} x1={20+13*Math.cos(a*Math.PI/180)} y1={20+13*Math.sin(a*Math.PI/180)}
        x2={20+17*Math.cos(a*Math.PI/180)} y2={20+17*Math.sin(a*Math.PI/180)}
        stroke="#f8c840" strokeWidth="2.5" strokeLinecap="round"/>
    ))}
  </svg>
);
const CloudSunIcon = ({size=38}) => (
  <svg width={size} height={size} viewBox="0 0 44 44">
    <circle cx="26" cy="16" r="8" fill="#f8c840"/>
    {[0,60,120,180,240,300].map(a=>(
      <line key={a} x1={26+10*Math.cos(a*Math.PI/180)} y1={16+10*Math.sin(a*Math.PI/180)}
        x2={26+13*Math.cos(a*Math.PI/180)} y2={16+13*Math.sin(a*Math.PI/180)}
        stroke="#f8c840" strokeWidth="2" strokeLinecap="round"/>
    ))}
    <ellipse cx="18" cy="28" rx="13" ry="8" fill="#d0e8f8"/>
    <ellipse cx="12" cy="26" rx="9" ry="7" fill="#d0e8f8"/>
    <ellipse cx="26" cy="28" rx="11" ry="7" fill="#d0e8f8"/>
    <ellipse cx="18" cy="24" rx="10" ry="7" fill="#e0f0fc"/>
  </svg>
);
const CloudIcon = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <ellipse cx="20" cy="24" rx="14" ry="9" fill="#c8dff0"/>
    <ellipse cx="14" cy="22" rx="10" ry="8" fill="#c8dff0"/>
    <ellipse cx="26" cy="23" rx="11" ry="8" fill="#c8dff0"/>
    <ellipse cx="20" cy="18" rx="10" ry="8" fill="#d8e8f8"/>
  </svg>
);
const RainIcon = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <ellipse cx="20" cy="18" rx="14" ry="9" fill="#c8dff0"/>
    <ellipse cx="14" cy="16" rx="10" ry="8" fill="#c8dff0"/>
    <ellipse cx="26" cy="17" rx="11" ry="8" fill="#c8dff0"/>
    <ellipse cx="20" cy="12" rx="10" ry="8" fill="#d8e8f8"/>
    <line x1="14" y1="28" x2="12" y2="35" stroke="#74b6e0" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="21" y1="28" x2="19" y2="36" stroke="#74b6e0" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="28" y1="28" x2="26" y2="35" stroke="#74b6e0" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);
const WeatherIcon = ({type, size=28}) =>
  type==='sun'  ? <SunIcon size={size}/> :
  type==='rain' ? <RainIcon size={size}/> :
                  <CloudIcon size={size}/>;

/* ── SPARKLINE ─────────────────────────────────────────── */
const Sparkline = ({val}) => {
  const dates = ['5/6','5/7','5/8','5/9','5/10'];
  const base = val;
  const vals = [base*0.9, base*0.95, base*1.02, base*0.98, base];
  const min=Math.min(...vals)-10, max=Math.max(...vals)+10;
  const W=160, H=60;
  const px = (i) => 12 + i*(W-24)/4;
  const py = (v) => H - 8 - (v-min)/(max-min)*(H-16);
  const pts = vals.map((v,i)=>`${px(i)},${py(v)}`).join(' ');
  return (
    <svg width={W} height={H+20} viewBox={`0 0 ${W} ${H+20}`}>
      <polyline points={pts} fill="none" stroke="#4cae6e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {vals.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r="3.5" fill="#4cae6e"/>)}
      {dates.map((d,i)=><text key={i} x={px(i)} y={H+16} textAnchor="middle" fontSize="9" fill="#999" fontFamily="Noto Sans TC,sans-serif">{d}</text>)}
      <line x1="12" y1={H-2} x2={W-12} y2={H-2} stroke="#e8e8e8" strokeWidth="1"/>
    </svg>
  );
};

/* ── LARGE MASCOT (right panel header) ─────────────────── */
const LargeMascot = ({type}) => {
  const W=160, H=200;
  const comps = {
    bellpepper: () => <BellPepperChar cx={80} cy={110} s={2.8}/>,
    tomato:     () => <TomatoChar cx={80} cy={110} s={2.8}/>,
    leafy:      () => <LeafyChar cx={80} cy={110} s={2.8}/>,
    eggplant:   () => <EggplantChar cx={80} cy={115} s={2.8}/>,
    pumpkin:    () => <PumpkinChar cx={80} cy={110} s={2.8}/>,
    broccoli:   () => <BroccoliChar cx={80} cy={108} s={2.5}/>,
    pineapple:  () => <PineappleChar cx={80} cy={112} s={2.6}/>,
    radish:     () => <RadishChar cx={80} cy={108} s={2.6}/>,
    onion:      () => <OnionChar cx={80} cy={112} s={2.6}/>,
    corn:       () => <CornChar cx={80} cy={108} s={2.5}/>,
    asparagus:  () => <AsparagusChar cx={80} cy={108} s={2.5}/>,
  };
  const Render = comps[type] || comps.bellpepper;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Ground/grass */}
      <ellipse cx="80" cy="172" rx="55" ry="12" fill="#b8de88" opacity="0.7"/>
      <Render/>
    </svg>
  );
};

/* ── PRICE OVERLAY ─────────────────────────────────────── */
const PRICE_FALLBACK = {
  '菠菜':   { price: 42,  chgPct: 2,  sparkVals: [38,40,41,43,42] },
  '番茄':   { price: 65,  chgPct: -2, sparkVals: [70,68,66,64,65] },
  '蘿蔔':   { price: 35,  chgPct: 1,  sparkVals: [32,33,34,35,35] },
  '南瓜':   { price: 55,  chgPct: 3,  sparkVals: [50,52,53,54,55] },
  '茄子':   { price: 48,  chgPct: -1, sparkVals: [52,50,49,48,48] },
  '洋蔥':   { price: 38,  chgPct: 4,  sparkVals: [34,35,36,37,38] },
  '彩椒':   { price: 118, chgPct: 3,  sparkVals: [105,110,112,115,118] },
  '花椰菜': { price: 58,  chgPct: -3, sparkVals: [64,62,60,59,58] },
  '鳳梨':   { price: 75,  chgPct: 6,  sparkVals: [66,68,71,73,75] },
};

const PriceOverlay = ({cropName, variety, market, style}) => {
  // Initial render uses the static fallback so the card never blanks out while fetching.
  const initial = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
  const [data, setData] = React.useState(initial);

  React.useEffect(() => {
    const fallback = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
    setData(fallback);
    let cancelled = false;
    const fmt = d => d.toISOString().slice(0,10);
    const today = new Date();
    // 14-day window ensures we get ≥5 trading days even when there are
    // weekends + holidays (the wholesale market doesn't trade every day).
    const fromDate = new Date(today - 14*86400000);

    fetch(`https://data.moa.gov.tw/api/v1/AgriProductsTransType/?Start-Date=${fmt(fromDate)}&End-Date=${fmt(today)}&CropName=${encodeURIComponent(cropName)}`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        // API response is { RS: "OK", Data: [...] } — unwrap. Older endpoints
        // returned a bare array, so accept that too.
        const records = Array.isArray(json?.Data) ? json.Data
                      : Array.isArray(json) ? json
                      : [];
        if (records.length === 0) throw new Error('no data');

        // Apply variety + market filters when configured. If the filter wipes
        // everything (data gap on those days), fall through to all records so
        // we still show *something* real instead of the static fallback.
        let filtered = records;
        if (variety) filtered = filtered.filter(r => r.CropName === variety);
        if (market)  filtered = filtered.filter(r => r.MarketName === market);
        if (filtered.length === 0) filtered = records;

        // Group by trading date — multiple market-day rows are aggregated by
        // volume-weighted average so the daily figure reflects actual trade.
        const byDate = {};
        for (const r of filtered) {
          const d = String(r.TransDate || r.Trans_Date || r.date || '').trim();
          if (!d) continue;
          const p = parseFloat(r.Avg_Price || r.AvgPrice || r.avg_price);
          const q = parseFloat(r.Trans_Quantity || 0);
          if (!isFinite(p) || p <= 0) continue;
          if (!byDate[d]) byDate[d] = { sumPQ: 0, sumQ: 0, prices: [] };
          byDate[d].prices.push(p);
          byDate[d].sumPQ += p * (q || 1);
          byDate[d].sumQ  += (q || 1);
        }
        // ROC dates ("115.04.28") and ISO dates both sort lexicographically.
        const days = Object.keys(byDate).sort();
        if (days.length === 0) throw new Error('no usable data');

        const dailyAvg = days.map(d => {
          const v = byDate[d];
          const avg = v.sumQ > 0 ? v.sumPQ / v.sumQ
                                 : v.prices.reduce((a,b)=>a+b, 0) / v.prices.length;
          return { date: d, price: Math.round(avg) };
        });

        // Take last 5 trading days for the sparkline.
        const recent = dailyAvg.slice(-5);
        const sparkVals = recent.map(x => x.price);
        const sparkDates = recent.map(x => {
          const parts = x.date.split(/[./-]/).map(n => parseInt(n, 10));
          return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : '';
        });

        const price = sparkVals[sparkVals.length - 1];
        const prevPrice = sparkVals.length >= 2 ? sparkVals[sparkVals.length - 2] : price;
        const chgPct = prevPrice ? Math.round((price - prevPrice) / prevPrice * 100) : 0;

        setData({ price, chgPct, sparkVals, sparkDates });
      })
      .catch(err => {
        console.warn('[price] fetch failed, keeping static fallback:', err && err.message);
      });
    return () => { cancelled = true; };
  }, [cropName, variety, market]);

  if (!data) return null;

  const { price, chgPct, sparkVals } = data;
  // Fallback doesn't carry dates — synthesize last 5 days.
  const sparkDates = data.sparkDates && data.sparkDates.length === sparkVals.length
    ? data.sparkDates
    : (() => {
        const now = new Date();
        return Array.from({length: sparkVals.length}, (_, i) => {
          const d = new Date(now - (sparkVals.length-1-i)*86400000);
          return `${d.getMonth()+1}/${d.getDate()}`;
        });
      })();

  // Chart coordinates in percent of the chart area, so the chart stretches to
  // fill available space without distorting the text labels (rendered as HTML).
  const padX = 8;       // %: left/right breathing room
  const padTop = 20;    // %: room for price labels above points
  const padBot = 22;    // %: room for date labels below
  const plotH = 100 - padTop - padBot;
  const minV = Math.min(...sparkVals);
  const maxV = Math.max(...sparkVals);
  const range = Math.max(maxV - minV, 1);
  const xPct = (i) => padX + i*(100-2*padX)/(sparkVals.length-1);
  const yPct = (v) => padTop + (1-(v-minV)/range)*plotH;
  const pts = sparkVals.map((v,i)=>`${xPct(i)},${yPct(v)}`).join(' ');

  return (
    <div style={{
      position:'absolute',
      // Default placement matches the legacy InfoPanel layout. New TopSection
      // passes its own coordinates via `style` to override.
      left:'37.0%', top:'38.0%',
      width:'28.2%', height:'35.2%',
      background:'#f5f4e1',
      border:'1.5px solid #e3e1bd',
      borderRadius:15,
      padding:'12px 14px',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      fontFamily:"'Noto Sans TC',sans-serif",
      ...style,
    }}>
      <div style={{fontSize:14,fontWeight:900,color:'#3b6826',marginBottom:4,letterSpacing:1}}>
        今日價格 <span style={{fontWeight:500,color:'#9a9a9a',fontSize:10}}>(每公斤)</span>
      </div>
      <div style={{fontSize:34,fontWeight:900,color:'#3aaa5e',lineHeight:1.1,marginBottom:2}}>
        <span style={{fontSize:16}}>$</span>{price}
      </div>
      <div style={{fontSize:10,color:chgPct>=0?'#e05050':'#3aaa5e',marginBottom:4}}>
        較昨日 {chgPct>=0?'▲':'▼'} {Math.abs(chgPct)}%
      </div>
      <div style={{flex:1, position:'relative', minHeight:0, marginTop:6}}>
        {/* Line stretches to fill the area; non-scaling-stroke keeps width crisp. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
          <polyline points={pts} fill="none" stroke="#4cae6e" strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
        </svg>
        {/* Dots + labels as HTML so fonts/circles keep real pixel size. */}
        {sparkVals.map((v,i)=>(
          <React.Fragment key={i}>
            <div style={{position:'absolute', left:`${xPct(i)}%`, top:`${yPct(v)}%`,
              width:7, height:7, background:'#4cae6e', borderRadius:'50%',
              transform:'translate(-50%,-50%)'}}/>
            <div style={{position:'absolute', left:`${xPct(i)}%`, top:`${yPct(v)}%`,
              transform:'translate(-50%,-170%)', fontSize:11, fontWeight:700,
              color:'#3aaa5e', whiteSpace:'nowrap', lineHeight:1}}>{v}</div>
            <div style={{position:'absolute', left:`${xPct(i)}%`, bottom:0,
              transform:'translateX(-50%)', fontSize:10, color:'#999',
              whiteSpace:'nowrap', lineHeight:1}}>{sparkDates[i]}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ── WEATHER OVERLAY (just the card content; parent positions it) ── */
const WMO_DESC = {
  0:'晴天',1:'大致晴朗',2:'多雲時晴',3:'多雲',
  45:'有霧',48:'凍霧',51:'毛毛雨',53:'毛毛雨',55:'大毛毛雨',
  61:'小雨',63:'中雨',65:'大雨',80:'陣雨',81:'陣雨',82:'大陣雨',
  95:'雷雨',96:'雷雨',99:'大雷雨'
};
const wmoIcon = c =>
  c===0||c===1 ? 'sun' :
  c===2        ? 'cloudsun' :
  (c>=51 && c<=82) || (c>=95 && c<=99) ? 'rain' :
                 'cloud';
const MainWxIcon = ({type, size=54}) =>
  type==='sun'      ? <SunIcon size={size}/> :
  type==='rain'     ? <RainIcon size={size}/> :
  type==='cloudsun' ? <CloudSunIcon size={size}/> :
                      <CloudIcon size={size}/>;
const dayLabel = (i) => ['明天','後天','週五'][i]||'';

// Map a static region.weather entry to the shape our renderer expects, so we can
// show something instantly while the real forecast is being fetched.
const ICON_TO_WMO = { sun: 0, cloud: 3, rain: 61 };
const DESC_TO_WMO = { '晴天': 0, '大晴天': 0, '多雲': 3, '多雲時晴': 2, '晴時多雲': 2, '多雲有雨': 61 };
const staticWx = (w) => ({
  temp: w.temp,
  code: DESC_TO_WMO[w.desc] ?? 3,
  hum:  w.hum,
  rain: w.rain,
  fore: w.fore.map(f => ({ label: f.l, temp: f.t, code: ICON_TO_WMO[f.icon] ?? 3 })),
});

// Hook: returns live weather state for the given region, with static fallback
// rendered instantly while the real fetch is in flight.
const useLiveWeather = (regionId) => {
  const region = REGIONS_DATA[regionId] || REGIONS_DATA.tainan;
  const [lat, lon] = region.coords;
  const [wx, setWx] = React.useState(() => staticWx(region.weather));

  React.useEffect(() => {
    setWx(staticWx(region.weather));
    let cancelled = false;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max&timezone=Asia%2FTaipei&forecast_days=4`)
      .then(r=>r.json())
      .then(d=>{
        if (cancelled) return;
        const days=['日','一','二','三','四','五','六'];
        setWx({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
          hum:  d.current.relative_humidity_2m,
          rain: d.current.precipitation_probability,
          fore: [1,2,3].map(i=>({
            label: i===1?'明天':i===2?'後天':'週'+days[new Date(d.daily.time[i]).getDay()],
            temp: Math.round(d.daily.temperature_2m_max[i]),
            code: d.daily.weather_code[i],
          }))
        });
      }).catch(()=>{});
    return () => { cancelled = true; };
  }, [lat, lon]);

  return wx;
};

// Weather card UI — pure presentation. Parent positions it via `style`.
// The card uses a solid #edf2f3 background to fully cover the static figures
// painted underneath it in the design PNG.
const WeatherCard = ({wx, style}) => (
  <div style={{
    position:'absolute',
    background:'#edf2f3',
    border:'1.5px solid #b1c1c4',
    borderRadius:15,
    padding:'12px 14px',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    overflow:'hidden',
    fontFamily:"'Noto Sans TC',sans-serif",
    ...style,
  }}>
    <div>
      <div style={{fontSize:14,fontWeight:900,color:'#427ea1',marginBottom:6,letterSpacing:1}}>天氣預報</div>
      <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:5}}>
        <MainWxIcon type={wmoIcon(wx.code)} size={56}/>
        <div style={{fontSize:38,fontWeight:900,color:'#427ea1',lineHeight:1,letterSpacing:-0.5}}>
          {wx.temp}<span style={{fontSize:20,fontWeight:700}}>°C</span>
        </div>
      </div>
      <div style={{fontSize:12,fontWeight:700,color:'#427ea1',textAlign:'center',marginBottom:5}}>{WMO_DESC[wx.code]||'多雲時晴'}</div>
      <div style={{fontSize:11,fontWeight:700,color:'#427ea1',display:'flex',justifyContent:'space-between',padding:'0 2px'}}>
        <span>濕度 {wx.hum}%</span>
        <span>降雨機率 {wx.rain}%</span>
      </div>
    </div>
    <div style={{borderTop:'1px solid #b8d8ea',paddingTop:6,display:'flex',justifyContent:'space-around'}}>
      {wx.fore.map((f,i)=>(
        <div key={i} style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
          <div style={{fontSize:11,fontWeight:700,color:'#427ea1'}}>{f.label}</div>
          <WeatherIcon type={wmoIcon(f.code)} size={32}/>
          <div style={{fontSize:12,fontWeight:700,color:'#5d5d5d'}}>{f.temp}°C</div>
        </div>
      ))}
    </div>
  </div>
);

/* ── TOP SECTION (new design) ──
   Single PNG background with live weather + price overlays positioned in
   percentages of the 1440×920 design canvas. The image already shows 桃園
   tomato; clicking other counties only swaps the live data overlays since the
   static design only ships a 桃園 variant. */
const COUNTY_HOTSPOTS = [
  // Approximate centers within the 1440×920 design canvas
  { id:'taipei',    cx: 412, cy: 175, r: 30, label:'台北' },
  { id:'taoyuan',   cx: 360, cy: 200, r: 36, label:'桃園' },
  { id:'yilan',     cx: 488, cy: 220, r: 30, label:'宜蘭' },
  { id:'taichung',  cx: 285, cy: 380, r: 38, label:'台中' },
  { id:'hualien',   cx: 460, cy: 430, r: 36, label:'花蓮' },
  { id:'yunlin',    cx: 225, cy: 510, r: 30, label:'雲林' },
  { id:'tainan',    cx: 200, cy: 660, r: 34, label:'台南' },
  { id:'kaohsiung', cx: 295, cy: 720, r: 32, label:'高雄' },
  { id:'pingtung',  cx: 370, cy: 800, r: 32, label:'屏東' },
];

const TopSection = ({selected, onSelect}) => {
  const region = REGIONS_DATA[selected] || REGIONS_DATA.tainan;
  const wx = useLiveWeather(selected);
  const [hovered, setHovered] = React.useState(null);

  return (
    <section style={{
      background: '#ffffff',
      padding: '20px 20px 0',
      display: 'flex',
      justifyContent: 'center',
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{
        position: 'relative',
        width: 'min(1440px, 100%)',
        aspectRatio: '1440 / 920',
      }}>
        {/* Design background — full top section as one image */}
        <img
          src={(window.DESIGN_IMGS && window.DESIGN_IMGS.top_section) || ''}
          alt=""
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            display:'block', userSelect:'none', pointerEvents:'none',
          }}
        />

        {/* Map click overlay — invisible hotspots over each county */}
        <svg
          viewBox="0 0 1440 920"
          preserveAspectRatio="none"
          style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
        >
          <defs>
            <filter id="county-glow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {COUNTY_HOTSPOTS.map(z => {
            const isSel = selected === z.id;
            const isHov = hovered === z.id && !isSel;
            return (
              <g key={z.id}
                onClick={() => onSelect(z.id)}
                onMouseEnter={() => setHovered(z.id)}
                onMouseLeave={() => setHovered(null)}
                style={{cursor:'pointer'}}>
                {(isHov || isSel) && (
                  <circle cx={z.cx} cy={z.cy} r={z.r+6}
                    fill={isSel ? "rgba(255,200,80,0.18)" : "rgba(255,255,255,0.32)"}
                    filter="url(#county-glow)"/>
                )}
                <circle cx={z.cx} cy={z.cy} r={z.r} fill="transparent"/>
              </g>
            );
          })}
        </svg>

        {/* LIVE Weather overlay — fully covers the static "天氣預報" card.
            Outer card edges (incl. border) in design 1440×920 coords:
            x=712-920, y=381-696. */}
        <WeatherCard wx={wx} style={{
          left:   `${712/1440*100}%`,
          top:    `${381/920*100}%`,
          width:  `${(920-712)/1440*100}%`,
          height: `${(696-381)/920*100}%`,
        }}/>

        {/* LIVE Price overlay — fully covers the static "今日價格" card.
            Outer card edges in design coords: x=934-1165, y=381-696. */}
        <PriceOverlay
          cropName={region.cropApi}
          variety={region.priceVariety}
          market={region.priceMarket}
          style={{
            left:   `${934/1440*100}%`,
            top:    `${381/920*100}%`,
            width:  `${(1165-934)/1440*100}%`,
            height: `${(696-381)/920*100}%`,
          }}
        />
      </div>
    </section>
  );
};


/* ── LEGEND ─────────────────────────────────────────────── */
const CROP_CATS = [
  {label:'葉菜類',color:'#5aaa5e'},{label:'根莖類',color:'#f4a030'},
  {label:'果菜類',color:'#e85050'},{label:'豆類',color:'#8ab848'},
  {label:'其他',color:'#c0a0d0'},
];
const Legend = () => (
  <div style={{background:'white',borderRadius:18,padding:'10px 14px',boxShadow:'0 4px 16px rgba(0,0,0,0.1)',minWidth:90}}>
    <div style={{background:'#e8f5e0',borderRadius:12,padding:'4px 10px',fontSize:12,fontWeight:700,color:'#4a7a2a',textAlign:'center',marginBottom:8}}>全部作物</div>
    {CROP_CATS.map(c=>(
      <div key={c.label} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'#555',marginBottom:6}}>
        <div style={{width:12,height:12,borderRadius:'50%',background:c.color,flexShrink:0}}/>
        {c.label}
      </div>
    ))}
  </div>
);

/* ── MASCOTS ROW (original 3-mascot artwork from the design) ──
   The source PNG has white padding + a subtle drop shadow around the artboard.
   Figma's frame crops it via overflow:hidden + an offset/zoom, so the mascots
   look like they sit directly on the page background. We reproduce the same
   crop here (same percentages as the original design layout). */
const MascotsRow = () => (
  <section style={{
    background: '#ffffff',
    padding: '20px 20px 20px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Noto Sans TC',sans-serif",
  }}>
    <div style={{
      position:'relative',
      width:'min(1115px, 92vw)',
      aspectRatio:'1115 / 446',
      overflow:'hidden',
    }}>
      <img
        src={(window.DESIGN_IMGS && window.DESIGN_IMGS.mascots_row) || ''}
        alt="柿子・哈密瓜・綠竹筍寶寶"
        style={{
          position:'absolute',
          width:  '112.17%',
          height: '166.85%',
          left:   '-6.29%',
          top:    '-10.62%',
          maxWidth:'none',
          userSelect:'none',
          pointerEvents:'none',
        }}
      />
    </div>
  </section>
);

/* ── FARMING DAILY SECTION ── */
const FARMING_PHOTOS = [
  // Each photo's CSS background-position % is hand-tuned to match the framing
  // chosen in the original Figma design (where the source image is offset and
  // scaled inside its 387×303 frame).
  { key:'farming_1', objX:'37%', objY:'62%', scale:1.45 },
  { key:'farming_2', objX:'50%', objY:'62%', scale:1.0  },
  { key:'farming_3', objX:'62%', objY:'62%', scale:1.95 },
];

const FarmingDailySection = () => (
  <section style={{
    background: '#9ab572',
    position: 'relative',
    padding: '120px 0 80px',
    width: '100%',
    overflow: 'hidden',
    fontFamily: "'Noto Sans TC',sans-serif",
  }}>
    {/* Top scalloped wave (white domes pushing up into the green) */}
    <svg style={{position:'absolute', top: -1, left: 0, width:'100%', height: 70, display:'block'}}
         viewBox="0 0 1440 70" preserveAspectRatio="none">
      <path d="M0,0 L0,40 Q60,70 120,40 T240,40 T360,40 T480,40 T600,40 T720,40 T840,40 T960,40 T1080,40 T1200,40 T1320,40 T1440,40 L1440,0 Z" fill="#ffffff"/>
    </svg>

    {/* Vertical "The Island of Harvest" ribbons on sides */}
    <div style={{position:'absolute', left: 12, top: '50%', transform:'translateY(-50%) rotate(-90deg)',
      transformOrigin:'center', color:'#fbf6e9', fontWeight:900, fontSize:13,
      letterSpacing:8, opacity:0.55, whiteSpace:'nowrap', userSelect:'none', pointerEvents:'none'}}>
      THE ISLAND OF HARVEST
    </div>
    <div style={{position:'absolute', right: 12, top: '50%', transform:'translateY(-50%) rotate(90deg)',
      transformOrigin:'center', color:'#fbf6e9', fontWeight:900, fontSize:13,
      letterSpacing:8, opacity:0.55, whiteSpace:'nowrap', userSelect:'none', pointerEvents:'none'}}>
      THE ISLAND OF HARVEST
    </div>

    {/* Decorative mascot cluster on left */}
    <svg width="220" height="120" viewBox="0 0 220 120"
         style={{position:'absolute', left:'4%', top:80, opacity:0.95, pointerEvents:'none'}}>
      <TomatoChar cx={45} cy={60} s={1.7}/>
      <OnionChar cx={110} cy={70} s={1.5}/>
      <RadishChar cx={170} cy={68} s={1.4}/>
    </svg>

    {/* Title */}
    <h2 style={{
      textAlign:'center', color:'#fbf6e9', fontWeight:900,
      fontSize:'clamp(28px, 3.4vw, 40px)', letterSpacing:'0.4em',
      margin:'0 0 56px', position:'relative', textIndent:'0.4em',
    }}>務農日常</h2>

    {/* Photo cards — original photography from the design */}
    <div style={{
      display:'flex', justifyContent:'center', gap:16,
      padding:'0 max(40px, 6vw)', position:'relative',
      maxWidth: 1280, margin: '0 auto', flexWrap:'wrap',
    }}>
      {FARMING_PHOTOS.map(p => (
        <div key={p.key} style={{
          width: 387, maxWidth:'100%', height: 303,
          flex: '1 1 280px',
          border:'1.5px solid #3b6826',
          borderRadius: 15, overflow:'hidden',
          background:'#fff', boxShadow:'0 4px 14px rgba(0,0,0,0.08)',
        }}>
          <img
            src={(window.DESIGN_IMGS && window.DESIGN_IMGS[p.key]) || ''}
            alt="務農日常"
            style={{
              width:'100%', height:'100%',
              objectFit:'cover',
              objectPosition: `${p.objX} ${p.objY}`,
              transform: p.scale !== 1 ? `scale(${p.scale})` : undefined,
              userSelect:'none', pointerEvents:'none',
            }}
          />
        </div>
      ))}
    </div>

    {/* Page indicator dots */}
    <div style={{display:'flex', justifyContent:'center', gap:8, marginTop:36, position:'relative'}}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width: i===1 ? 22 : 8, height: 8, borderRadius: 6,
          background: i===1 ? '#3b6826' : 'rgba(251,246,233,0.8)',
          transition:'all 0.2s',
        }}/>
      ))}
    </div>
  </section>
);

/* ── STAR FARMERS SECTION ── */
// Each farmer's circular portrait is a 240×240 region cut out of the original
// 830×553 source-image layout (matching the masks defined in the Figma file).
// `x` and `y` are the negative offsets at the design's reference 240×240 size;
// they're applied as % of the avatar so the layout stays responsive.
const STAR_FARMERS = [
  { name:'阿誠伯', region:'新北五星農夫', years:28, x: -24,  y: -16  },
  { name:'大武哥', region:'南投五星農夫', years:30, x: -295, y: -18  },
  { name:'阿嬌姊', region:'新竹五星農夫', years:27, x: -563, y: -18  },
  { name:'王叔',   region:'嘉義五星農夫', years:24, x: -565, y: -288 },
  { name:'美菱姐', region:'台東五星農夫', years:18, x: -295, y: -288 },
];

const FarmerPortrait = ({offX, offY}) => {
  const src = (window.DESIGN_IMGS && window.DESIGN_IMGS.farmers_source) || '';
  // 830 / 240 ≈ 345.83 ; 553 / 240 ≈ 230.42
  return (
    <img
      src={src}
      alt=""
      style={{
        position:'absolute',
        width: '345.83%',
        height: '230.42%',
        left: `${(offX/240)*100}%`,
        top: `${(offY/240)*100}%`,
        maxWidth: 'none',
        userSelect:'none', pointerEvents:'none',
      }}
    />
  );
};

const StarFarmersSection = () => (
  <section style={{
    background: '#fbf6e9',
    padding: '90px 20px 110px',
    position: 'relative',
    fontFamily: "'Noto Sans TC',sans-serif",
  }}>
    <h2 style={{
      textAlign:'center', color:'#3b6826', fontWeight:900,
      fontSize:'clamp(28px, 3.4vw, 40px)', letterSpacing:'0.4em',
      margin:'0 0 56px', textIndent:'0.4em',
    }}>各地五星農夫</h2>

    <div style={{
      display:'flex', justifyContent:'center', gap:'clamp(16px, 2vw, 24px)',
      flexWrap:'wrap', maxWidth:1320, margin:'0 auto',
    }}>
      {STAR_FARMERS.map(f => (
        <div key={f.name} style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          width: 240, maxWidth:'45vw',
        }}>
          <div style={{
            width:'min(240px, 45vw)', aspectRatio:'1/1',
            borderRadius:'50%', overflow:'hidden',
            position:'relative',
            boxShadow:'0 4px 14px rgba(0,0,0,0.08)',
            border:'3px solid #a48b78',
            background:'#e8e0c8',
          }}>
            <FarmerPortrait offX={f.x} offY={f.y}/>
          </div>
          <div style={{
            color:'#5d5d5d', fontWeight:700, fontSize:24,
            letterSpacing:'0.1em', marginTop:24, textAlign:'center',
          }}>{f.name}</div>
          <div style={{
            color:'#5d5d5d', fontWeight:500, fontSize:18,
            letterSpacing:'0.1em', marginTop:14, lineHeight:1.6, textAlign:'center',
          }}>
            <div>{f.region}</div>
            <div>農齡：{f.years}年</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ── FOOTER ── */
const Footer = () => (
  <footer style={{
    background: '#fbf6e9',
    padding: '20px 0 40px',
    textAlign: 'center',
    color: '#a48b78',
    fontWeight: 500,
    fontSize: 12,
    fontFamily: "'Noto Sans TC',sans-serif",
    letterSpacing: 1,
  }}>
    © 2026 農知島 The Island of Harvest 版權所有
  </footer>
);

/* ── MAIN APP ────────────────────────────────────────────── */
const App = () => {
  // Default region matches the static design (桃園 / 番茄). The user can still
  // click another county; the live weather + price overlays will refetch.
  const [selected, setSelected] = useState(()=>localStorage.getItem('tw-map-sel')||'taoyuan');
  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem('tw-map-sel', id);
  };

  // The base bundle centers a fixed-size card; this design is a multi-section
  // page, so override the body/root styles to allow vertical scrolling.
  React.useEffect(() => {
    const body = document.body;
    const root = document.getElementById('root');
    const prev = {
      bodyDisplay: body.style.display,
      bodyAlign: body.style.alignItems,
      bodyJustify: body.style.justifyContent,
      bodyBg: body.style.background,
      bodyMinH: body.style.minHeight,
      rootPadding: root ? root.style.padding : '',
      rootDisplay: root ? root.style.display : '',
      rootWidth: root ? root.style.width : '',
    };
    body.style.display = 'block';
    body.style.alignItems = '';
    body.style.justifyContent = '';
    body.style.background = '#ffffff';
    body.style.minHeight = '';
    if (root) {
      root.style.padding = '0';
      root.style.display = 'block';
      root.style.width = '100%';
    }
    return () => {
      body.style.display = prev.bodyDisplay;
      body.style.alignItems = prev.bodyAlign;
      body.style.justifyContent = prev.bodyJustify;
      body.style.background = prev.bodyBg;
      body.style.minHeight = prev.bodyMinH;
      if (root) {
        root.style.padding = prev.rootPadding;
        root.style.display = prev.rootDisplay;
        root.style.width = prev.rootWidth;
      }
    };
  }, []);

  return (
    <div style={{width:'100%', display:'flex', flexDirection:'column', background:'#ffffff'}}>

      {/* TOP — new design: single image background + live weather/price overlays */}
      <TopSection selected={selected} onSelect={handleSelect}/>

      <MascotsRow/>
      <FarmingDailySection/>
      <StarFarmersSection/>
      <Footer/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
