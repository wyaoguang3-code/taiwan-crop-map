
const { useState, useRef } = React;

/* ── REGION DATA ─────────────────────────────────────────── */
const REGIONS_DATA = {
  taipei:    { name:'台北市',  charType:'leafy',     mascotName:'菠菜寶寶',   mascotDesc:'哈囉！我是來自台北的菠菜寶寶！這裡氣候溫和濕潤，很適合葉菜類生長，快來看看今天的天氣和市場資訊吧！', coords:[25.0330,121.5654], cropApi:'菠菜',   weather:{temp:24,desc:'晴時多雲',hum:72,rain:15,fore:[{l:'明天',t:23,icon:'cloud'},{l:'後天',t:22,icon:'cloud'},{l:'週五',t:25,icon:'sun'}]}, price:{val:45,chg:2}, tips:['喜歡涼爽潮濕環境','需要充足水分','土壤保持濕潤','定期施肥促進生長'], crops:[{name:'高麗菜寶寶',type:'leafy'},{name:'番茄寶寶',type:'tomato'},{name:'青椒寶寶',type:'bellpepper'},{name:'韭菜寶寶',type:'leafy'},{name:'芹菜寶寶',type:'leafy'}] },
  taoyuan:   { name:'桃園市',  charType:'tomato',    mascotName:'番茄寶寶',   mascotDesc:'哈囉！我是來自桃園的番茄寶寶！這裡土壤肥沃，陽光充足，是我最愛的家鄉！', coords:[24.9937,121.3010], cropApi:'番茄', weather:{temp:26,desc:'晴天',hum:65,rain:5,fore:[{l:'明天',t:25,icon:'sun'},{l:'後天',t:24,icon:'sun'},{l:'週五',t:26,icon:'cloud'}]}, price:{val:65,chg:-2}, tips:['喜歡充足日照','土壤排水要良好','適當修剪枝葉','定期充足澆水'], crops:[{name:'番茄寶寶',type:'tomato'},{name:'草莓寶寶',type:'tomato'},{name:'高麗菜寶寶',type:'leafy'},{name:'蘿蔔寶寶',type:'radish'},{name:'花椰菜寶寶',type:'broccoli'}] },
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

const CHAR_COMPS = { leafy:LeafyChar, tomato:TomatoChar, bellpepper:BellPepperChar,
  eggplant:EggplantChar, pumpkin:PumpkinChar, broccoli:BroccoliChar,
  pineapple:PineappleChar, radish:RadishChar, onion:OnionChar,
  corn:CornChar, asparagus:AsparagusChar };

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

const PriceOverlay = ({cropName}) => {
  // Initial render uses the static fallback so the card never blanks out while fetching.
  const initial = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
  const [data, setData] = React.useState(initial);

  React.useEffect(() => {
    const fallback = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
    // Snap to this crop's fallback instantly — no blank state.
    setData(fallback);
    let cancelled = false;
    const fmt = d => d.toISOString().slice(0,10);
    const today = new Date();
    const weekAgo = new Date(today - 7*86400000);

    // Try Taiwan COA wholesale price API
    fetch(`https://data.moa.gov.tw/api/v1/AgriProductsTransType/?Start-Date=${fmt(weekAgo)}&End-Date=${fmt(today)}&CropName=${encodeURIComponent(cropName)}`)
      .then(r => r.json())
      .then(arr => {
        if (cancelled) return;
        if (!arr || arr.length === 0) throw new Error('no data');
        // Sort by date desc, get latest
        arr.sort((a,b) => (b.Trans_Date||b.date||'').localeCompare(a.Trans_Date||a.date||''));
        const latest = arr[0];
        const prev = arr[1];
        const price = Math.round(parseFloat(latest.Avg_Price || latest.avg_price || latest.AvgPrice || fallback.price));
        const prevPrice = prev ? Math.round(parseFloat(prev.Avg_Price || prev.avg_price || fallback.price)) : price;
        const chgPct = prevPrice ? Math.round((price-prevPrice)/prevPrice*100) : 0;
        // Build sparkline from last 5 data points
        const recent = arr.slice(0,5).reverse();
        const sparkVals = recent.map(d => Math.round(parseFloat(d.Avg_Price||d.avg_price||fallback.price)));
        // Dates can be ROC format ("113.05.06") or ISO ("2026-05-06"); output as "M/D"
        const sparkDates = recent.map(d => {
          const s = String(d.Trans_Date || d.date || '').trim();
          const parts = s.split(/[./-]/).map(x => parseInt(x, 10));
          if (parts.length >= 3 && !isNaN(parts[1]) && !isNaN(parts[2])) {
            return `${parts[1]}/${parts[2]}`;
          }
          return '';
        });
        setData({ price, chgPct, sparkVals, sparkDates });
      })
      .catch(() => {
        // Keep whatever we showed (fallback); nothing else to do.
      });
    return () => { cancelled = true; };
  }, [cropName]);

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
      left:'37.0%', top:'38.0%',
      width:'28.2%', height:'35.2%',
      background:'#f4f3df',
      borderRadius:13,
      padding:'10px 12px',
      boxShadow:'0 2px 10px rgba(0,0,0,0.07)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{fontSize:11,fontWeight:700,color:'#555',marginBottom:4}}>
        今日價格 <span style={{fontWeight:400,color:'#aaa',fontSize:9}}>(每公斤)</span>
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

/* ── INFO PANEL (static image + real weather overlay) ── */
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

const InfoPanel = ({regionId}) => {
  const region = REGIONS_DATA[regionId] || REGIONS_DATA.tainan;
  const [lat, lon] = region.coords;
  // Instant render with static fallback so the card never blanks out.
  const [wx, setWx] = React.useState(() => staticWx(region.weather));

  React.useEffect(() => {
    // Snap to this region's static data immediately, then upgrade with live data.
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

  return (
    <div style={{position:'relative',height:'100%',overflow:'hidden',borderRadius:'0 20px 20px 0'}}>
      {/* Static background image — prefer a region-specific PNG if present. */}
      <img src={(window.RIGHT_PANEL_IMGS && window.RIGHT_PANEL_IMGS[regionId]) || window.RIGHT_PANEL_IMG}
        alt="右側面板"
        style={{width:'100%',height:'100%',objectFit:'fill',display:'block',pointerEvents:'none'}}/>


      {/* Real price overlay — positioned over the static price card */}
      <PriceOverlay cropName={region.cropApi}/>
      {/* Real weather overlay — positioned over the static weather card */}
      {wx && (
        <div style={{
          position:'absolute',
          left:'10.6%', top:'38.0%',
          width:'24.4%', height:'35.2%',
          background:'#daedf7',
          borderRadius:13,
          padding:'10px 12px 10px 12px',
          boxShadow:'0 2px 10px rgba(0,0,0,0.07)',
          display:'flex', flexDirection:'column',
          justifyContent:'space-between',
          overflow:'hidden',
          fontFamily:"'Noto Sans TC',sans-serif",
        }}>
          {/* Top group: title + icon+temp + desc + humidity */}
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#4a6a8a',marginBottom:6}}>天氣預報</div>
            <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:5}}>
              <MainWxIcon type={wmoIcon(wx.code)} size={58}/>
              <div style={{fontSize:38,fontWeight:900,color:'#1e3a5f',lineHeight:1,letterSpacing:-0.5}}>
                {wx.temp}<span style={{fontSize:18,fontWeight:700}}>°C</span>
              </div>
            </div>
            <div style={{fontSize:13,color:'#5c7a94',textAlign:'center',marginBottom:5}}>{WMO_DESC[wx.code]||'多雲時晴'}</div>
            <div style={{fontSize:11.5,color:'#7a98b0',display:'flex',justifyContent:'space-between',padding:'0 2px'}}>
              <span>濕度 {wx.hum}%</span>
              <span>降雨機率 {wx.rain}%</span>
            </div>
          </div>
          {/* Forecast */}
          <div style={{borderTop:'1px solid #b8d8ea',paddingTop:8,display:'flex',justifyContent:'space-around'}}>
            {wx.fore.map((f,i)=>(
              <div key={i} style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <div style={{fontSize:12,color:'#7a98b0'}}>{f.label}</div>
                <WeatherIcon type={wmoIcon(f.code)} size={38}/>
                <div style={{fontSize:12.5,fontWeight:600,color:'#4a6a8a'}}>{f.temp}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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

/* ── MAIN APP ────────────────────────────────────────────── */
const App = () => {
  const [selected, setSelected] = useState(()=>localStorage.getItem('tw-map-sel')||'tainan');
  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem('tw-map-sel', id);
  };

  return (
    <div style={{display:'flex',width:'min(1280px,100vw)',height:'min(720px,92vh)',borderRadius:24,overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,0.2)'}}>

      {/* LEFT: Map panel — real image + transparent click overlay.
          overflow:visible so hover glows near the east edge (e.g. Yilan) don't get clipped.
          Outer card's overflow:hidden still handles the rounded-corner clipping. */}
      <div style={{flex:'0 0 44%',minWidth:0,position:'relative',overflow:'visible'}}>
        <TaiwanMap selected={selected} onSelect={handleSelect}/>
      </div>

      {/* RIGHT: Info panel */}
      <div style={{flex:1,background:'#fdf7ef',overflowY:'auto',display:'flex',flexDirection:'column'}}>
        <InfoPanel regionId={selected}/>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
