export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    const url = new URL(request.url);
    
    // =========================
    // 1. 处理位置更新请求
    // =========================
    if (url.pathname === '/api/update-location' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { lat, lon } = body;
        
        if (typeof lat !== 'number' || typeof lon !== 'number' || 
            lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          });
        }
        
        const weather = await getWeatherByCoords(lat, lon);
        const locationCookie = `user_location=${lat},${lon}; path=/; max-age=3600; samesite=lax`;
        
        return new Response(JSON.stringify({
          success: true,
          weather: weather
        }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'set-cookie': locationCookie
          }
        });
        
      } catch (error) {
        console.error('Location update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update location' }), {
          status: 500,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // =========================
    // 2. 处理语言切换请求
    // =========================
    if (url.pathname === '/api/set-language' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { lang } = body;
        
        const supportedLangs = ['zh', 'en', 'ja', 'ko'];
        if (!supportedLangs.includes(lang)) {
          return new Response(JSON.stringify({ error: 'Unsupported language' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          });
        }
        
        const langCookie = `preferred_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
        
        return new Response(JSON.stringify({
          success: true,
          lang: lang
        }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'set-cookie': langCookie
          }
        });
        
      } catch (error) {
        console.error('Language update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update language' }), {
          status: 500,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // =========================
    // 3. 健康检查
    // =========================
    if (url.pathname === '/health') {
      return new Response('OK', { 
        status: 200,
        headers: { 'content-type': 'text/plain' }
      });
    }

    // =========================
    // 4. Edge Cache
    // =========================
    const cacheKey = new Request(url.toString(), request);
    let cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-Cache-Hit', 'true');
      return new Response(cached.body, {
        status: cached.status,
        headers: headers
      });
    }

    try {
      // =========================
      // 5. 检测语言
      // =========================
      let lang = detectLanguage(request);
      
      const langParam = url.searchParams.get('lang');
      if (langParam && ['zh', 'en', 'ja', 'ko'].includes(langParam)) {
        lang = langParam;
      }
      
      // =========================
      // 6. 获取位置和天气数据
      // =========================
      const ip = getIP(request);
      
      const cookie = request.headers.get('cookie') || '';
      const locationMatch = cookie.match(/user_location=([^;]+)/);
      let weather;
      
      if (locationMatch) {
        const [lat, lon] = locationMatch[1].split(',').map(Number);
        weather = await getWeatherByCoords(lat, lon);
        weather.isDefault = false;
      } else {
        const defaultLat = parseFloat(env?.WEATHER_LAT) || 35.77;
        const defaultLon = parseFloat(env?.WEATHER_LON) || 140.32;
        weather = await getWeatherByCoords(defaultLat, defaultLon);
        weather.isDefault = true;
      }
      
      // 获取名言（支持多语言）
      const quote = getQuote(lang);
      
      // 获取日期（仅日期部分，时间由浏览器处理）
      const date = getDate(lang);

      // =========================
      // 7. Render HTML
      // =========================
      const html = renderHTML({
        ip,
        weather,
        quote,
        date,
        lang,
        hasUserLocation: !!locationMatch
      });

      const response = new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "public, max-age=300, stale-while-revalidate=60",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "content-language": lang
        }
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/><title>Service Unavailable</title></head>
        <body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0b0d14;color:#fff;">
          <div style="text-align:center;">
            <h1>⏳ 服务暂时不可用</h1>
            <p style="opacity:0.6;">请稍后刷新页面</p>
          </div>
        </body>
        </html>
      `, { 
        status: 503,
        headers: { 
          'content-type': 'text/html;charset=UTF-8',
          'retry-after': '60'
        }
      });
    }
  }
};

// ======================================================
// LANGUAGE DETECTION
// ======================================================

function detectLanguage(request) {
  const cookie = request.headers.get('cookie') || '';
  const langMatch = cookie.match(/preferred_lang=([^;]+)/);
  if (langMatch && ['zh', 'en', 'ja', 'ko'].includes(langMatch[1])) {
    return langMatch[1];
  }
  
  const acceptLang = request.headers.get('accept-language') || '';
  const langs = acceptLang.split(',').map(l => l.split(';')[0].trim());
  
  const supportedLangs = ['zh', 'en', 'ja', 'ko'];
  for (const lang of langs) {
    const baseLang = lang.split('-')[0];
    if (supportedLangs.includes(baseLang)) {
      return baseLang;
    }
  }
  
  return 'en';
}

// ======================================================
// INTERNATIONALIZATION (i18n)
// ======================================================

const i18n = {
  zh: {
    name: '中文',
    weather: {
      clear: '晴朗',
      mostlyClear: '大部分晴朗',
      partlyCloudy: '局部多云',
      cloudy: '多云',
      foggy: '有雾',
      lightRain: '小雨',
      moderateRain: '中雨',
      heavyRain: '大雨',
      lightSnow: '小雪',
      moderateSnow: '中雪',
      heavySnow: '大雪',
      rainShower: '阵雨',
      thunderstorm: '雷暴',
      unavailable: '天气服务暂时不可用',
      updating: '天气数据更新中'
    },
    ui: {
      enableLocation: '📍 启用位置服务查看您所在城市的实时天气',
      allowLocation: '🌐 允许获取位置',
      gettingLocation: '⏳ 获取中...',
      relocate: '🌐 重新定位',
      locationUpdated: '✅ 位置已更新，天气数据已刷新',
      locationFailed: '❌ 位置更新失败，请重试',
      locationDenied: '用户拒绝了位置请求',
      locationUnavailable: '位置信息不可用',
      locationTimeout: '请求超时',
      locationUnknown: '未知错误',
      usingDefault: '📍 使用默认位置',
      updateLocation: '更新位置',
      located: '✅ 已定位',
      precise: '✅ 已定位 (精确)',
      searchPlaceholder: '搜索... (Enter 键搜索)',
      locationStatus: '📍 位置状态',
      switchLanguage: '切换语言'
    },
    quotes: [
      { text: '少即是多', author: '密斯·凡·德·罗' },
      { text: '保持饥饿，保持愚蠢', author: '史蒂夫·乔布斯' },
      { text: '专注是最稀缺的资源', author: '未知' },
      { text: '行动胜于计划', author: '执行力' },
      { text: '简单是终极的复杂', author: '列奥纳多·达·芬奇' },
      { text: '设计不是为了看起来简单，而是为了让事情变得简单', author: '未知' },
      { text: '优秀的设计是显而易见的', author: '史蒂夫·乔布斯' },
      { text: '少谈多做的时代已经来临', author: '未知' }
    ],
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    links: {
      google: 'Google',
      github: 'GitHub',
      hackerNews: 'Hacker News',
      reddit: 'Reddit'
    },
    shortcuts: {
      search: '⌨️  Ctrl+K / Cmd+K 快速搜索'
    },
    locationUnknown: '未知位置'
  },
  en: {
    name: 'English',
    weather: {
      clear: 'Clear',
      mostlyClear: 'Mostly Clear',
      partlyCloudy: 'Partly Cloudy',
      cloudy: 'Cloudy',
      foggy: 'Foggy',
      lightRain: 'Light Rain',
      moderateRain: 'Moderate Rain',
      heavyRain: 'Heavy Rain',
      lightSnow: 'Light Snow',
      moderateSnow: 'Moderate Snow',
      heavySnow: 'Heavy Snow',
      rainShower: 'Rain Shower',
      thunderstorm: 'Thunderstorm',
      unavailable: 'Weather service temporarily unavailable',
      updating: 'Weather data updating'
    },
    ui: {
      enableLocation: '📍 Enable location to see weather in your city',
      allowLocation: '🌐 Allow Location',
      gettingLocation: '⏳ Getting location...',
      relocate: '🌐 Relocate',
      locationUpdated: '✅ Location updated, weather data refreshed',
      locationFailed: '❌ Location update failed, please retry',
      locationDenied: 'User denied location request',
      locationUnavailable: 'Location information unavailable',
      locationTimeout: 'Request timeout',
      locationUnknown: 'Unknown error',
      usingDefault: '📍 Using default location',
      updateLocation: 'Update location',
      located: '✅ Located',
      precise: '✅ Located (Precise)',
      searchPlaceholder: 'Search... (Press Enter)',
      locationStatus: '📍 Location Status',
      switchLanguage: 'Switch Language'
    },
    quotes: [
      { text: 'Less is more', author: 'Mies van der Rohe' },
      { text: 'Stay hungry, stay foolish', author: 'Steve Jobs' },
      { text: 'Focus is the scarcest resource', author: 'Unknown' },
      { text: 'Action speaks louder than plans', author: 'Execution' },
      { text: 'Simplicity is the ultimate sophistication', author: 'Leonardo da Vinci' },
      { text: 'Design is not just what it looks like, but how it works', author: 'Unknown' },
      { text: 'Good design is obvious', author: 'Steve Jobs' },
      { text: 'The era of less talk, more action has arrived', author: 'Unknown' }
    ],
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    links: {
      google: 'Google',
      github: 'GitHub',
      hackerNews: 'Hacker News',
      reddit: 'Reddit'
    },
    shortcuts: {
      search: '⌨️  Ctrl+K / Cmd+K Quick Search'
    },
    locationUnknown: 'Unknown Location'
  },
  ja: {
    name: '日本語',
    weather: {
      clear: '晴れ',
      mostlyClear: 'ほぼ晴れ',
      partlyCloudy: '一部曇り',
      cloudy: '曇り',
      foggy: '霧',
      lightRain: '小雨',
      moderateRain: '中雨',
      heavyRain: '大雨',
      lightSnow: '小雪',
      moderateSnow: '中雪',
      heavySnow: '大雪',
      rainShower: 'にわか雨',
      thunderstorm: '雷雨',
      unavailable: '天気サービスが一時的に利用できません',
      updating: '天気データを更新中'
    },
    ui: {
      enableLocation: '📍 位置情報を有効にして、あなたの都市の天気を確認する',
      allowLocation: '🌐 位置情報を許可',
      gettingLocation: '⏳ 取得中...',
      relocate: '🌐 再取得',
      locationUpdated: '✅ 位置が更新され、天気データが更新されました',
      locationFailed: '❌ 位置の更新に失敗しました。再試行してください',
      locationDenied: 'ユーザーが位置情報リクエストを拒否しました',
      locationUnavailable: '位置情報が利用できません',
      locationTimeout: 'リクエストがタイムアウトしました',
      locationUnknown: '不明なエラー',
      usingDefault: '📍 デフォルトの位置を使用',
      updateLocation: '位置を更新',
      located: '✅ 位置情報を取得済み',
      precise: '✅ 位置情報を取得済み (精密)',
      searchPlaceholder: '検索... (Enter キーで検索)',
      locationStatus: '📍 位置情報の状態',
      switchLanguage: '言語切り替え'
    },
    quotes: [
      { text: '少ないことはより多い', author: 'ミース・ファン・デル・ローエ' },
      { text: 'ハングリーであれ、愚かであれ', author: 'スティーブ・ジョブズ' },
      { text: '集中力は最も希少なリソース', author: '不明' },
      { text: '行動は計画に勝る', author: '実行力' },
      { text: 'シンプルさは究極の洗練', author: 'レオナルド・ダ・ヴィンチ' },
      { text: 'デザインとは見た目だけでなく、どのように機能するか', author: '不明' },
      { text: '優れたデザインは明らか', author: 'スティーブ・ジョブズ' },
      { text: '語るより行動する時代が来た', author: '不明' }
    ],
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    links: {
      google: 'Google',
      github: 'GitHub',
      hackerNews: 'Hacker News',
      reddit: 'Reddit'
    },
    shortcuts: {
      search: '⌨️  Ctrl+K / Cmd+K クイック検索'
    },
    locationUnknown: '不明な場所'
  },
  ko: {
    name: '한국어',
    weather: {
      clear: '맑음',
      mostlyClear: '대부분 맑음',
      partlyCloudy: '부분적으로 흐림',
      cloudy: '흐림',
      foggy: '안개',
      lightRain: '약한 비',
      moderateRain: '중간 비',
      heavyRain: '강한 비',
      lightSnow: '약한 눈',
      moderateSnow: '중간 눈',
      heavySnow: '강한 눈',
      rainShower: '소나기',
      thunderstorm: '뇌우',
      unavailable: '날씨 서비스를 일시적으로 사용할 수 없음',
      updating: '날씨 데이터 업데이트 중'
    },
    ui: {
      enableLocation: '📍 위치 서비스를 활성화하여 해당 도시의 날씨 확인',
      allowLocation: '🌐 위치 허용',
      gettingLocation: '⏳ 가져오는 중...',
      relocate: '🌐 위치 재설정',
      locationUpdated: '✅ 위치가 업데이트되었으며 날씨 데이터가 새로 고침되었습니다',
      locationFailed: '❌ 위치 업데이트 실패, 다시 시도하세요',
      locationDenied: '사용자가 위치 요청을 거부했습니다',
      locationUnavailable: '위치 정보를 사용할 수 없음',
      locationTimeout: '요청 시간 초과',
      locationUnknown: '알 수 없는 오류',
      usingDefault: '📍 기본 위치 사용',
      updateLocation: '위치 업데이트',
      located: '✅ 위치 확인됨',
      precise: '✅ 위치 확인됨 (정밀)',
      searchPlaceholder: '검색... (Enter 키로 검색)',
      locationStatus: '📍 위치 상태',
      switchLanguage: '언어 전환'
    },
    quotes: [
      { text: '적을수록 더 많다', author: '미스 반 데어 로에' },
      { text: '굶주리고 어리석게 살아라', author: '스티브 잡스' },
      { text: '집중력은 가장 희귀한 자원이다', author: '알 수 없음' },
      { text: '행동이 계획보다 낫다', author: '실행력' },
      { text: '단순함은 궁극의 정교함이다', author: '레오나르도 다 빈치' },
      { text: '디자인은 보이는 것뿐만 아니라 작동 방식이다', author: '알 수 없음' },
      { text: '좋은 디자인은 명백하다', author: '스티브 잡스' },
      { text: '말보다 행동의 시대가 왔다', author: '알 수 없음' }
    ],
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    links: {
      google: 'Google',
      github: 'GitHub',
      hackerNews: 'Hacker News',
      reddit: 'Reddit'
    },
    shortcuts: {
      search: '⌨️  Ctrl+K / Cmd+K 빠른 검색'
    },
    locationUnknown: '알 수 없는 위치'
  }
};

// ======================================================
// DATA MODULES
// ======================================================

function getIP(request) {
  const cf = request.cf || {};
  const ip = request.headers.get("cf-connecting-ip") || 
             request.headers.get("x-forwarded-for")?.split(',')[0] || 
             "unknown";
  
  return {
    ip: ip,
    city: cf.city || "",
    country: cf.country || "",
    region: cf.region || "",
    isBot: request.headers.get("user-agent")?.toLowerCase().includes("bot") || false
  };
}

async function getWeatherByCoords(lat, lon) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Worker/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.current_weather) {
      throw new Error('Invalid weather data structure');
    }
    
    const w = data.current_weather;
    const locationName = await getLocationName(lat, lon);
    
    return {
      temp: Math.round(w.temperature) + "°C",
      desc: getWeatherDescription(w.weathercode),
      icon: getWeatherIcon(w.weathercode, w.temperature),
      windspeed: w.windspeed || 0,
      weathercode: w.weathercode,
      lat: lat,
      lon: lon,
      location: locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      isDefault: false
    };
    
  } catch (e) {
    console.error('Weather fetch failed:', e.message);
    
    return {
      temp: "--",
      desc: "Weather service temporarily unavailable",
      icon: "⛅",
      windspeed: 0,
      weathercode: -1,
      lat: lat,
      lon: lon,
      location: "Unknown Location",
      isDefault: false
    };
  }
}

async function getLocationName(lat, lon) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return result.name + (result.admin1 ? `, ${result.admin1}` : '');
    }
    return null;
  } catch (e) {
    console.error('Geocoding failed:', e.message);
    return null;
  }
}

function getWeatherIcon(code, temp) {
  if (temp > 35) return "🔥";
  if (temp > 30) return "☀️";
  if (temp > 25) return "🌤️";
  if (temp < -10) return "🥶";
  if (temp < 0) return "❄️";
  
  const icons = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌧️", 55: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "⛈️",
    71: "🌨️", 73: "🌨️", 75: "❄️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    95: "⛈️", 96: "⛈️", 99: "⛈️"
  };
  
  return icons[code] || "🌤️";
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear", 1: "Mostly Clear", 2: "Partly Cloudy", 3: "Cloudy",
    45: "Foggy", 48: "Foggy",
    51: "Light Rain", 53: "Moderate Rain", 55: "Heavy Rain",
    61: "Light Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Light Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    80: "Rain Shower", 81: "Rain Shower", 82: "Rain Shower",
    95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm"
  };
  
  return descriptions[code] || "Weather data updating";
}

function getQuote(lang) {
  const t = i18n[lang] || i18n.en;
  const quotes = t.quotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getDate(lang) {
  const t = i18n[lang] || i18n.en;
  const d = new Date();
  
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 
                              lang === 'ja' ? 'ja-JP' :
                              lang === 'ko' ? 'ko-KR' : 'en-US', 
                              t.dateFormat);
}

// ======================================================
// HTML RENDERER
// ======================================================

function renderHTML({ ip, weather, quote, date, lang, hasUserLocation }) {
  const t = i18n[lang] || i18n.en;
  
  const escapedIP = escapeHtml(ip.ip);
  const escapedCity = escapeHtml(ip.city);
  const escapedCountry = escapeHtml(ip.country);
  const escapedQuote = escapeHtml(quote.text);
  const escapedAuthor = escapeHtml(quote.author);
  const escapedLocation = escapeHtml(weather.location || t.locationUnknown || 'Unknown Location');
  
  const usingDefault = !hasUserLocation || weather.isDefault;
  const usingDefaultStr = usingDefault ? 'true' : 'false';
  
  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="description" content="Personalized Edge Dashboard"/>
<title>Edge Home</title>

<style>
*{margin:0;padding:0;box-sizing:border-box}

body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  background:#0b0d14;
  color:#fff;
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

.bg{
  position:fixed;
  inset:0;
  background:
    radial-gradient(circle at 20% 30%, #1a2233, transparent 60%),
    radial-gradient(circle at 80% 20%, #151a2a, transparent 60%),
    radial-gradient(circle at 50% 80%, #0f1420, transparent 50%),
    #0b0d14;
  z-index:-1;
}

.bg::after{
  content:'';
  position:absolute;
  inset:0;
  background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity:0.5;
  pointer-events:none;
}

.container{
  width:100%;
  max-width:1000px;
  padding:40px;
  animation:fadeIn .6s ease-out;
  position:relative;
  z-index:1;
}

@keyframes fadeIn{
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:40px;
}

.time-section{
  position:relative;
}

.time{
  font-size:72px;
  font-weight:700;
  letter-spacing:-2px;
  background:linear-gradient(135deg,#fff 0%,#8899bb 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  line-height:1;
}

.time-seconds{
  font-size:24px;
  opacity:0.4;
  margin-left:8px;
  -webkit-text-fill-color:rgba(255,255,255,0.4);
}

.date{
  margin-top:8px;
  opacity:.5;
  font-size:16px;
  letter-spacing:1px;
}

.weather-card{
  text-align:right;
  background:rgba(255,255,255,.03);
  padding:12px 20px;
  border-radius:16px;
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.05);
  min-width:120px;
  position:relative;
}

.weather-location{
  font-size:12px;
  opacity:0.5;
  margin-bottom:4px;
  font-weight:300;
}

.weather-temp{
  font-size:28px;
  font-weight:600;
}

.weather-icon{
  font-size:32px;
  margin-right:4px;
}

.weather-desc{
  font-size:13px;
  opacity:.6;
  margin-top:4px;
}

.weather-wind{
  font-size:12px;
  opacity:.4;
  margin-top:2px;
}

.location-status{
  font-size:11px;
  opacity:0.4;
  margin-top:4px;
  cursor:help;
}

.location-status .update-link{
  color:rgba(255,255,255,0.6);
  text-decoration:underline;
  cursor:pointer;
}

.location-status .update-link:hover{
  color:#fff;
}

.search{
  width:100%;
  margin:30px 0 20px;
}

.search input{
  width:100%;
  padding:18px 24px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.06);
  color:#fff;
  font-size:16px;
  outline:none;
  transition:all .3s ease;
  backdrop-filter:blur(10px);
}

.search input::placeholder{
  color:rgba(255,255,255,.3);
}

.search input:focus{
  transform:translateY(-2px);
  background:rgba(255,255,255,.12);
  border-color:rgba(255,255,255,.15);
  box-shadow:0 8px 30px rgba(0,0,0,.3);
}

.search input:hover{
  background:rgba(255,255,255,.09);
}

.quick-links{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-top:12px;
}

.quick-links a{
  color:rgba(255,255,255,.4);
  text-decoration:none;
  font-size:13px;
  transition:color .2s;
  padding:6px 12px;
  border-radius:20px;
  background:rgba(255,255,255,.03);
}

.quick-links a:hover{
  color:#fff;
  background:rgba(255,255,255,.08);
}

.quote{
  margin-top:50px;
  padding:20px 0;
  border-top:1px solid rgba(255,255,255,.05);
  opacity:.7;
  font-size:16px;
  line-height:1.8;
  transition:opacity .3s;
}

.quote:hover{
  opacity:.9;
}

.quote-text{
  font-style:italic;
  letter-spacing:0.5px;
}

.quote-author{
  display:block;
  margin-top:8px;
  opacity:.5;
  font-size:14px;
  font-style:normal;
}

.footer{
  margin-top:60px;
  opacity:.3;
  font-size:12px;
  display:flex;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:8px;
  padding-top:20px;
  border-top:1px solid rgba(255,255,255,.03);
}

.footer span{
  display:inline-block;
}

.location-prompt{
  display:${usingDefault ? 'block' : 'none'};
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  padding:16px 20px;
  margin-bottom:20px;
  text-align:center;
  backdrop-filter:blur(10px);
}

.location-prompt p{
  opacity:0.7;
  font-size:14px;
  margin-bottom:12px;
}

.location-prompt button{
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.15);
  color:#fff;
  padding:8px 24px;
  border-radius:20px;
  cursor:pointer;
  font-size:14px;
  transition:all .3s;
}

.location-prompt button:hover{
  background:rgba(255,255,255,.2);
  transform:translateY(-1px);
}

.location-prompt button:disabled{
  opacity:0.4;
  cursor:not-allowed;
}

.notification{
  position:fixed;
  top:20px;
  left:50%;
  transform:translateX(-50%);
  background:rgba(255,255,255,0.1);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.1);
  padding:12px 24px;
  border-radius:12px;
  color:#fff;
  font-size:14px;
  z-index:1000;
  animation:fadeIn 0.3s ease-out;
  max-width:90%;
  text-align:center;
}

.language-selector{
  position:fixed;
  top:20px;
  right:20px;
  z-index:100;
  background:rgba(255,255,255,0.05);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:8px;
  padding:4px;
}

.language-selector select{
  background:transparent;
  color:#fff;
  border:none;
  padding:8px 12px;
  font-size:13px;
  cursor:pointer;
  outline:none;
  border-radius:6px;
  min-width:100px;
}

.language-selector select:hover{
  background:rgba(255,255,255,0.1);
}

.language-selector select option{
  background:#1a2233;
  color:#fff;
}

@media (max-width: 640px){
  .container{
    padding:20px;
  }
  
  .time{
    font-size:48px;
    letter-spacing:-1px;
  }
  
  .time-seconds{
    font-size:18px;
  }
  
  .top{
    flex-direction:column;
    gap:20px;
  }
  
  .weather-card{
    text-align:left;
    width:100%;
    padding:12px 16px;
  }
  
  .weather-temp{
    font-size:24px;
  }
  
  .search input{
    padding:14px 20px;
    font-size:15px;
  }
  
  .quote{
    font-size:14px;
    margin-top:30px;
  }
  
  .footer{
    flex-direction:column;
    gap:4px;
    font-size:11px;
  }
  
  .location-prompt{
    padding:12px 16px;
  }
  
  .language-selector{
    top:10px;
    right:10px;
    padding:2px;
  }
  
  .language-selector select{
    font-size:12px;
    padding:4px 8px;
    min-width:80px;
  }
}
</style>
</head>

<body>
<div class="bg"></div>

<!-- 语言选择器 -->
<div class="language-selector">
  <select id="languageSelect" onchange="changeLanguage(this.value)">
    ${languages.map(l => `<option value="${l.code}" ${lang === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}
  </select>
</div>

<div class="container">
  <div class="location-prompt" id="locationPrompt">
    <p>${t.ui.enableLocation}</p>
    <button id="enableLocation" onclick="requestLocation()">
      ${t.ui.allowLocation}
    </button>
  </div>

  <div class="top">
    <div class="time-section">
      <div class="time">
        <span id="clockDisplay">--:--</span>
        <span class="time-seconds" id="secondsDisplay">00</span>
      </div>
      <div class="date" id="dateDisplay">${date}</div>
    </div>

    <div class="weather-card">
      <div class="weather-location">📍 ${escapedLocation}</div>
      <div>
        <span class="weather-icon">${weather.icon}</span>
        <span class="weather-temp">${weather.temp}</span>
      </div>
      <div class="weather-desc">${weather.desc}</div>
      ${weather.windspeed > 0 ? `<div class="weather-wind">💨 ${Math.round(weather.windspeed)} km/h</div>` : ''}
      <div class="location-status" id="locationStatus">
        ${usingDefault ? 
          `${t.ui.usingDefault} · <span class="update-link" onclick="requestLocation()">${t.ui.updateLocation}</span>` : 
          `${t.ui.located}`}
      </div>
    </div>
  </div>

  <div class="search">
    <input 
      id="search" 
      type="text" 
      placeholder="${t.ui.searchPlaceholder}"
      autofocus
      aria-label="${t.ui.searchPlaceholder}"
    />
    <div class="quick-links">
      <a href="https://www.google.com" target="_blank">${t.links.google}</a>
      <a href="https://github.com" target="_blank">${t.links.github}</a>
      <a href="https://news.ycombinator.com" target="_blank">${t.links.hackerNews}</a>
      <a href="https://www.reddit.com" target="_blank">${t.links.reddit}</a>
    </div>
  </div>

  <div class="quote">
    <span class="quote-text">“${escapedQuote}”</span>
    <span class="quote-author">- ${escapedAuthor}</span>
  </div>

  <div class="footer">
    <span>📍 ${escapedIP}</span>
    <span>${escapedCity} ${escapedCountry}</span>
    <span>⚡ Cloudflare Edge</span>
  </div>
</div>

<script>
(function() {
  'use strict';
  
  var currentLang = '${lang}';
  
  // =========================
  // 1. 强制语言切换功能
  // =========================
  window.changeLanguage = function(lang) {
    var select = document.getElementById('languageSelect');
    if (select) {
      select.disabled = true;
    }
    
    var msgs = {
      zh: '⏳ 切换语言中...',
      en: '⏳ Switching language...',
      ja: '⏳ 言語を切り替え中...',
      ko: '⏳ 언어 전환 중...'
    };
    showNotification(msgs[lang] || msgs.en);
    
    fetch('/api/set-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lang: lang })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        window.location.href = window.location.pathname + '?lang=' + lang;
      } else {
        throw new Error('Language update failed');
      }
    })
    .catch(function(error) {
      console.error('语言切换失败:', error);
      var errMsgs = {
        zh: '❌ 语言切换失败，请重试',
        en: '❌ Language switch failed, please retry',
        ja: '❌ 言語の切り替えに失敗しました。再試行してください',
        ko: '❌ 언어 전환에 실패했습니다. 다시 시도하세요'
      };
      showNotification(errMsgs[lang] || errMsgs.en);
      
      if (select) {
        select.disabled = false;
      }
    });
  };
  
  // =========================
  // 2. 位置请求功能
  // =========================
  window.requestLocation = function() {
    var button = document.getElementById('enableLocation');
    var t = getTranslations(currentLang);
    
    if (button) {
      button.disabled = true;
      button.textContent = t.ui.gettingLocation;
    }
    
    if (!navigator.geolocation) {
      alert(t.ui.locationUnavailable);
      if (button) {
        button.disabled = false;
        button.textContent = t.ui.allowLocation;
      }
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        
        try {
          var response = await fetch('/api/update-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lat: latitude,
              lon: longitude
            })
          });
          
          var data = await response.json();
          
          if (data.success) {
            updateWeatherUI(data.weather);
            
            var prompt = document.getElementById('locationPrompt');
            if (prompt) {
              prompt.style.display = 'none';
            }
            
            var status = document.getElementById('locationStatus');
            if (status) {
              status.innerHTML = '✅ ' + t.ui.precise;
              status.style.opacity = '0.6';
            }
            
            showNotification(t.ui.locationUpdated);
          } else {
            throw new Error(data.error || t.ui.locationFailed);
          }
        } catch (error) {
          console.error('位置更新失败:', error);
          showNotification(t.ui.locationFailed);
        }
        
        if (button) {
          button.disabled = false;
          button.textContent = t.ui.relocate;
        }
      },
      function(error) {
        console.error('定位失败:', error);
        
        var message = '❌ ' + t.ui.locationUnknown;
        switch(error.code) {
          case 1:
            message = '❌ ' + t.ui.locationDenied;
            break;
          case 2:
            message = '❌ ' + t.ui.locationUnavailable;
            break;
          case 3:
            message = '❌ ' + t.ui.locationTimeout;
            break;
        }
        
        showNotification(message);
        
        if (button) {
          button.disabled = false;
          button.textContent = t.ui.allowLocation;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };
  
  // =========================
  // 3. 获取翻译
  // =========================
  function getTranslations(lang) {
    var translations = {
      zh: {
        ui: {
          enableLocation: '📍 启用位置服务查看您所在城市的实时天气',
          allowLocation: '🌐 允许获取位置',
          gettingLocation: '⏳ 获取中...',
          relocate: '🌐 重新定位',
          locationUpdated: '✅ 位置已更新，天气数据已刷新',
          locationFailed: '❌ 位置更新失败，请重试',
          locationDenied: '用户拒绝了位置请求',
          locationUnavailable: '位置信息不可用',
          locationTimeout: '请求超时',
          locationUnknown: '未知错误',
          usingDefault: '📍 使用默认位置',
          updateLocation: '更新位置',
          located: '✅ 已定位',
          precise: '✅ 已定位 (精确)',
          searchPlaceholder: '搜索... (Enter 键搜索)',
          locationStatus: '📍 位置状态'
        }
      },
      en: {
        ui: {
          enableLocation: '📍 Enable location to see weather in your city',
          allowLocation: '🌐 Allow Location',
          gettingLocation: '⏳ Getting location...',
          relocate: '🌐 Relocate',
          locationUpdated: '✅ Location updated, weather data refreshed',
          locationFailed: '❌ Location update failed, please retry',
          locationDenied: 'User denied location request',
          locationUnavailable: 'Location information unavailable',
          locationTimeout: 'Request timeout',
          locationUnknown: 'Unknown error',
          usingDefault: '📍 Using default location',
          updateLocation: 'Update location',
          located: '✅ Located',
          precise: '✅ Located (Precise)',
          searchPlaceholder: 'Search... (Press Enter)',
          locationStatus: '📍 Location Status'
        }
      },
      ja: {
        ui: {
          enableLocation: '📍 位置情報を有効にして、あなたの都市の天気を確認する',
          allowLocation: '🌐 位置情報を許可',
          gettingLocation: '⏳ 取得中...',
          relocate: '🌐 再取得',
          locationUpdated: '✅ 位置が更新され、天気データが更新されました',
          locationFailed: '❌ 位置の更新に失敗しました。再試行してください',
          locationDenied: 'ユーザーが位置情報リクエストを拒否しました',
          locationUnavailable: '位置情報が利用できません',
          locationTimeout: 'リクエストがタイムアウトしました',
          locationUnknown: '不明なエラー',
          usingDefault: '📍 デフォルトの位置を使用',
          updateLocation: '位置を更新',
          located: '✅ 位置情報を取得済み',
          precise: '✅ 位置情報を取得済み (精密)',
          searchPlaceholder: '検索... (Enter キーで検索)',
          locationStatus: '📍 位置情報の状態'
        }
      },
      ko: {
        ui: {
          enableLocation: '📍 위치 서비스를 활성화하여 해당 도시의 날씨 확인',
          allowLocation: '🌐 위치 허용',
          gettingLocation: '⏳ 가져오는 중...',
          relocate: '🌐 위치 재설정',
          locationUpdated: '✅ 위치가 업데이트되었으며 날씨 데이터가 새로 고침되었습니다',
          locationFailed: '❌ 위치 업데이트 실패, 다시 시도하세요',
          locationDenied: '사용자가 위치 요청을 거부했습니다',
          locationUnavailable: '위치 정보를 사용할 수 없음',
          locationTimeout: '요청 시간 초과',
          locationUnknown: '알 수 없는 오류',
          usingDefault: '📍 기본 위치 사용',
          updateLocation: '위치 업데이트',
          located: '✅ 위치 확인됨',
          precise: '✅ 위치 확인됨 (정밀)',
          searchPlaceholder: '검색... (Enter 키로 검색)',
          locationStatus: '📍 위치 상태'
        }
      }
    };
    return translations[lang] || translations.en;
  }
  
  // =========================
  // 4. 更新天气 UI
  // =========================
  function updateWeatherUI(weather) {
    var iconEl = document.querySelector('.weather-icon');
    var tempEl = document.querySelector('.weather-temp');
    var descEl = document.querySelector('.weather-desc');
    var locationEl = document.querySelector('.weather-location');
    var windEl = document.querySelector('.weather-wind');
    
    if (iconEl) iconEl.textContent = weather.icon;
    if (tempEl) tempEl.textContent = weather.temp;
    if (descEl) descEl.textContent = weather.desc;
    if (locationEl) locationEl.textContent = '📍 ' + (weather.location || 'Unknown Location');
    
    if (windEl) {
      if (weather.windspeed > 0) {
        windEl.textContent = '💨 ' + Math.round(weather.windspeed) + ' km/h';
        windEl.style.display = 'block';
      } else {
        windEl.style.display = 'none';
      }
    }
  }
  
  // =========================
  // 5. 通知功能
  // =========================
  function showNotification(message) {
    var existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }
    
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(function() { notification.remove(); }, 500);
    }, 3000);
  }
  
  // =========================
  // 6. 实时时钟（使用用户本地时区）
  // =========================
  function updateClock() {
    var clockEl = document.getElementById('clockDisplay');
    var secondsEl = document.getElementById('secondsDisplay');
    var dateEl = document.getElementById('dateDisplay');
    if (!clockEl) return;
    
    var d = new Date();
    
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    
    var timeString = h + ':' + m;
    var currentTime = clockEl.textContent;
    
    if (currentTime !== timeString) {
      clockEl.textContent = timeString;
    }
    
    if (secondsEl) {
      secondsEl.textContent = s;
    }
    
    if (dateEl) {
      var newDate = d.toLocaleDateString(
        '${lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US'}',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }
      );
      if (dateEl.textContent !== newDate) {
        dateEl.textContent = newDate;
      }
    }
  }
  
  // 立即更新
  updateClock();
  
  // 每秒更新
  setInterval(updateClock, 1000);
  
  // =========================
  // 7. 搜索功能
  // =========================
  var searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        var query = encodeURIComponent(this.value.trim());
        window.open('https://www.google.com/search?q=' + query, '_blank');
        this.value = '';
      }
    });
    
    if (document.activeElement === document.body) {
      setTimeout(function() { searchInput.focus(); }, 100);
    }
  }
  
  // =========================
  // 8. 键盘快捷键
  // =========================
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var search = document.getElementById('search');
      if (search) search.focus();
    }
    if (e.key === 'Escape') {
      var search = document.getElementById('search');
      if (search && document.activeElement === search) {
        search.value = '';
        search.blur();
      }
    }
  });
  
  // =========================
  // 9. 自动检测是否应该显示位置请求
  // =========================
  var usingDefault = ${usingDefaultStr};
  if (!usingDefault) {
    var prompt = document.getElementById('locationPrompt');
    if (prompt) {
      prompt.style.display = 'none';
    }
  }
  
  // =========================
  // 10. 移除 URL 中的 lang 参数
  // =========================
  if (window.location.search.includes('lang=')) {
    var newUrl = window.location.pathname;
    var hash = window.location.hash;
    if (hash) {
      newUrl += hash;
    }
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, newUrl);
    }
  }
  
  // 显示用户时区信息
  console.log('⚡ Edge Home loaded');
  console.log('🌐 Language: ' + currentLang);
  console.log('🕐 Local timezone: ' + Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('⌨️  Ctrl+K / Cmd+K Quick Search');
  console.log('📍 Location status:', usingDefault ? 'Using default location' : 'Located');
})();
</script>
</body>
</html>
  `;
}

// ======================================================
// UTILITY FUNCTIONS
// ======================================================

function escapeHtml(text) {
  if (!text) return '';
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}
