
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

// CWA 中央氣象署 Open Data — 取代 Open-Meteo（台灣本土資料更準確）
// F-D0047-089 = 鄉鎮 3 天 3hr 預報（即時）；F-D0047-091 = 鄉鎮 1 週 12hr 預報（明天/後天/週N）
// API key 為個人申請的 free key — 寫死在前端，理論上會被看到，最壞情況：被 CWA 限速
const CWA_KEY = 'CWA-8AA974C3-7C59-45FF-A587-5256281E5003';

// CWA「天氣現象」中文 → 我們 4 種 icon (sun/cloudsun/cloud/rain) 對應的 WMO code
// 規則：含雨/雷 → 61(rain icon)；多雲時晴 → 2(cloudsun)；晴天 → 0(sun)；其他 → 3(cloud)
const cwaTextToWmo = (txt) => {
  const t = String(txt || '');
  if (/雨|雷/.test(t)) return 61;
  if (/多雲時晴|晴時多雲/.test(t)) return 2;
  if (t === '晴天' || t === '晴') return 0;
  if (/多雲|陰|霧/.test(t)) return 3;
  return 3;
};

// 取一個 ElementValue 陣列裡的指定 key（CWA 結構慣例）
const _cwaVal = (timeArr, key) =>
  (timeArr || []).map(t => (t.ElementValue && t.ElementValue[0] && t.ElementValue[0][key]));

const useLiveWeather = (regionId) => {
  const region = REGIONS_DATA[regionId] || REGIONS_DATA.taoyuan;
  const [lat, lon] = region.coords;
  const cityName = region.name;  // 例：「桃園市」— 對應 CWA LocationName
  const [wx, setWx] = React.useState(() => staticWx(region.weather));
  React.useEffect(() => {
    setWx(staticWx(region.weather));
    let cancelled = false;
    const base = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore';
    const u3 = `${base}/F-D0047-089?Authorization=${CWA_KEY}&format=JSON&LocationName=${encodeURIComponent(cityName)}`;
    const uw = `${base}/F-D0047-091?Authorization=${CWA_KEY}&format=JSON&LocationName=${encodeURIComponent(cityName)}`;
    Promise.all([fetch(u3).then(r=>r.json()), fetch(uw).then(r=>r.json())])
      .then(([d3, dw]) => {
        if (cancelled) return;
        const sub3 = d3?.records?.Locations?.[0]?.Location?.[0];
        const subW = dw?.records?.Locations?.[0]?.Location?.[0];
        if (!sub3 || !subW) return;
        const els3 = sub3.WeatherElement || [];
        const elsW = subW.WeatherElement || [];

        const find = (arr, name) => (arr || []).find(e => e.ElementName === name);

        // 即時值（從 3hr 預報第一格）
        const tNow = _cwaVal(find(els3, '溫度')?.Time, 'Temperature')[0];
        const hNow = _cwaVal(find(els3, '相對濕度')?.Time, 'RelativeHumidity')[0];
        const rNow = _cwaVal(find(els3, '3小時降雨機率')?.Time, 'ProbabilityOfPrecipitation')[0];
        const wxNow = _cwaVal(find(els3, '天氣現象')?.Time, 'Weather')[0];

        // 未來 3 天最高溫 / 天氣 — 從 12hr 系列彙整成日（白天那一段）
        const dayLabels = ['日','一','二','三','四','五','六'];
        const maxTimes = find(elsW, '最高溫度')?.Time || [];
        const wxTimes = find(elsW, '天氣現象')?.Time || [];
        // 取「白天 06-18」段（StartTime 是當日 06:00 的那筆）— index 0/2/4 通常是白天
        const dailyByDate = {};
        maxTimes.forEach((t, i) => {
          const date = (t.StartTime || '').slice(0, 10);
          const startHour = Number((t.StartTime || '').slice(11, 13));
          // 偏好白天段（06-18）；若不是白天段就 fallback
          if (!dailyByDate[date] || (startHour === 6 && dailyByDate[date].startHour !== 6)){
            dailyByDate[date] = {
              startHour,
              maxTemp: Number(t.ElementValue?.[0]?.MaxTemperature),
              wxText: '',
            };
          }
        });
        wxTimes.forEach(t => {
          const date = (t.StartTime || '').slice(0, 10);
          const startHour = Number((t.StartTime || '').slice(11, 13));
          if (dailyByDate[date] && (startHour === 6 || !dailyByDate[date].wxText)){
            dailyByDate[date].wxText = t.ElementValue?.[0]?.Weather || '';
          }
        });
        const todayStr = new Date().toISOString().slice(0, 10);
        const futureDates = Object.keys(dailyByDate).sort().filter(d => d > todayStr).slice(0, 3);

        const fore = futureDates.map((d, i) => {
          const dt = new Date(d);
          return {
            label: i === 0 ? '明天' : (i === 1 ? '後天' : '週' + dayLabels[dt.getDay()]),
            temp: Number.isFinite(dailyByDate[d].maxTemp) ? Math.round(dailyByDate[d].maxTemp) : 25,
            code: cwaTextToWmo(dailyByDate[d].wxText),
          };
        });

        setWx({
          temp: Number.isFinite(Number(tNow)) ? Math.round(Number(tNow)) : region.weather.temp,
          code: cwaTextToWmo(wxNow),
          hum:  Number.isFinite(Number(hNow)) ? Math.round(Number(hNow)) : region.weather.hum,
          rain: Number.isFinite(Number(rNow)) ? Math.round(Number(rNow)) : region.weather.rain,
          fore: fore.length === 3 ? fore : staticWx(region.weather).fore,
        });
      }).catch(()=>{});
    return () => { cancelled = true; };
  }, [lat, lon, cityName]);
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
  const tm = useTomatoMarket();

  React.useEffect(() => {
    const fallback = PRICE_FALLBACK[cropName] || PRICE_FALLBACK['彩椒'];
    setData(fallback);
    let cancelled = false;

    // 番茄 uses the daily-updated nongzhidao snapshot (useTomatoMarket fetches
    // it at runtime, falling back to the bundled copy). Other crops still hit
    // the live AMIS endpoint, which is unreliable but the only data we have.
    if (cropName === '番茄' && tm && Array.isArray(tm.daily) && tm.daily.length >= 5) {
      const recent = tm.daily.slice(-7);
      const sparkVals = recent.map(d => Math.round(d.price));
      const sparkDates = recent.map(d => {
        const parts = String(d.date || '').split(/[./-]/).map(n => parseInt(n, 10));
        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : '';
      });
      const price = sparkVals[sparkVals.length - 1];
      const prevPrice = sparkVals[sparkVals.length - 2] || price;
      const chgPct = prevPrice ? Math.round((price - prevPrice) / prevPrice * 100) : 0;
      setData({ price, chgPct, sparkVals, sparkDates });
      return () => { cancelled = true; };
    }

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
  }, [cropName, variety, market, tm]);

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

/* ── TW COUNTIES POLYGON OVERLAY ──────────────────────────────────────────
 * 18 個縣市的 SVG path，從 Figma 設計檔抽出（node id 51:5082~51:5101）。
 * Coordinates 在 1440×2996 design canvas 系統，cx/cy 是該 polygon 在 canvas
 * 的絕對位置，viewBox 是該 polygon 原始的 SVG viewBox。
 * 51:5082 isBase=true 是台灣本島輪廓底層，不參與 hover。
 */
const TW_COUNTIES = [
  { id:'51_5082', isBase:true,  cx:224.001, cy:163.000, cw:446.999, ch:712.593, viewBox:'0 0 466.822 732.466', d:'M456.856 74.8654C456.316 63.1225 448.205 56.222 438.986 50.737C433.128 47.2449 426.973 44.684 420.883 42.1044C413.163 38.8358 405.545 35.5485 398.719 30.3615C397.211 29.2068 395.73 27.9682 394.305 26.6086C388.867 21.4216 384.257 12.2769 376.528 10.2002C368.221 7.97457 340.507 19.4195 332.676 24.1874C326.958 27.6702 323.317 32.6244 316.994 35.3157C309.59 38.4633 299.58 40.1023 291.534 42.7004C276.746 47.4684 266.167 53.2141 253.111 61.0179C245.884 65.3295 241.601 66.6798 235.24 73.0867C221.132 87.2881 216.131 109.005 204.407 124.919C195.504 137.007 182.467 144.485 171.553 154.402C161.794 163.268 151.671 174.536 142.741 184.351C129.75 198.636 117.262 213.219 106.553 229.041C96.4953 243.894 88.7939 261.271 76.632 274.858C70.9328 281.218 64.7773 286.918 59.1992 293.39C41.2822 314.175 38.1905 332.204 30.1539 357.738C24.3523 376.167 16.2691 398.172 12.2834 416.723C4.96391 450.787 15.7104 467.969 28.3659 497.61C46.0129 538.91 54.8131 558.951 85.5625 592.345C101.571 609.731 143.784 648.387 147.993 669.554C150.684 683.131 145.693 704.354 153.934 715.455C159.466 722.904 170.436 725.27 177.578 718.546C183.901 712.596 195.346 667.607 199.062 656.246C205.916 635.275 212.984 610.895 221.393 590.771C224.54 583.247 227.204 579.764 232.558 573.785C253.455 550.43 278.049 529.002 298.928 505.656C326.455 474.879 331.605 431.678 342.044 392.594C355.156 343.5 366.554 293.399 382.795 245.44C393.849 233.232 403.478 229.833 412.194 214.737C416.217 207.772 430.828 178.996 431.815 172.468C434.814 152.475 417.754 129.669 427.606 112.404C435.745 98.1277 457.769 94.1792 456.875 74.8747L456.856 74.8654Z'},
  { id:'51_5083', isBase:false, cx:505.623, cy:163.000, cw:165.323, ch:129.191, viewBox:'0 0 172.123 135.992', d:'M150.852 44.2193C135.924 35.3353 119.097 32.4205 106.171 20.0909C100.733 14.9039 96.1233 5.75916 88.3941 3.6825C80.0874 1.45684 52.3738 12.9018 44.5421 17.6697C38.8243 21.1525 35.1831 26.1067 28.86 28.798C21.4567 31.9456 11.4459 33.5845 3.4 36.1827L56.8344 131.905C60.0844 134.428 60.6618 129.279 63.8559 127.705C84.6505 117.452 117.803 83.6386 138.327 79.299C149.26 76.9895 163.21 80.4351 168.723 68.3663C168.183 56.6234 160.071 49.7229 150.852 44.2379V44.2193Z'},
  { id:'51_5084', isBase:false, cx:467.200, cy:195.775, cw:92.951,  ch:111.735, viewBox:'0 0 99.7522 118.534', d:'M41.8327 3.40003C41.8327 3.40003 96.934 97.3526 96.3474 99.3268C95.5651 101.962 75.0313 115.642 70.878 115.121C61.8543 106.833 49.8879 101.85 42.3635 92.0259C37.4093 85.5445 32.8462 76.5953 28.7954 69.3968C19.9859 53.7148 12.3777 37.325 3.40052 21.7268C16.4658 13.923 27.0447 8.16797 41.8234 3.40934L41.8327 3.40003Z'},
  { id:'51_5085', isBase:false, cx:376.446, cy:545.669, cw:179.687, ch:263.652, viewBox:'0 0 186.486 270.452', d:'M183.077 3.4C172.638 42.484 167.488 85.6842 139.96 116.462C119.082 139.808 94.4881 161.235 73.5911 184.591C68.2365 190.569 65.5732 194.052 62.4256 201.577C54.0165 221.701 46.9484 246.081 40.0945 267.052C40.0945 267.052 19.421 246.928 10.3787 235.772C2.994 226.664 2.64944 225.752 4.0463 213.785C6.99832 188.465 14.9511 163.303 16.9346 138.057C16.3014 134.416 11.9153 130.346 8.37655 129.862C14.1316 128.26 20.492 131.594 22.5966 124.694C22.5966 124.694 29.1804 69.8438 37.4032 56.7878C43.894 46.479 74.9507 26.6344 74.9507 26.6344C76.2638 27.2024 123.99 56.0149 123.99 56.0149L136.152 50.5206C136.152 50.5206 152.271 19.9295 162.971 11.2131C168.698 6.54757 176.148 5.19729 183.086 3.4H183.077Z'},
  { id:'51_5086', isBase:false, cx:445.297, cy:359.132, cw:180.967, ch:239.160, viewBox:'0 0 187.767 245.961', d:'M184.367 12.0887C175.651 27.184 166.022 30.5831 154.968 42.7916C138.727 90.7503 127.329 140.851 114.217 189.946C107.289 191.743 99.839 193.093 94.1026 197.759C83.4027 206.485 67.2829 237.066 67.2829 237.066L55.121 242.561C55.121 242.561 7.39503 213.748 6.08199 213.18L3.40003 185.923C16.5305 175.176 38.1911 151.672 38.1911 151.672L71.3152 48.2859L99.8856 3.40022C110.427 5.97975 168.229 11.3716 184.358 12.0887H184.367Z'},
  { id:'51_5087', isBase:false, cx:242.455, cy:540.509, cw:205.533, ch:204.919, viewBox:'0 0 212.334 211.719', d:'M206.252 4.5457C206.252 3.39097 208.933 31.803 208.933 31.803C208.933 31.803 177.877 51.6477 171.386 61.9565L156.579 129.862C156.579 129.862 148.114 133.438 142.359 135.031C139.612 134.649 75.4592 151.802 75.4592 151.802C75.4592 151.802 64.5171 193.615 60.5966 208.319C29.8565 174.925 21.047 154.885 3.4 113.584C18.1508 111.312 41.6273 113.733 54.9254 107.243C60.6991 104.421 85.0044 81.5404 88.4779 76.0089C90.8898 72.1629 92.1563 67.3856 90.0796 63.0926C96.7007 64.983 101.888 58.0639 105.948 53.715C112.765 46.4141 117.765 37.1576 126.128 31.4491C146.969 24.5673 167.456 15.376 187.934 8.13097C190.579 7.19042 201.12 3.42821 203.113 3.40027C204.482 3.38164 205.125 4.00556 206.252 4.55499V4.5457Z'},
  { id:'51_5088', isBase:false, cx:299.633, cy:666.962, cw:113.499, ch:208.630, viewBox:'0 0 120.299 215.443', d:'M99.4014 3.40008C99.4014 3.40008 83.8031 67.1713 80.8511 92.501C79.4543 104.458 79.7988 105.371 87.1835 114.487C96.2258 125.644 116.899 145.768 116.899 145.768C113.184 157.129 101.739 202.117 95.4157 208.068C88.2731 214.791 77.3031 212.426 71.7715 204.976C63.5301 193.885 68.5308 172.653 65.8302 159.075C61.6304 137.899 19.408 99.2431 3.40006 81.8662C7.32057 67.1619 18.2626 25.3494 18.2626 25.3494L99.392 3.4094L99.4014 3.40008Z'},
  { id:'51_5089', isBase:false, cx:320.651, cy:337.425, cw:221.150, ch:83.122,  viewBox:'0 0 227.951 89.9224', d:'M173.873 6.54773C183.222 6.57566 206.252 4.29413 206.252 4.29413C206.252 4.29413 222.139 22.7699 224.551 25.098C218.945 38.3402 195.98 69.9837 195.98 69.9837C179.199 66.296 162.567 58.5946 145.321 57.9707L57.0209 86.5224L3.40028 48.0902C14.1095 32.2685 26.6067 17.6853 39.5882 3.40014C52.9701 8.77338 66.3706 14.3236 80.0132 19.0449C102.4 26.7928 110.744 29.2141 134.761 23.2821C141.885 21.522 157.306 15.3386 162.679 10.5427L173.863 6.53842L173.873 6.54773Z'},
  { id:'51_5090', isBase:false, cx:523.494, cy:227.958, cw:147.478, ch:139.863, viewBox:'0 0 154.278 146.663', d:'M106.171 143.263C90.0424 142.546 32.2405 137.154 21.6989 134.574C20.8608 134.118 3.40005 113.771 3.40005 113.771C5.48602 106.805 14.5749 82.9373 14.5749 82.9373C18.7282 83.4681 99.9321 18.6726 120.457 14.333C131.389 12.0235 145.339 15.4691 150.852 3.40028C151.737 22.7142 129.722 26.6533 121.583 40.9292C111.731 58.2036 128.791 81.0003 125.793 100.994C124.815 107.531 110.194 136.297 106.171 143.263Z'},
  { id:'51_5091', isBase:false, cx:226.354, cy:493.928, cw:200.635, ch:113.743, viewBox:'0 0 207.436 120.544', d:'M149.074 9.81872C160.584 10.6382 174.329 44.0883 184.414 50.8584C190.141 54.7044 197.321 54.7323 204.035 54.6951C183.557 61.9401 163.07 71.1314 142.229 78.0133L111.917 117.144L86.6992 79.764C85.5911 78.2368 84.5294 77.0075 82.8253 76.0391C79.9571 74.4094 59.1346 70.0419 55.9125 70.3399C51.3494 70.7589 46.0973 77.7339 41.9719 80.0899C36.2261 83.3586 33.0786 82.3249 26.8672 81.9524C19.0634 81.4868 11.1572 80.2575 3.40002 79.2797C7.38572 60.7295 15.4689 38.7243 21.2705 20.2951L94.7544 3.74706C105.091 1.54002 110.958 10.4613 118.985 14.4004C127.636 18.6469 149.064 9.81872 149.064 9.81872H149.074Z'},
  { id:'51_5092', isBase:false, cx:224.000, cy:560.852, cw:110.890, ch:89.832,  viewBox:'0 0 117.684 96.6322', d:'M5.76662 12.3539C13.5238 13.3317 21.4207 14.561 29.2338 15.0266C35.4452 15.3991 38.5928 16.4328 44.3385 13.1641C48.4639 10.8174 53.7161 3.83313 58.2791 3.41408C61.5012 3.11608 82.3237 7.48358 85.1919 9.11325C86.896 10.0817 87.8552 11.3948 89.0658 12.8382L114.284 50.2181C110.81 55.7589 79.1575 84.0779 73.3838 86.8902C60.0857 93.3809 36.6092 90.9597 21.8584 93.2319C9.19358 63.5906 -1.54359 46.4093 5.77593 12.3446L5.76662 12.3539Z'},
  { id:'51_5093', isBase:false, cx:356.849, cy:278.012, cw:130.085, ch:82.621,  viewBox:'0 0 136.885 89.4209', d:'M133.475 67.4692C128.102 72.265 105.687 80.9535 98.5726 82.7135C74.5559 88.6455 66.212 86.215 43.8251 78.4764C30.1825 73.755 16.7819 68.2049 3.40005 62.8316C12.3306 53.0164 22.4439 41.7484 32.2125 32.883C43.1267 22.9746 56.164 15.4875 65.0666 3.40001C70.4585 9.00606 133.485 67.4785 133.485 67.4785L133.475 67.4692Z'},
  { id:'51_5094', isBase:false, cx:244.243, cy:446.464, cw:127.784, ch:64.358,  viewBox:'0 0 134.585 71.1579', d:'M32.4454 3.40003L111.377 17.201C112.653 17.4245 118.203 18.3836 119.311 20.4231C119.889 21.4847 131.185 61.4999 131.185 61.4999L100.649 65.2901L76.884 51.2098L3.40007 67.7579C11.4366 42.2233 14.5284 24.1945 32.4454 3.40932V3.40003Z'},
  { id:'51_5095', isBase:false, cx:273.289, cy:382.115, cw:101.462, ch:81.362,  viewBox:'0 0 108.262 88.1626', d:'M50.7628 3.4L104.383 41.8322C105.101 43.0428 104.868 44.1323 104.607 45.4081C104.169 47.5686 90.2659 84.7622 90.2659 84.7622L3.40005 67.7485C8.97817 61.2764 15.1337 55.5773 20.8328 49.2169C33.0041 35.6395 40.6961 18.2532 50.7535 3.4H50.7628Z'},
  { id:'51_5096', isBase:false, cx:415.106, cy:210.701, cw:122.972, ch:134.780, viewBox:'0 0 122.971 134.78',  d:'M52.3205 0.0078125C53.4482 0.082906 54.4712 0.716143 55.0402 1.7041C59.5735 9.57618 63.7539 17.639 67.8771 25.6436C72.0111 33.6689 76.0845 41.628 80.4523 49.4033L82.0256 52.2324C85.589 58.6907 89.3062 65.6718 93.3088 71.041L93.7551 71.6309L93.757 71.6338C97.1759 76.1021 101.671 79.5529 106.69 83.0322C111.582 86.4246 117.135 89.9397 121.871 94.29C122.896 95.2314 123.244 96.7023 122.749 98.0029V98.0039C122.749 98.0045 122.749 98.0058 122.748 98.0068L122.724 98.0703C122.707 98.1153 122.681 98.1828 122.648 98.2705C122.581 98.4463 122.482 98.7059 122.357 99.0381C122.105 99.7026 121.743 100.66 121.302 101.831C120.419 104.174 119.221 107.368 117.958 110.779C115.413 117.654 112.663 125.248 111.653 128.606C111.278 129.85 110.228 130.773 108.945 130.982C108.348 131.08 101.476 132.033 93.6252 132.954C85.8251 133.869 76.7248 134.795 71.8078 134.78C70.8962 134.777 70.1677 134.429 69.922 134.311C69.5553 134.133 69.1992 133.916 68.884 133.709C68.2449 133.289 67.4964 132.723 66.6916 132.076C65.0674 130.771 62.9726 128.943 60.6017 126.801C55.8478 122.504 49.8276 116.796 43.9308 111.112C38.0286 105.423 32.2268 99.7356 27.9025 95.4727C25.74 93.3408 23.9453 91.5634 22.6916 90.3193C22.0649 89.6975 21.5727 89.2085 21.2375 88.875C21.07 88.7084 20.9413 88.5805 20.8547 88.4941C20.8114 88.451 20.7781 88.4175 20.756 88.3955C20.7452 88.3847 20.7362 88.3766 20.7306 88.3711C20.728 88.3684 20.7262 88.3656 20.7248 88.3643L20.7228 88.3633C20.7228 88.3632 20.7228 88.3624 20.7267 88.3584V88.3574L20.7228 88.3623C20.6857 88.3253 20.6496 88.2875 20.6144 88.249C15.311 83.1113 6.28627 75.1983 0.949387 69.6494C-0.198199 68.4561 -0.319465 66.6095 0.662278 65.2764C6.28971 57.6375 10.3019 48.609 14.8654 39.2412C19.3179 30.1014 24.2637 20.7287 31.6652 13.2217C31.7098 13.1711 31.7549 13.1206 31.8029 13.0723C38.5625 6.27306 43.5695 4.53574 50.3381 0.483398C50.8657 0.167493 51.4702 8.19988e-05 52.0851 0H52.0939L52.3205 0.0078125Z'},
  { id:'51_5099', isBase:false, cx:360.164, cy:392.005, cw:153.068, ch:153.226, viewBox:'0 0 159.868 160.026', d:'M156.458 15.413L123.334 118.799C123.334 118.799 101.683 142.303 88.5431 153.05L70.2256 156.626L44.2813 155.667L15.2733 115.968C12.88 108.453 3.4 74.8911 3.4 74.8911L17.5083 31.9518L105.808 3.4C123.055 4.02393 139.687 11.7253 156.468 15.413H156.458Z'},
  { id:'51_5100', isBase:false, cx:547.033, cy:199.417, cw:40.010,  ch:52.228,  viewBox:'0 0 46.8106 59.0278', d:'M21.85 3.4453C23.9081 3.1473 25.0814 4.36722 26.4224 5.69889C32.1961 11.4819 39.5715 23.4297 41.3874 31.3172C42.3466 35.4799 45.2614 46.4405 41.6575 49.2249C40.1395 50.3983 25.3236 55.5667 23.4238 55.6225C21.8687 55.6691 21.3379 55.4084 20.0993 54.5982C19.0284 53.8998 10.3865 44.9692 10.0233 44.0473C7.94666 38.7392 12.547 36.2528 12.1465 33.3008C10.4237 27.881 -0.369301 22.368 4.78044 16.3243C6.54048 14.2663 15.7132 7.29131 18.302 5.56852C19.3543 4.87009 20.5463 3.63154 21.8407 3.43598L21.85 3.4453Z'},
  { id:'51_5101', isBase:false, cx:602.990, cy:183.445, cw:46.397,  ch:38.091,  viewBox:'0 0 53.1965 44.8871', d:'M12.0066 34.8479C15.2566 36.4683 36.4609 41.0127 40.5677 41.3573C41.5641 41.4411 42.5419 41.6366 43.5383 41.3014C46.1365 40.4167 48.7998 26.057 49.7962 21.7175C37.5132 15.2454 24.3082 11.837 13.2172 3.40002C10.4049 7.72096 3.77443 14.9381 3.42056 18.0111C3.01082 21.5964 8.561 33.1344 12.0066 34.8572V34.8479Z'},
];

// 桃園 (51:5096) 在 Figma 設計中已是彩色（粉橘紅）— hover color 沿用同色系
const HOVER_FILL = '#f5a78a';
const TAOYUAN_BASE_FILL = '#f5a78a';

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

      {/* 縣市 polygon overlay：滑過任一縣市 → 填上桃園色，視覺呼應背景 */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
      >
        {TW_COUNTIES.map(c => (
          <svg
            key={c.id}
            x={c.cx} y={c.cy} width={c.cw} height={c.ch}
            viewBox={c.viewBox}
            preserveAspectRatio="none"
            style={{overflow:'visible'}}
          >
            <path
              d={c.d}
              fill={
                c.isBase
                  ? 'transparent'  // 底層輪廓不填色（背景圖已是灰色）
                  : (hovered === c.id ? HOVER_FILL : 'transparent')
              }
              opacity={hovered === c.id ? 0.85 : 1}
              style={{
                cursor: c.isBase ? 'default' : 'pointer',
                pointerEvents: c.isBase ? 'none' : 'auto',
                transition: 'fill 0.18s ease, opacity 0.18s ease',
              }}
              onMouseEnter={c.isBase ? undefined : () => setHovered(c.id)}
              onMouseLeave={c.isBase ? undefined : () => setHovered(null)}
              onClick={c.isBase ? undefined : () => {
                // 暫時所有縣市都 select 'taoyuan'（其他縣市無資料）— 未來各縣市可獨立
                if (c.id === '51_5096') onSelect('taoyuan');
              }}
            />
          </svg>
        ))}
        {/* 原本的 TOMATO_HOTSPOT click 區保留 — 角色身上仍可點 */}
        <circle
          cx={TOMATO_HOTSPOT.cx} cy={TOMATO_HOTSPOT.cy} r={TOMATO_HOTSPOT.r}
          fill="transparent"
          style={{cursor:'pointer'}}
          onClick={() => onSelect(TOMATO_HOTSPOT.id)}
        />
      </svg>

      {/* Animated mascot video — replaces the 3-mascot still in the middle.
          Full-width white panel (covers the entire row in the background image)
          with the video centred via objectFit:contain.                         */}
      <div style={{
        position:'absolute',
        left:   0,
        top:    `${1050/2996*100}%`,
        width:  '100%',
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
// Module-level cache so every component share the same fetch result.
let _tmCache = (typeof window !== 'undefined' && window.DATASETS && window.DATASETS.tomato_market) || null;
let _tmFetched = false;
const _tmListeners = new Set();

const useTomatoMarket = () => {
  const [data, setData] = React.useState(_tmCache);
  React.useEffect(() => {
    _tmListeners.add(setData);
    if (!_tmFetched) {
      _tmFetched = true;
      // Live snapshot from nongzhidao's daily-updated cron. Fall back silently to the
      // bundled copy if the cross-origin fetch fails (offline, CORS rejection, etc).
      fetch('https://wyaoguang3-code.github.io/nongzhidao/data/code_FJ3.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(j => {
          if (j && Array.isArray(j.daily) && j.daily.length) {
            _tmCache = j;
            for (const fn of _tmListeners) fn(j);
          }
        })
        .catch(err => console.warn('[tomato_market] live fetch failed, using bundled:', err));
    }
    return () => { _tmListeners.delete(setData); };
  }, []);
  return data;
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

  // 元/台斤 = 元/公斤 ÷ 1.5 (matches the conversion used by nongzhidao FJ3.html)
  const taikinPrice = latest != null ? latest / 1.5 : null;
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
