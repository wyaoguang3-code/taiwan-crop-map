
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

// Cards are rendered at exact design size (px) inside a ScaledOverlay wrapper
// that handles both positioning and uniform scaling for mobile.
const WeatherCard = ({wx}) => (
  <div style={{
    width:'100%', height:'100%',
    background:'#edf2f3',
    border:'1.5px solid #b1c1c4',
    borderRadius:15,
    padding:'10px 12px 8px',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    overflow:'hidden',
    boxSizing:'border-box',
    fontFamily:"'Noto Sans TC',sans-serif",
  }}>
    <div>
      <div style={{fontSize:17,fontWeight:900,color:'#427ea1',marginBottom:4,letterSpacing:1.5}}>天氣預報</div>
      <div style={{display:'flex',alignItems:'center',gap:2,marginBottom:2,marginLeft:-4}}>
        <MainWxIcon type={wmoIcon(wx.code)} size={72}/>
        <div style={{fontSize:48,fontWeight:900,color:'#427ea1',lineHeight:1,letterSpacing:-1}}>
          {wx.temp}<span style={{fontSize:26,fontWeight:700}}>°C</span>
        </div>
      </div>
      <div style={{fontSize:18,fontWeight:700,color:'#427ea1',textAlign:'center',marginBottom:8,letterSpacing:1}}>{WMO_DESC[wx.code]||'多雲時晴'}</div>
      <div style={{fontSize:15,fontWeight:700,color:'#427ea1',display:'flex',justifyContent:'space-between',padding:'0 2px'}}>
        <span>濕度 {wx.hum}%</span>
        <span>降雨機率 {wx.rain}%</span>
      </div>
    </div>
    <div style={{borderTop:'1px solid #b8d8ea',paddingTop:6,display:'flex',justifyContent:'space-around',marginBottom:-2}}>
      {wx.fore.map((f,i)=>(
        <div key={i} style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#427ea1',marginBottom:1}}>{f.label}</div>
          <WeatherIcon type={wmoIcon(f.code)} size={54}/>
          <div style={{fontSize:18,fontWeight:700,color:'#5d5d5d',marginTop:1}}>{f.temp}°C</div>
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

const PriceOverlay = ({cropName, variety, market}) => {
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
      width:'100%', height:'100%',
      background:'#f5f4e1',
      border:'1.5px solid #e3e1bd',
      borderRadius:15,
      padding:'12px 14px',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      boxSizing:'border-box',
      fontFamily:"'Noto Sans TC',sans-serif",
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

/* ── SCALED OVERLAY ────────────────────────────────────────────────────────
 * Renders `children` inside a fixed design-pixel box (`designW × designH`),
 * then uniformly scales it to match the page width via CSS `cqw`. The Page
 * container sets `container-type: inline-size`, so 100cqw = page width in px,
 * and `100cqw / 1440px` is the unitless scale factor (1 at desktop, 0.27 at
 * iPhone). Everything inside (fonts, SVG icons, padding) scales together so
 * the layout stays pixel-perfect to the design at any viewport.
 */
const ScaledOverlay = ({x, y, w, h, children}) => (
  <div style={{
    position:'absolute',
    left: `${x/1440*100}%`,
    top:  `${y/2996*100}%`,
    width: 0, height: 0,  // wrapper is just an anchor; child uses fixed px
  }}>
    <div style={{
      width: w, height: h,
      transformOrigin:'top left',
      transform:'scale(calc(100cqw / 1440px))',
    }}>
      {children}
    </div>
  </div>
);

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

  const W = 1440, H = 2996;

  return (
    <div style={{
      position:'relative',
      width:'min(1440px, 100%)',
      aspectRatio: `${W} / ${H}`,
      margin:'0 auto',
      fontFamily:"'Noto Sans TC',sans-serif",
      // Establish a query container so children can scale via cqw.
      containerType: 'inline-size',
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

      {/* Animated mascot video — replaces the 3-mascot still in the middle.
          The static image's mascots span x=288-1120, y=1092-1425; we cover a
          slightly wider area (270-1170, 1050-1500) with a solid-white panel
          and centre the video on top so no original arm/leg pokes through.   */}
      <div style={{
        position:'absolute',
        left:   `${270/1440*100}%`,
        top:    `${1050/2996*100}%`,
        width:  `${(1170-270)/1440*100}%`,
        height: `${(1500-1050)/2996*100}%`,
        background:'#ffffff',
        overflow:'hidden',
      }}>
        <video
          src="mascots.mp4"
          autoPlay loop muted playsInline
          style={{
            width:'100%', height:'100%',
            objectFit:'contain',
            display:'block',
            userSelect:'none', pointerEvents:'none',
          }}
        />
      </div>

      {/* LIVE Weather card — covers static "天氣預報" card.
          Card edges in design coords: x=712-920, y=381-696. */}
      <ScaledOverlay x={712} y={381} w={920-712} h={696-381}>
        <WeatherCard wx={wx}/>
      </ScaledOverlay>

      {/* LIVE Price card — covers static "今日價格" card.
          Card edges in design coords: x=934-1165, y=381-696. */}
      <ScaledOverlay x={934} y={381} w={1165-934} h={696-381}>
        <PriceOverlay
          cropName={region.cropApi}
          variety={region.priceVariety}
          market={region.priceMarket}
        />
      </ScaledOverlay>
    </div>
  );
};

/* ── DASHBOARD DATA ─────────────────────────────────────────────────────────
 * Pre-aggregated tomato (FJ3 牛蕃茄) market dataset bundled into the page —
 * sourced from a daily ETL that hits AMIS and persists day/week/month/year
 * series + per-market comparison. This avoids the AMIS endpoint's broken
 * date filter (it always returns latest 200 rows in prod).
 */
const useTomatoMarket = () => {
  return (window.DATASETS && window.DATASETS.tomato_market) || null;
};

/* ── CARD 1: 價格面板 (AMIS) ────────────────────────────────────────────── */
const PricePanelCard = () => {
  const m = useTomatoMarket();
  const latest = m?.latest_price?.price ?? null;
  const latestDate = m?.latest_price?.date ?? null;

  // Day-over-day change from the daily series.
  const daily = m?.daily || [];
  const prev = daily.length >= 2 ? daily[daily.length-2].price : null;
  const chgPct = (latest != null && prev) ? Math.round((latest - prev) / prev * 100) : null;

  // 1 公斤 = 0.6 台斤
  const taikinPrice = latest != null ? latest * 0.6 : null;
  // Industry rule: retail ≈ wholesale × 2
  const retailKg = latest != null ? Math.round(latest * 2) : null;
  const retailTaikin = taikinPrice != null ? Math.round(taikinPrice * 2) : null;

  const buyTag  = (chgPct != null && chgPct <  0) ? { label:'推薦購買', bg:'#a5dba6', fg:'#2c5d2e' }
                : (chgPct != null && chgPct >  10) ? { label:'高點觀望', bg:'#f3d27a', fg:'#7a5418' }
                : { label:'價格平穩', bg:'#f3d27a', fg:'#7a5418' };
  const sellTag = (chgPct != null && chgPct >  5) ? { label:'高價時機', bg:'#a5dba6', fg:'#2c5d2e' }
                : (chgPct != null && chgPct < -5) ? { label:'較弱價格', bg:'#f6a99a', fg:'#7a261a' }
                : { label:'觀望', bg:'#f3d27a', fg:'#7a5418' };

  const fmt = v => (v == null ? '—' : v.toLocaleString('zh-TW', {maximumFractionDigits:2}));

  // Position over the design's 價格面板 slot. Outer card y=87-380.
  return (
    <div style={{
      position:'absolute',
      left:   `${320/1440*100}%`,
      top:    `${87/1468*100}%`,
      width:  `${(715-320)/1440*100}%`,
      height: `${(380-87)/1468*100}%`,
      background:'#fceadb',
      border:'1.5px solid #ead1bb',
      borderRadius:14,
      padding:'14px 18px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column', gap:8,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      {/* Sub-card: 價格面板 (AMIS) */}
      <div style={{background:'#fff5e8', borderRadius:10, padding:'8px 12px', boxShadow:'0 1px 0 #f0e0c8'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div style={{fontSize:15, fontWeight:900, color:'#a85a16', letterSpacing:1}}>價格面板 (AMIS)</div>
          <div style={{fontSize:9, color:'#a89070'}}>{latestDate ? latestDate.replace(/-/g,'/') : ''}</div>
        </div>
        <div style={{marginTop:4, display:'flex', alignItems:'baseline', gap:10}}>
          <div style={{fontSize:12, color:'#7a5418', fontWeight:700}}>最新均價</div>
          <div style={{fontSize:14, fontWeight:900, color:'#5a3a18'}}>${fmt(latest)} / 公斤</div>
          <div style={{fontSize:11, color:'#a89070'}}>(${fmt(taikinPrice)} / 台斤)</div>
        </div>
      </div>
      {/* Sub-card: 試算預估零售價 */}
      <div style={{background:'#fff5e8', borderRadius:10, padding:'8px 12px', boxShadow:'0 1px 0 #f0e0c8'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <div style={{fontSize:15, fontWeight:900, color:'#a85a16', letterSpacing:1}}>試算預估零售價</div>
          <div style={{fontSize:9, color:'#a89070'}}>(口徑A: 批發 × 2)</div>
        </div>
        <div style={{marginTop:4, display:'flex', alignItems:'baseline', gap:14}}>
          <div style={{fontSize:14, fontWeight:900, color:'#5a3a18'}}>${retailKg ?? '—'} / 公斤</div>
          <div style={{fontSize:9, color:'#c8a070'}}>|</div>
          <div style={{fontSize:14, fontWeight:900, color:'#5a3a18'}}>${retailTaikin ?? '—'} / 台斤</div>
        </div>
      </div>
      {/* Sub-card: 近期交易指標 */}
      <div style={{background:'#fff5e8', borderRadius:10, padding:'8px 12px', boxShadow:'0 1px 0 #f0e0c8'}}>
        <div style={{fontSize:15, fontWeight:900, color:'#a85a16', letterSpacing:1, marginBottom:6}}>近期交易指標</div>
        <div style={{display:'flex', gap:14, fontSize:12, color:'#7a5418', alignItems:'center', flexWrap:'wrap'}}>
          <div>購買建議</div>
          <span style={{padding:'3px 10px', borderRadius:10, background:buyTag.bg, color:buyTag.fg, fontWeight:700}}>{buyTag.label}</span>
          <div>賣出建議</div>
          <span style={{padding:'3px 10px', borderRadius:10, background:sellTag.bg, color:sellTag.fg, fontWeight:700}}>{sellTag.label}</span>
        </div>
      </div>
    </div>
  );
};

/* ── CARD 2: 批發市場行情趨勢圖 (toggle 每週/每月/一年/每年) ──────────── */
const TrendChartCard = () => {
  const m = useTomatoMarket();
  const [period, setPeriod] = useState('weekly');
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  React.useEffect(() => {
    if (!m || !window.Chart || !canvasRef.current) return;
    // '一年' = last 52 weeks of weekly series; '每週' = full weekly series
    let entries, priceLabel;
    if (period === 'weekly')      { entries = m.weekly;  priceLabel = '每週均價 (NTD/公斤)'; }
    else if (period === 'monthly'){ entries = m.monthly; priceLabel = '每月均價 (NTD/公斤)'; }
    else if (period === 'year52') { entries = m.weekly.slice(-52); priceLabel = '每週均價 (NTD/公斤)'; }
    else                          { entries = m.yearly;  priceLabel = '每年均價 (NTD/公斤)'; }
    const labels = entries.map(e => e.key || e.date);
    const prices = entries.map(e => e.price);
    const volumes = entries.map(e => e.volume);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label:'交易量 (KG)', data: volumes, backgroundColor:'rgba(168,213,176,0.55)', borderColor:'rgba(168,213,176,1)', borderWidth:0, yAxisID:'y2', order:2 },
          { label: priceLabel, data: prices, type:'line', borderColor:'#3578d4', backgroundColor:'#3578d4', tension:0.25, pointRadius: period==='weekly' ? 1.5 : 3, pointHoverRadius:6, borderWidth:2, yAxisID:'y1', order:1 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins: {
          legend:{ position:'top', labels:{ font:{size:11}, boxWidth:14, color:'#3a4a6a' } },
          tooltip:{ callbacks:{ label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toLocaleString('zh-TW') ?? '—'}` } },
        },
        scales: {
          x: { ticks:{font:{size:10}, color:'#666', maxRotation:60, autoSkip:true,
                       maxTicksLimit: period==='weekly' ? 14 : period==='monthly' ? 12 : period==='yearly' ? 11 : 12},
               grid:{display:false} },
          y1:{ position:'left',  title:{display:true,text:'價格 (NTD/公斤)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666'}, grid:{color:'rgba(0,0,0,0.05)'} },
          y2:{ position:'right', title:{display:true,text:'交易量 (KG)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666',callback:v=>v>=1e6?(v/1e6).toFixed(0)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v}, grid:{drawOnChartArea:false} },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [m, period]);

  return (
    <div style={{
      position:'absolute',
      left:   `${726/1440*100}%`,
      top:    `${87/1468*100}%`,
      width:  `${(1407-726)/1440*100}%`,
      height: `${(374-87)/1468*100}%`,
      background:'#f4f6e8',
      border:'1.5px solid #d8dcc0',
      borderRadius:14,
      padding:'10px 14px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column', gap:6,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:17, fontWeight:900, color:'#5a7028', letterSpacing:1.5}}>批發市場行情趨勢圖</div>
        <div style={{display:'flex', gap:6}}>
          {[['weekly','每週'],['monthly','每月'],['year52','一年'],['yearly','每年']].map(([k, label]) => (
            <button key={k} onClick={()=>setPeriod(k)} style={{
              fontSize:11, padding:'3px 12px',
              border:'1px solid '+(period===k?'#7a8c2a':'#d8dcc0'),
              background: period===k ? '#bcc865' : '#fefef0',
              color: period===k ? '#3d4a10' : '#7a8c2a',
              borderRadius:14, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700,
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1, background:'#fff', border:'1px solid #e3e6cd', borderRadius:10, padding:'8px 10px', position:'relative', minHeight:0}}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};

/* ── CARD 3: 批發市場成交量比較 ─────────────────────────────────────────── */
const VolumeBarsCard = () => {
  const m = useTomatoMarket();
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  React.useEffect(() => {
    if (!m || !window.Chart || !canvasRef.current) return;
    const list = (m.market_compare?.markets_volume) || [];
    const labels = list.map(x => x.market);
    const vols   = list.map(x => Math.round(x.volume));

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label:'當月累積成交量 (KG)', data: vols, backgroundColor:'rgba(70,184,142,0.85)', borderColor:'#3aa07a', borderWidth:1 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: {
          legend:{ position:'top', labels:{font:{size:11}, color:'#256b54'}},
          tooltip:{ callbacks:{ label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toLocaleString('zh-TW')} KG` } },
        },
        scales: {
          x:{ ticks:{font:{size:10},color:'#666',maxRotation:60,minRotation:45}, grid:{display:false} },
          y:{ title:{display:true,text:'交易量 (KG)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666',callback:v=>v.toLocaleString('zh-TW')}, grid:{color:'rgba(0,0,0,0.05)'} },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [m]);

  return (
    <div style={{
      position:'absolute',
      left:   `${34/1440*100}%`,
      top:    `${385/1468*100}%`,
      width:  `${(713-34)/1440*100}%`,
      height: `${(829-385)/1468*100}%`,
      background:'#dceef0',
      border:'1.5px solid #b6d7da',
      borderRadius:14,
      padding:'10px 14px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column', gap:6,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:17, fontWeight:900, color:'#256b78', letterSpacing:1.5}}>批發市場成交量比較</div>
        <div style={{fontSize:9, color:'#7a9a9e'}}>(當月交易日累積{m?.market_compare?.month ? '・' + m.market_compare.month : ''})</div>
      </div>
      <div style={{flex:1, background:'#fff', border:'1px solid #cfe3e7', borderRadius:10, padding:'8px 10px', position:'relative', minHeight:0}}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};

/* ── CARD 4: 批發市場價格比較 ───────────────────────────────────────────── */
const PriceBarsCard = () => {
  const m = useTomatoMarket();
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  React.useEffect(() => {
    if (!m || !window.Chart || !canvasRef.current) return;
    const list = (m.market_compare?.markets_price) || [];
    const labels = list.map(x => x.market);
    const prices = list.map(x => Math.round(x.price * 10) / 10);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label:'當月加權均價 (NTD/公斤, 低到高)', data: prices, backgroundColor:'rgba(245,167,40,0.9)', borderColor:'#d88820', borderWidth:1 }] },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: {
          legend:{ position:'top', labels:{font:{size:11}, color:'#a8581a'}},
          tooltip:{ callbacks:{ label: ctx => `${ctx.dataset.label}: $${ctx.raw} / 公斤` } },
        },
        scales: {
          x:{ ticks:{font:{size:10},color:'#666',maxRotation:60,minRotation:45}, grid:{display:false} },
          y:{ title:{display:true,text:'價格 (NTD/公斤)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666'}, grid:{color:'rgba(0,0,0,0.05)'} },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [m]);

  return (
    <div style={{
      position:'absolute',
      left:   `${727/1440*100}%`,
      top:    `${385/1468*100}%`,
      width:  `${(1407-727)/1440*100}%`,
      height: `${(829-385)/1468*100}%`,
      background:'#fcedd6',
      border:'1.5px solid #eed8b4',
      borderRadius:14,
      padding:'10px 14px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column', gap:6,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:17, fontWeight:900, color:'#a8581a', letterSpacing:1.5}}>批發市場價格比較</div>
        <div style={{fontSize:9, color:'#bb9a72'}}>(當月交易量加權均價；可挑價格較佳市場)</div>
      </div>
      <div style={{flex:1, background:'#fff', border:'1px solid #f0e0c8', borderRadius:10, padding:'8px 10px', position:'relative', minHeight:0}}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};

/* ── CARD 6: 每年農作物災損金額 ─────────────────────────────────────────── */
const DisasterChartCard = () => {
  const ds = window.DATASETS && window.DATASETS.disaster_yearly;
  const canvasRef = React.useRef(null);
  const chartRef  = React.useRef(null);

  React.useEffect(() => {
    if (!ds || !window.Chart || !canvasRef.current) return;
    const rows = ds.yearly || [];
    const labels = rows.map(r => r.year);
    const losses = rows.map(r => r.loss_100m_ntd);
    const qtys = rows.map(r => r.loss_qty_ton);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label:'災損金額 (億元)', data: losses, backgroundColor:'rgba(245,150,150,0.85)', borderColor:'#e67878', borderWidth:1, yAxisID:'y1', order:2 },
          { label:'災損數量 (公噸)', data: qtys, type:'line', borderColor:'#3fb6c8', backgroundColor:'#3fb6c8', tension:0.25, pointRadius:4, pointHoverRadius:6, borderWidth:2.5, yAxisID:'y2', order:1 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins: {
          legend:{ position:'top', labels:{font:{size:11}, color:'#3a6a78'}},
          tooltip:{ callbacks:{ label: ctx => {
            const v = ctx.raw;
            if (v == null) return ctx.dataset.label + ': —';
            return ctx.dataset.label + ': ' + v.toLocaleString('zh-TW');
          }}},
        },
        scales: {
          x:{ ticks:{font:{size:11}, color:'#666'}, grid:{display:false} },
          y1:{ position:'left',  title:{display:true,text:'金額 (億元)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666'}, grid:{color:'rgba(0,0,0,0.05)'} },
          y2:{ position:'right', title:{display:true,text:'數量 (公噸)',font:{size:10},color:'#666'}, ticks:{font:{size:10},color:'#666',callback:v=>v.toLocaleString('zh-TW')}, grid:{drawOnChartArea:false} },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [ds]);

  // Card position: x=726-1407, y=842-1287 (mirrors export-trend's mid-bottom row).
  return (
    <div style={{
      position:'absolute',
      left:   `${726/1440*100}%`,
      top:    `${842/1468*100}%`,
      width:  `${(1407-726)/1440*100}%`,
      height: `${(1287-842)/1468*100}%`,
      background:'#ddeee8',
      border:'1.5px solid #b7d3c8',
      borderRadius:14,
      padding:'14px 18px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column', gap:10,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:18, fontWeight:900, color:'#2e7c6c', letterSpacing:1.5}}>每年農作物災損金額</div>
        <div style={{fontSize:10, color:'#7aa090'}}>(億元)</div>
      </div>
      <div style={{flex:1, background:'#fff', border:'1px solid #cfe3d8', borderRadius:10, padding:'8px 10px', position:'relative', minHeight:0}}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};

/* ── EXPORT TREND CHART (interactive, real data from agrstat.moa.gov.tw) ───
 * Replaces the static "外銷趨勢圖" cell in the dashboard image with a
 * Chart.js bar+line chart. Data lives in window.DATASETS.tomato_export
 * (parsed from the ODS export of 蕃茄,生鮮冷藏 1989-01 to 2026-03).
 */
const COUNTRY_OPTIONS = ['全球','APEC','CPTPP(12)','CPTPP','東協六國','歐盟','新南向國家','TPP','區域全面經濟夥伴關係協定'];

const ExportTrendChart = () => {
  const data = window.DATASETS && window.DATASETS.tomato_export;
  const [country, setCountry] = useState('全球');
  const [period, setPeriod] = useState('yearly');
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!data || !window.Chart || !canvasRef.current) return;
    const cd = data.data[country];
    if (!cd) return;
    const series = period === 'yearly' ? cd.yearly : cd.monthly;

    let entries = Object.entries(series);
    // Yearly: keep last 11 years (matches the design's 2016–2026 range).
    // Monthly: last 60 months stays legible.
    if (period === 'yearly') entries = entries.slice(-11);
    if (period === 'monthly') entries = entries.slice(-60);

    const labels = entries.map(([k]) => k);
    const weights = entries.map(([,v]) => v?.w ?? null);
    const avgPrices = entries.map(([,v]) =>
      (v?.w && v?.v) ? Math.round(v.v * 1000 / v.w) : null);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            // Bars on the right axis = export volume (公噸), light-blue palette.
            label: '出口量 (公噸)',
            data: weights,
            backgroundColor: 'rgba(189,211,250,0.95)',
            borderColor: 'rgba(165,193,238,1)',
            borderWidth: 1,
            yAxisID: 'y2',
            order: 2,
            barPercentage: 0.75,
            categoryPercentage: 0.85,
          },
          {
            // Line on the left axis = average price (NTD/公噸), purple.
            label: '均價 (NTD/公噸)',
            data: avgPrices,
            type: 'line',
            borderColor: '#9070d0',
            backgroundColor: '#9070d0',
            yAxisID: 'y1',
            tension: 0.25,
            pointRadius: period==='yearly' ? 4 : 1.5,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            order: 1,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 14, color:'#5d3fb8' } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw;
                if (v == null) return ctx.dataset.label + ': —';
                return ctx.dataset.label + ': ' + v.toLocaleString('zh-TW');
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, color:'#666', maxRotation: 0, autoSkip: true, maxTicksLimit: period==='yearly' ? 11 : 8 },
            grid: { display: false },
          },
          y1: {
            position:'left',
            title:{display:true, text:'均價 (NTD/公噸)', font:{size:10}, color:'#666'},
            ticks:{font:{size:10}, color:'#666'},
            grid:{color:'rgba(0,0,0,0.05)'},
          },
          y2: {
            position:'right',
            title:{display:true, text:'出口量 (公噸)', font:{size:10}, color:'#666'},
            ticks:{font:{size:10}, color:'#666'},
            grid:{drawOnChartArea:false},
          },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [country, period, data]);

  if (!data) {
    return <div style={{padding:20,color:'#888',fontSize:12}}>資料未載入</div>;
  }

  // Two-layer nested layout matching the design:
  //   outer card (lavender bg + title + toggle)         x=34-713, y=842-1287
  //   └── inner chart card (white bg + canvas)          x=54-693, y=908-1241
  // (Earlier numbers were off — they pointed at the inner chart card's edges,
  // not the outer wrapper. Right and bottom now extend to match the design's
  // full lavender wrapper, so the card matches its neighbour 災損金額.)
  return (
    <div style={{
      position:'absolute',
      left:   `${34/1440*100}%`,
      top:    `${842/1468*100}%`,
      width:  `${(713-34)/1440*100}%`,
      height: `${(1287-842)/1468*100}%`,
      background:'#ece8f8',
      border:'1.5px solid #d4cfe8',
      borderRadius:14,
      padding:'14px 18px',
      boxSizing:'border-box',
      display:'flex', flexDirection:'column',
      gap:10,
      fontFamily:"'Noto Sans TC',sans-serif",
    }}>
      {/* Outer header: title + 每月/每年 toggle (and country picker for interactivity) */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:18, fontWeight:900, color:'#5d3fb8', letterSpacing:1.5}}>外銷趨勢圖</div>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <select
            value={country}
            onChange={e=>setCountry(e.target.value)}
            style={{
              fontSize:12, padding:'3px 8px',
              border:'1px solid #d4cfe8', borderRadius:14,
              background:'#fff', color:'#5d3fb8',
              fontFamily:'inherit', cursor:'pointer',
            }}>
            {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {[['monthly','每月'], ['yearly','每年']].map(([k, label]) => (
            <button key={k} onClick={()=>setPeriod(k)} style={{
              fontSize:12, padding:'4px 14px',
              border:'1px solid '+(period===k?'#7560d4':'#e8dfd0'),
              background: period===k ? '#7560d4' : '#faf2dd',
              color: period===k ? '#fff' : '#a8956e',
              borderRadius:16, cursor:'pointer',
              fontFamily:'inherit', fontWeight:700,
            }}>{label}</button>
          ))}
        </div>
      </div>
      {/* Inner chart card */}
      <div style={{
        flex:1,
        background:'#ffffff',
        border:'1px solid #e4dff0',
        borderRadius:10,
        padding:'8px 10px',
        position:'relative',
        minHeight:0,
        boxSizing:'border-box',
      }}>
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
};

/* ── DASHBOARD PAGE (clicking the tomato character opens this) ───────────
 * Mobile fix: dashboard cards use a mix of percent / cqw / Chart.js fixed-px
 * that all scale differently, breaking layout below ~1000px viewports. We
 * render the entire dashboard at fixed design pixels (1440×1468) inside a
 * uniformly-scaled wrapper so positioning and font sizes shrink as one unit
 * down to any viewport. Cards above remain unchanged.
 */
const Dashboard = ({onBack}) => (
  <div style={{
    position:'relative',
    width:'100%',
    maxWidth:1440,
    margin:'0 auto',
    aspectRatio:'1440 / 1468',
    overflow:'hidden',
    containerType: 'inline-size',
  }}>
    <div style={{
      position:'absolute', inset:0,
      width:1440, height:1468,
      transformOrigin:'top left',
      transform:'scale(calc(100cqw / 1440px))',
    }}>
      {/* Logo click area — covers the static "農知島 The Island of Harvest"
          mark in the top-left of the dashboard image; click returns to home. */}
      <div
        onClick={onBack}
        title="返回首頁"
        style={{
          position:'absolute',
          left: 16, top: 6,
          width: 200, height: 56,
          cursor:'pointer',
          zIndex: 5,
        }}
      />
      <img
        src={(window.DESIGN_IMGS && window.DESIGN_IMGS.tomato_dashboard) || ''}
        alt="桃園市 番茄市場儀表板"
        style={{display:'block', width:1440, height:'auto', userSelect:'none'}}
      />
      <PricePanelCard/>
      <TrendChartCard/>
      <VolumeBarsCard/>
      <PriceBarsCard/>
      <ExportTrendChart/>
      <DisasterChartCard/>
    </div>
  </div>
);

/* ── MAIN APP ────────────────────────────────────────────────────────────── */
const App = () => {
  const [selected, setSelected] = useState(()=>localStorage.getItem('tw-map-sel')||'taoyuan');
  const [view, setView] = useState(() => window.location.hash === '#dashboard' ? 'dashboard' : 'main');

  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem('tw-map-sel', id);
    // Tomato click on the map → open the dashboard view.
    if (id === 'taoyuan') {
      window.location.hash = 'dashboard';
    }
  };

  // Sync view with URL hash so browser back/forward works and the URL is shareable.
  React.useEffect(() => {
    const sync = () => setView(window.location.hash === '#dashboard' ? 'dashboard' : 'main');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // Scroll to top when switching views.
  React.useEffect(() => { window.scrollTo(0, 0); }, [view]);

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

  if (view === 'dashboard') {
    return <Dashboard onBack={() => { window.location.hash = ''; }}/>;
  }
  return <Page selected={selected} onSelect={handleSelect}/>;
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
