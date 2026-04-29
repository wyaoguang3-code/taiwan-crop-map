
const { useState } = React;

/* ── REGION DATA ─────────────────────────────────────────────────────────────
 * Each county has its own coords (for Open-Meteo weather), the crop the design
 * features for that county (used to query the wholesale-price API), and an
 * optional `priceVariety` / `priceMarket` to scope the price filter. The map
 * click overlay flips `selected` between counties; the data overlays refetch.
 *
 * The static fields (mascotName, weather example, etc.) are baked into the
 * design's full-page PNG, so we don't render them here — they're only kept so
 * we have a per-region static fallback before live data arrives.
 */
const REGIONS_DATA = {
  taipei:    { name:'台北市', coords:[25.0330,121.5654], cropApi:'菠菜',   weather:{temp:24,desc:'晴時多雲',hum:72,rain:15,fore:[{l:'明天',t:23,icon:'cloud'},{l:'後天',t:22,icon:'cloud'},{l:'週五',t:25,icon:'sun'}]} },
  taoyuan:   { name:'桃園市', coords:[24.9937,121.3010], cropApi:'番茄',   priceVariety:'番茄-牛番茄', weather:{temp:26,desc:'晴天',hum:65,rain:5,fore:[{l:'明天',t:25,icon:'sun'},{l:'後天',t:24,icon:'sun'},{l:'週五',t:26,icon:'cloud'}]} },
  yilan:     { name:'宜蘭縣', coords:[24.7021,121.7377], cropApi:'蘿蔔',   weather:{temp:22,desc:'多雲有雨',hum:85,rain:45,fore:[{l:'明天',t:22,icon:'cloud'},{l:'後天',t:21,icon:'cloud'},{l:'週五',t:23,icon:'cloud'}]} },
  taichung:  { name:'台中市', coords:[24.1477,120.6736], cropApi:'南瓜',   weather:{temp:27,desc:'多雲',hum:68,rain:12,fore:[{l:'明天',t:26,icon:'cloud'},{l:'後天',t:25,icon:'sun'},{l:'週五',t:27,icon:'sun'}]} },
  hualien:   { name:'花蓮縣', coords:[23.9871,121.6015], cropApi:'茄子',   weather:{temp:26,desc:'晴天',hum:70,rain:8,fore:[{l:'明天',t:25,icon:'sun'},{l:'後天',t:26,icon:'sun'},{l:'週五',t:27,icon:'sun'}]} },
  yunlin:    { name:'雲林縣', coords:[23.7092,120.4313], cropApi:'洋蔥',   weather:{temp:29,desc:'晴天',hum:62,rain:5,fore:[{l:'明天',t:28,icon:'sun'},{l:'後天',t:27,icon:'sun'},{l:'週五',t:30,icon:'sun'}]} },
  tainan:    { name:'台南市', coords:[22.9999,120.2269], cropApi:'彩椒',   weather:{temp:28,desc:'多雲時晴',hum:70,rain:10,fore:[{l:'明天',t:27,icon:'cloud'},{l:'後天',t:26,icon:'cloud'},{l:'週五',t:28,icon:'sun'}]} },
  kaohsiung: { name:'高雄市', coords:[22.6273,120.3014], cropApi:'花椰菜', weather:{temp:30,desc:'晴天',hum:65,rain:5,fore:[{l:'明天',t:29,icon:'sun'},{l:'後天',t:28,icon:'sun'},{l:'週五',t:31,icon:'sun'}]} },
  pingtung:  { name:'屏東縣', coords:[22.6690,120.4873], cropApi:'鳳梨',   weather:{temp:32,desc:'大晴天',hum:60,rain:3,fore:[{l:'明天',t:31,icon:'sun'},{l:'後天',t:30,icon:'sun'},{l:'週五',t:32,icon:'sun'}]} },
};

/* ── WEATHER ICONS ─────────────────────────────────────────────────────── */
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

/* ── WEATHER LIVE-FETCH HOOK + CARD ────────────────────────────────────── */
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

const ICON_TO_WMO = { sun: 0, cloud: 3, rain: 61 };
const DESC_TO_WMO = { '晴天': 0, '大晴天': 0, '多雲': 3, '多雲時晴': 2, '晴時多雲': 2, '多雲有雨': 61 };
const staticWx = (w) => ({
  temp: w.temp,
  code: DESC_TO_WMO[w.desc] ?? 3,
  hum:  w.hum,
  rain: w.rain,
  fore: w.fore.map(f => ({ label: f.l, temp: f.t, code: ICON_TO_WMO[f.icon] ?? 3 })),
});

const useLiveWeather = (regionId) => {
  const region = REGIONS_DATA[regionId] || REGIONS_DATA.taoyuan;
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

const WeatherCard = ({wx, style}) => (
  <div style={{
    position:'absolute',
    background:'#edf2f3',
    border:'1.5px solid #b1c1c4',
    borderRadius:15,
    padding:'10px 12px 8px',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    overflow:'hidden',
    fontFamily:"'Noto Sans TC',sans-serif",
    ...style,
  }}>
    <div>
      <div style={{fontSize:17,fontWeight:900,color:'#427ea1',marginBottom:4,letterSpacing:1.5}}>天氣預報</div>
      <div style={{display:'flex',alignItems:'center',gap:2,marginBottom:2,marginLeft:-4}}>
        <MainWxIcon type={wmoIcon(wx.code)} size={72}/>
        <div style={{fontSize:48,fontWeight:900,color:'#427ea1',lineHeight:1,letterSpacing:-1}}>
          {wx.temp}<span style={{fontSize:26,fontWeight:700}}>°C</span>
        </div>
      </div>
      <div style={{fontSize:14,fontWeight:700,color:'#427ea1',textAlign:'center',marginBottom:6}}>{WMO_DESC[wx.code]||'多雲時晴'}</div>
      <div style={{fontSize:12.5,fontWeight:700,color:'#427ea1',display:'flex',justifyContent:'space-between',padding:'0 2px'}}>
        <span>濕度 {wx.hum}%</span>
        <span>降雨機率 {wx.rain}%</span>
      </div>
    </div>
    <div style={{borderTop:'1px solid #b8d8ea',paddingTop:6,display:'flex',justifyContent:'space-around'}}>
      {wx.fore.map((f,i)=>(
        <div key={i} style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
          <div style={{fontSize:13,fontWeight:700,color:'#427ea1'}}>{f.label}</div>
          <WeatherIcon type={wmoIcon(f.code)} size={42}/>
          <div style={{fontSize:14,fontWeight:700,color:'#5d5d5d'}}>{f.temp}°C</div>
        </div>
      ))}
    </div>
  </div>
);

/* ── PRICE LIVE-FETCH OVERLAY ──────────────────────────────────────────── */
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
  const initial = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
  const [data, setData] = React.useState(initial);

  React.useEffect(() => {
    const fallback = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
    setData(fallback);
    let cancelled = false;
    const fmt = d => d.toISOString().slice(0,10);
    const today = new Date();
    const fromDate = new Date(today - 14*86400000);
    fetch(`https://data.moa.gov.tw/api/v1/AgriProductsTransType/?Start-Date=${fmt(fromDate)}&End-Date=${fmt(today)}&CropName=${encodeURIComponent(cropName)}`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const records = Array.isArray(json?.Data) ? json.Data
                      : Array.isArray(json) ? json : [];
        if (records.length === 0) throw new Error('no data');

        let filtered = records;
        if (variety) filtered = filtered.filter(r => r.CropName === variety);
        if (market)  filtered = filtered.filter(r => r.MarketName === market);
        if (filtered.length === 0) filtered = records;

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
        const days = Object.keys(byDate).sort();
        if (days.length === 0) throw new Error('no usable data');

        const dailyAvg = days.map(d => {
          const v = byDate[d];
          const avg = v.sumQ > 0 ? v.sumPQ / v.sumQ
                                 : v.prices.reduce((a,b)=>a+b, 0) / v.prices.length;
          return { date: d, price: Math.round(avg) };
        });

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
  const sparkDates = data.sparkDates && data.sparkDates.length === sparkVals.length
    ? data.sparkDates
    : (() => {
        const now = new Date();
        return Array.from({length: sparkVals.length}, (_, i) => {
          const d = new Date(now - (sparkVals.length-1-i)*86400000);
          return `${d.getMonth()+1}/${d.getDate()}`;
        });
      })();

  // Sparkline coordinates in % of the chart area (the chart fills the bottom
  // half of the card; the price/chg metadata sits above).
  const padX = 8, padTop = 20, padBot = 22;
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
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
          <polyline points={pts} fill="none" stroke="#4cae6e" strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
        </svg>
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

/* ── MAP CLICK HOTSPOT ─────────────────────────────────────────────────────
 * Single click region centered on the 番茄寶寶 character standing on 桃園市
 * in the grey map. Coordinates are in the 1440×2996 design canvas. Tested
 * visually against full_page.jpg to land on the body of the tomato mascot.
 */
const TOMATO_HOTSPOT = { id:'taoyuan', cx: 482, cy: 200, r: 44 };

/* ── PAGE ───────────────────────────────────────────────────────────────────
 * The whole page is rendered as one design PNG (full_page.jpg, 1440×2996),
 * with a transparent SVG over the map for click hotspots and 2 absolutely-
 * positioned cards (Weather, Price) that overlay the static data figures so
 * they show live values from Open-Meteo + 農業部交易行情 APIs.
 */
const Page = ({selected, onSelect}) => {
  const region = REGIONS_DATA[selected] || REGIONS_DATA.taoyuan;
  const wx = useLiveWeather(selected);
  const [hovered, setHovered] = React.useState(null);

  // Card positions in design 1440×920 (top section). The full canvas is 2996
  // tall, but the cards sit in the top 920px so we express them as % of the
  // FULL canvas height too.
  const W = 1440, H = 2996;
  const pos = (x, y, w, h) => ({
    left:   `${x/W*100}%`,
    top:    `${y/H*100}%`,
    width:  `${w/W*100}%`,
    height: `${h/H*100}%`,
  });

  return (
    <div style={{
      position:'relative',
      width:'min(1440px, 100%)',
      aspectRatio: `${W} / ${H}`,
      margin:'0 auto',
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      {/* Full design as page background */}
      <img
        src={(window.DESIGN_IMGS && window.DESIGN_IMGS.full_page) || ''}
        alt=""
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          display:'block',
          userSelect:'none', pointerEvents:'none',
        }}
      />

      {/* Click hotspot — invisible circle over the tomato character. Glow on hover. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
      >
        <defs>
          <filter id="tomato-glow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g
          onClick={() => onSelect(TOMATO_HOTSPOT.id)}
          onMouseEnter={() => setHovered(TOMATO_HOTSPOT.id)}
          onMouseLeave={() => setHovered(null)}
          style={{cursor:'pointer'}}>
          {hovered === TOMATO_HOTSPOT.id && (
            <circle cx={TOMATO_HOTSPOT.cx} cy={TOMATO_HOTSPOT.cy} r={TOMATO_HOTSPOT.r+8}
              fill="rgba(255,255,255,0.32)" filter="url(#tomato-glow)"/>
          )}
          <circle cx={TOMATO_HOTSPOT.cx} cy={TOMATO_HOTSPOT.cy} r={TOMATO_HOTSPOT.r} fill="transparent"/>
        </g>
      </svg>

      {/* LIVE Weather card — covers the static "天氣預報" card.
          Outer card edges in design coords: x=712-920, y=381-696. */}
      <WeatherCard wx={wx} style={pos(712, 381, 920-712, 696-381)}/>

      {/* LIVE Price card — covers the static "今日價格" card.
          Outer card edges in design coords: x=934-1165, y=381-696. */}
      <PriceOverlay
        cropName={region.cropApi}
        variety={region.priceVariety}
        market={region.priceMarket}
        style={pos(934, 381, 1165-934, 696-381)}
      />
    </div>
  );
};

/* ── MAIN APP ────────────────────────────────────────────────────────────── */
const App = () => {
  const [selected, setSelected] = useState(()=>localStorage.getItem('tw-map-sel')||'taoyuan');
  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem('tw-map-sel', id);
  };

  // The base bundle centers a fixed-size card; we render a full-width page,
  // so override body/root layout to allow vertical scroll and full-bleed.
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

  return <Page selected={selected} onSelect={handleSelect}/>;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
