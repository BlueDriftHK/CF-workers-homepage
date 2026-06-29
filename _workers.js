// ======================================================
// 完整的 Edge Homepage Worker 代码
// 包含：访客分析增强 + 实时通知 + 多用户支持
// ======================================================

export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    const url = new URL(request.url);
    
    // =========================
    // 认证中间件
    // =========================
    const auth = await authenticate(request, env);
    const user = auth.user;
    const isAuthenticated = auth.isAuthenticated;
    
    // =========================
    // 1. 用户注册 API
    // =========================
    if (url.pathname === '/api/register' && request.method === 'POST') {
      return await handleRegister(request, env);
    }
    
    // =========================
    // 2. 用户登录 API
    // =========================
    if (url.pathname === '/api/login' && request.method === 'POST') {
      return await handleLogin(request, env);
    }
    
    // =========================
    // 3. 用户登出 API
    // =========================
    if (url.pathname === '/api/logout' && request.method === 'POST') {
      return await handleLogout(request, env);
    }
    
    // =========================
    // 4. 获取用户信息 API
    // =========================
    if (url.pathname === '/api/user' && request.method === 'GET') {
      if (!isAuthenticated) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      return new Response(JSON.stringify({ success: true, user: user }), {
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // =========================
    // 5. 通知 API
    // =========================
    if (url.pathname === '/api/notifications' && request.method === 'GET') {
      return await handleGetNotifications(request, env, user, isAuthenticated);
    }
    
    if (url.pathname === '/api/notifications/mark-read' && request.method === 'POST') {
      return await handleMarkNotificationsRead(request, env, user, isAuthenticated);
    }
    
    if (url.pathname === '/api/notifications/system' && request.method === 'POST') {
      // 管理员创建系统通知
      const adminPassword = env?.ADMIN_PASSWORD || 'admin123';
      const cookie = request.headers.get('cookie') || '';
      const authMatch = cookie.match(/admin_auth=([^;]+)/);
      if (!authMatch || authMatch[1] !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      return await handleCreateSystemNotification(request, env);
    }
    
    // =========================
    // 6. 访客分析 API (增强版)
    // =========================
    if (url.pathname === '/api/analytics' && request.method === 'GET') {
      return await handleAnalytics(request, env);
    }
    
    if (url.pathname === '/api/analytics/realtime' && request.method === 'GET') {
      return await handleRealtimeAnalytics(request, env);
    }
    
    if (url.pathname === '/api/analytics/session' && request.method === 'POST') {
      return await handleSessionTracking(request, env);
    }
    
    // =========================
    // 7. 位置更新请求
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
        
        const cookie = request.headers.get('cookie') || '';
        const langMatch = cookie.match(/preferred_lang=([^;]+)/);
        const lang = (langMatch && ['zh', 'en', 'ja', 'ko'].includes(langMatch[1])) ? langMatch[1] : 'en';
        
        const weather = await getWeatherByCoords(lat, lon, lang, env);
        const locationCookie = `user_location=${lat},${lon}; path=/; max-age=3600; samesite=lax; Secure`;
        
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
    // 8. 语言切换请求
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
        
        const langCookie = `preferred_lang=${lang}; path=/; max-age=31536000; samesite=lax; Secure`;
        
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
    // 9. 健康检查
    // =========================
    if (url.pathname === '/health') {
      return new Response('OK', { 
        status: 200,
        headers: { 'content-type': 'text/plain' }
      });
    }

    // =========================
    // 10. 访问统计 API (增强版)
    // =========================
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      return await handleStats(request, env, ctx);
    }
    
    // =========================
    // 11. 在线状态 API
    // =========================
    if (url.pathname === '/api/online' && request.method === 'GET') {
      return await handleOnline(request, env);
    }
    
    // =========================
    // 12. 主题管理 API
    // =========================
    if (url.pathname === '/api/theme' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { theme } = body;
        const themeCookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax; Secure`;
        return new Response(JSON.stringify({ success: true, message: 'Theme saved' }), {
          status: 200,
          headers: { 'content-type': 'application/json', 'set-cookie': themeCookie }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save theme' }), {
          status: 500,
          headers: { 'content-type': 'application/json' }
        });
      }
    }

    // =========================
    // 13. 管理员面板
    // =========================
    if (url.pathname === '/admin') {
      const cookie = request.headers.get('cookie') || '';
      const langMatch = cookie.match(/preferred_lang=([^;]+)/);
      let lang = 'zh';
      const langParam = url.searchParams.get('lang');
      if (langParam && ['zh', 'en', 'ja', 'ko'].includes(langParam)) {
        lang = langParam;
      } else if (langMatch && ['zh', 'en', 'ja', 'ko'].includes(langMatch[1])) {
        lang = langMatch[1];
      }
      
      const authMatch = cookie.match(/admin_auth=([^;]+)/);
      const adminPassword = env?.ADMIN_PASSWORD || 'admin123';
      
      if (authMatch && authMatch[1] === adminPassword) {
        return await renderAdminPanel(request, env);
      }
      
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { password } = body;
          
          if (password === adminPassword) {
            const authCookie = `admin_auth=${password}; path=/admin; max-age=604800; samesite=lax; Secure; HttpOnly`;
            const panelResponse = await renderAdminPanel(request, env);
            
            const response = new Response(panelResponse.body, {
              status: panelResponse.status,
              headers: panelResponse.headers
            });
            response.headers.set('set-cookie', authCookie);
            
            return response;
          } else {
            const errorMsgs = {
              zh: '密码错误',
              en: 'Wrong password',
              ja: 'パスワードが間違っています',
              ko: '비밀번호가 잘못되었습니다'
            };
            return new Response(JSON.stringify({ 
              error: errorMsgs[lang] || errorMsgs.zh
            }), {
              status: 401,
              headers: { 'content-type': 'application/json' }
            });
          }
        } catch (error) {
          return new Response(JSON.stringify({ error: '验证失败' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          });
        }
      }
      
      return new Response(renderLoginPage(lang), {
        status: 200,
        headers: { 'content-type': 'text/html;charset=UTF-8' }
      });
    }

    // =========================
    // 14. Edge Cache
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
      let lang = detectLanguage(request);
      
      const langParam = url.searchParams.get('lang');
      if (langParam && ['zh', 'en', 'ja', 'ko'].includes(langParam)) {
        lang = langParam;
      }
      
      const ip = getIP(request);
      
      const cookie = request.headers.get('cookie') || '';
      const locationMatch = cookie.match(/user_location=([^;]+)/);
      let weather;
      
      if (locationMatch) {
        const [lat, lon] = locationMatch[1].split(',').map(Number);
        weather = await getWeatherByCoords(lat, lon, lang, env);
        weather.isDefault = false;
      } else {
        const defaultLat = parseFloat(env?.WEATHER_LAT) || 35.77;
        const defaultLon = parseFloat(env?.WEATHER_LON) || 140.32;
        weather = await getWeatherByCoords(defaultLat, defaultLon, lang, env);
        weather.isDefault = true;
      }
      
      const quote = getQuote(lang);
      const date = getDate(lang);

      const themeMatch = cookie.match(/theme=([^;]+)/);
      const theme = (themeMatch && ['dark', 'light', 'ocean', 'forest', 'sunset', 'neon'].includes(themeMatch[1])) ? themeMatch[1] : 'dark';

      const html = renderHTML({
        ip,
        weather,
        quote,
        date,
        lang,
        theme,
        hasUserLocation: !!locationMatch,
        isAuthenticated: isAuthenticated,
        user: user
      });

      const response = new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "public, max-age=300, stale-while-revalidate=60",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "content-language": lang,
          "content-security-policy": "default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: https:; connect-src 'self' https://api.open-meteo.com; frame-ancestors 'none'"
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
// 认证函数
// ======================================================
async function authenticate(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const tokenMatch = cookie.match(/session_token=([^;]+)/);
  
  if (!tokenMatch || !env?.DB_HOMEPAGE) {
    return { isAuthenticated: false, user: null };
  }
  
  const token = tokenMatch[1];
  
  try {
    const result = await env.DB_HOMEPAGE.prepare(`
      SELECT u.* FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ? AND s.expires_at > datetime('now')
      AND u.is_active = 1
    `).bind(token).run();
    
    if (result.results && result.results.length > 0) {
      return { isAuthenticated: true, user: result.results[0] };
    }
  } catch (error) {
    console.error('Authentication error:', error);
  }
  
  return { isAuthenticated: false, user: null };
}

// ======================================================
// 用户注册处理
// ======================================================
async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { username, email, password, display_name } = body;
    
    if (!username || !password || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const passwordHash = await hashPassword(password);
    
    const result = await env.DB_HOMEPAGE.prepare(`
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `).bind(username, email, passwordHash, display_name || username).run();
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Username or email already exists' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Registration successful'
    }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 用户登录处理
// ======================================================
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const result = await env.DB_HOMEPAGE.prepare(`
      SELECT * FROM users WHERE username = ? AND is_active = 1
    `).bind(username).run();
    
    if (!result.results || result.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const user = result.results[0];
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    await env.DB_HOMEPAGE.prepare(`
      INSERT INTO user_sessions (user_id, session_token, ip, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, token, ip, userAgent, expiresAt).run();
    
    await env.DB_HOMEPAGE.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id).run();
    
    const sessionCookie = `session_token=${token}; path=/; max-age=604800; samesite=lax; Secure; HttpOnly`;
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      }
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'set-cookie': sessionCookie
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 用户登出处理
// ======================================================
async function handleLogout(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const tokenMatch = cookie.match(/session_token=([^;]+)/);
  
  if (tokenMatch) {
    await env.DB_HOMEPAGE.prepare(`
      DELETE FROM user_sessions WHERE session_token = ?
    `).bind(tokenMatch[1]).run();
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'content-type': 'application/json',
      'set-cookie': 'session_token=; path=/; max-age=0; samesite=lax; Secure; HttpOnly'
    }
  });
}

// ======================================================
// 通知处理
// ======================================================
async function handleGetNotifications(request, env, user, isAuthenticated) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    
    let query = `
      SELECT * FROM (
        SELECT id, type, title, content, link, is_read, created_at, 'user' as source
        FROM notifications
        WHERE user_id = ?
        UNION ALL
        SELECT id, type, title, content, link, 0 as is_read, created_at, 'system' as source
        FROM system_notifications
        WHERE is_active = 1
      ) ORDER BY created_at DESC LIMIT ?
    `;
    
    let params = [];
    if (isAuthenticated && user) {
      params = [user.id, limit];
    } else {
      query = `
        SELECT id, type, title, content, link, 0 as is_read, created_at, 'system' as source
        FROM system_notifications
        WHERE is_active = 1
        ORDER BY created_at DESC LIMIT ?
      `;
      params = [limit];
    }
    
    const result = await env.DB_HOMEPAGE.prepare(query).bind(...params).run();
    
    let unreadCount = 0;
    if (isAuthenticated && user) {
      const unreadResult = await env.DB_HOMEPAGE.prepare(`
        SELECT COUNT(*) as count FROM notifications
        WHERE user_id = ? AND is_read = 0
      `).bind(user.id).run();
      unreadCount = unreadResult.results?.[0]?.count || 0;
    }
    
    return new Response(JSON.stringify({
      success: true,
      notifications: result.results || [],
      unread_count: unreadCount
    }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get notifications' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

async function handleMarkNotificationsRead(request, env, user, isAuthenticated) {
  if (!isAuthenticated || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { notification_id, all } = body;
    
    if (all) {
      await env.DB_HOMEPAGE.prepare(`
        UPDATE notifications SET is_read = 1
        WHERE user_id = ?
      `).bind(user.id).run();
    } else if (notification_id) {
      await env.DB_HOMEPAGE.prepare(`
        UPDATE notifications SET is_read = 1
        WHERE id = ? AND user_id = ?
      `).bind(notification_id, user.id).run();
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return new Response(JSON.stringify({ error: 'Failed to mark notifications read' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

async function handleCreateSystemNotification(request, env) {
  try {
    const body = await request.json();
    const { type, title, content, link, priority } = body;
    
    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const result = await env.DB_HOMEPAGE.prepare(`
      INSERT INTO system_notifications (type, title, content, link, priority)
      VALUES (?, ?, ?, ?, ?)
    `).bind(type || 'info', title, content, link || '', priority || 0).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'System notification created'
    }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Create system notification error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create notification' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 访客分析增强 - 实时统计
// ======================================================
async function handleRealtimeAnalytics(request, env) {
  try {
    const onlineResult = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as online_count FROM online_visitors
      WHERE last_active > datetime('now', '-5 minutes')
    `).run();
    
    const recentResult = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as recent_visits FROM visit_logs
      WHERE visit_time > datetime('now', '-5 minutes')
    `).run();
    
    const todayResult = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as today_visits FROM visit_logs
      WHERE date(visit_time) = date('now')
    `).run();
    
    const pagesResult = await env.DB_HOMEPAGE.prepare(`
      SELECT page_url, COUNT(*) as visits
      FROM visit_logs
      WHERE visit_time > datetime('now', '-1 hour')
        AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY visits DESC
      LIMIT 10
    `).run();
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        online: onlineResult.results?.[0]?.online_count || 0,
        recent_visits: recentResult.results?.[0]?.recent_visits || 0,
        today_visits: todayResult.results?.[0]?.today_visits || 0,
        top_pages: pagesResult.results || []
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Realtime analytics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get realtime analytics' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 访客分析增强 - 会话跟踪
// ======================================================
async function handleSessionTracking(request, env) {
  try {
    const body = await request.json();
    const { session_id, page_url, referrer, screen_width, screen_height, time_on_page } = body;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    
    await env.DB_HOMEPAGE.prepare(`
      UPDATE visit_logs
      SET time_on_page = ?,
          screen_width = ?,
          screen_height = ?
      WHERE session_id = ? AND page_url = ?
    `).bind(time_on_page || 0, screen_width || 0, screen_height || 0, session_id, page_url).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Session tracking error:', error);
    return new Response(JSON.stringify({ error: 'Failed to track session' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 访客分析增强 - 综合分析
// ======================================================
async function handleAnalytics(request, env) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d';
    
    let dateFilter = "datetime('now', '-7 days')";
    if (period === '30d') dateFilter = "datetime('now', '-30 days')";
    else if (period === '90d') dateFilter = "datetime('now', '-90 days')";
    else if (period === 'today') dateFilter = "date('now')";
    
    const trendResult = await env.DB_HOMEPAGE.prepare(`
      SELECT date(visit_time) as date, COUNT(*) as visits, COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM visit_logs
      WHERE visit_time >= ${dateFilter}
      GROUP BY date
      ORDER BY date ASC
    `).run();
    
    const pagesResult = await env.DB_HOMEPAGE.prepare(`
      SELECT page_url, COUNT(*) as views, COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM visit_logs
      WHERE visit_time >= ${dateFilter} AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `).run();
    
    const referrersResult = await env.DB_HOMEPAGE.prepare(`
      SELECT referrer_domain, COUNT(*) as visits
      FROM visit_logs
      WHERE visit_time >= ${dateFilter} AND referrer_domain IS NOT NULL
      GROUP BY referrer_domain
      ORDER BY visits DESC
      LIMIT 10
    `).run();
    
    const browserResult = await env.DB_HOMEPAGE.prepare(`
      SELECT browser, COUNT(*) as count
      FROM visit_logs
      WHERE visit_time >= ${dateFilter} AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
    `).run();
    
    const osResult = await env.DB_HOMEPAGE.prepare(`
      SELECT os, COUNT(*) as count
      FROM visit_logs
      WHERE visit_time >= ${dateFilter} AND os IS NOT NULL
      GROUP BY os
      ORDER BY count DESC
    `).run();
    
    const hourlyResult = await env.DB_HOMEPAGE.prepare(`
      SELECT strftime('%H', visit_time) as hour, COUNT(*) as visits
      FROM visit_logs
      WHERE visit_time >= ${dateFilter}
      GROUP BY hour
      ORDER BY hour ASC
    `).run();
    
    const summaryResult = await env.DB_HOMEPAGE.prepare(`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        AVG(time_on_page) as avg_time_on_page
      FROM visit_logs
      WHERE visit_time >= ${dateFilter}
    `).run();
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        trend: trendResult.results || [],
        top_pages: pagesResult.results || [],
        top_referrers: referrersResult.results || [],
        browsers: browserResult.results || [],
        operating_systems: osResult.results || [],
        hourly_distribution: hourlyResult.results || [],
        summary: summaryResult.results?.[0] || { total_visits: 0, unique_visitors: 0, avg_time_on_page: 0 }
      },
      period: period,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get analytics' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 增强版统计处理
// ======================================================
async function handleStats(request, env, ctx) {
  try {
    if (!env?.DB_HOMEPAGE) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'content-type': 'application/json' }
      });
    }

    const cf = request.cf || {};
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const cookie = request.headers.get('cookie') || '';
    const langMatch = cookie.match(/preferred_lang=([^;]+)/);
    const lang = langMatch ? langMatch[1] : 'unknown';
    const referer = request.headers.get('referer') || '';
    const url = new URL(request.url);
    
    let referrerDomain = '';
    try {
      if (referer) {
        const refUrl = new URL(referer);
        referrerDomain = refUrl.hostname;
      }
    } catch (_) {}

    const deviceInfo = detectDeviceInfo(userAgent);
    let sessionId = cookie.match(/session_id=([^;]+)/)?.[1] || generateSessionId();
    
    ctx.waitUntil(
      env.DB_HOMEPAGE.prepare(`
        INSERT INTO visit_logs (
          visitor_ip, user_agent, country, city, language, referer,
          referrer_domain, browser, os, session_id, page_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ip, userAgent, cf.country || '', cf.city || '',
        lang, referer, referrerDomain, deviceInfo.browser,
        deviceInfo.os, sessionId, url.pathname || '/'
      ).run()
    );

    ctx.waitUntil(
      env.DB_HOMEPAGE.prepare(`
        INSERT INTO online_visitors (visitor_ip, user_agent, session_id)
        VALUES (?, ?, ?)
        ON CONFLICT(visitor_ip) DO UPDATE SET
          last_active = CURRENT_TIMESTAMP,
          user_agent = ?
      `).bind(ip, userAgent, sessionId, userAgent).run()
    );

    const result = await env.DB_HOMEPAGE.prepare(`
      INSERT INTO stats (id, total_visits, last_visit)
      VALUES (1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        total_visits = total_visits + 1,
        last_visit = CURRENT_TIMESTAMP
      RETURNING total_visits
    `).run();

    const total = result.results?.[0]?.total_visits || 1;
    const sessionCookie = `session_id=${sessionId}; path=/; max-age=86400; samesite=lax; Secure`;

    return new Response(JSON.stringify({
      success: true,
      total_visits: total,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'set-cookie': sessionCookie
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update stats' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 在线状态处理
// ======================================================
async function handleOnline(request, env) {
  try {
    if (!env?.DB_HOMEPAGE) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'content-type': 'application/json' }
      });
    }

    await env.DB_HOMEPAGE.prepare(`
      DELETE FROM online_visitors 
      WHERE last_active < datetime('now', '-5 minutes')
    `).run();

    const result = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as online_count FROM online_visitors
    `).run();

    const onlineCount = result.results?.[0]?.online_count || 0;

    return new Response(JSON.stringify({
      success: true,
      online_count: onlineCount,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Online status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get online status' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// ======================================================
// 工具函数
// ======================================================
function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'edge_home_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

function detectDeviceInfo(userAgent) {
  const ua = userAgent.toLowerCase();
  let browser = 'unknown';
  let os = 'unknown';

  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { browser, os };
}

// ======================================================
// 渲染登录页面
// ======================================================
function renderLoginPage(lang = 'zh') {
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lang === 'zh' ? '管理员登录' : lang === 'en' ? 'Admin Login' : lang === 'ja' ? '管理者ログイン' : '관리자 로그인'}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0b0d14;color:#fff;min-height:100vh;display:flex;justify-content:center;align-items:center}
    .login-container{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:48px 40px;max-width:400px;width:90%;backdrop-filter:blur(10px)}
    .login-container h1{font-size:28px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#fff 0%,#8899bb 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .login-container .subtitle{color:rgba(255,255,255,0.4);font-size:14px;margin-bottom:32px}
    .login-container .back-link{color:rgba(255,255,255,0.3);text-decoration:none;font-size:13px;display:inline-block;margin-bottom:24px;transition:color .3s}
    .login-container .back-link:hover{color:rgba(255,255,255,0.6)}
    .form-group{margin-bottom:20px}
    .form-group label{display:block;font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:6px}
    .form-group input{width:100%;padding:14px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);color:#fff;font-size:16px;outline:none;transition:all .3s}
    .form-group input:focus{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);box-shadow:0 0 20px rgba(255,255,255,0.05)}
    .form-group input::placeholder{color:rgba(255,255,255,0.2)}
    .login-btn{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#4a6fa5,#8899bb);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s;margin-top:8px}
    .login-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(74,111,165,0.3)}
    .login-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
    .error-message{color:#ef4444;font-size:13px;margin-top:12px;display:none;text-align:center}
    .error-message.show{display:block}
    .hint{color:rgba(255,255,255,0.2);font-size:12px;text-align:center;margin-top:16px}
    .language-selector-login{position:fixed;top:20px;right:20px;z-index:100;background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:4px}
    .language-selector-login select{background:transparent;color:#fff;border:none;padding:8px 12px;font-size:13px;cursor:pointer;outline:none;border-radius:6px;min-width:100px}
    .language-selector-login select:hover{background:rgba(255,255,255,0.1)}
    .language-selector-login select option{background:#1a2233;color:#fff}
    @media(max-width:480px){.login-container{padding:32px 24px}.login-container h1{font-size:24px}}
  </style>
</head>
<body>
  <div class="language-selector-login">
    <select id="languageSelectLogin" onchange="changeLoginLanguage(this.value)">
      <option value="zh" ${lang === 'zh' ? 'selected' : ''}>中文</option>
      <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
      <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
      <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
    </select>
  </div>
  <div class="login-container">
    <a href="/" class="back-link">${lang === 'zh' ? '← 返回首页' : lang === 'en' ? '← Back to Home' : lang === 'ja' ? '← ホームに戻る' : '← 홈으로 돌아가기'}</a>
    <h1>${lang === 'zh' ? '🔐 管理员登录' : lang === 'en' ? '🔐 Admin Login' : lang === 'ja' ? '🔐 管理者ログイン' : '🔐 관리자 로그인'}</h1>
    <p class="subtitle">${lang === 'zh' ? '请输入密码访问管理面板' : lang === 'en' ? 'Please enter password to access admin panel' : lang === 'ja' ? 'パスワードを入力して管理パネルにアクセスしてください' : '비밀번호를 입력하여 관리 패널에 액세스하세요'}</p>
    <form id="loginForm" onsubmit="return handleLogin(event)">
      <div class="form-group">
        <label for="password">${lang === 'zh' ? '密码' : lang === 'en' ? 'Password' : lang === 'ja' ? 'パスワード' : '비밀번호'}</label>
        <input type="password" id="password" placeholder="${lang === 'zh' ? '请输入管理密码' : lang === 'en' ? 'Enter admin password' : lang === 'ja' ? '管理者パスワードを入力' : '관리자 비밀번호 입력'}" autofocus required/>
      </div>
      <button type="submit" class="login-btn" id="loginBtn">${lang === 'zh' ? '🔓 登录' : lang === 'en' ? '🔓 Login' : lang === 'ja' ? '🔓 ログイン' : '🔓 로그인'}</button>
      <div class="error-message" id="errorMessage">${lang === 'zh' ? '❌ 密码错误，请重试' : lang === 'en' ? '❌ Wrong password, please try again' : lang === 'ja' ? '❌ パスワードが間違っています。再試行してください' : '❌ 비밀번호가 잘못되었습니다. 다시 시도하세요'}</div>
      <div class="hint">${lang === 'zh' ? '提示：密码在环境变量 ADMIN_PASSWORD 中设置' : lang === 'en' ? 'Hint: Password is set in environment variable ADMIN_PASSWORD' : lang === 'ja' ? 'ヒント：パスワードは環境変数 ADMIN_PASSWORD で設定されます' : '힌트: 비밀번호는 환경 변수 ADMIN_PASSWORD에 설정됩니다'}</div>
    </form>
  </div>
  <script>
    window.changeLoginLanguage = function(lang) {
      document.cookie = 'preferred_lang=' + lang + '; path=/; max-age=31536000; samesite=lax; Secure';
      window.location.href = '/admin?lang=' + lang;
    };
    async function handleLogin(event) {
      event.preventDefault();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');
      const errorMsg = document.getElementById('errorMessage');
      const lang = document.getElementById('languageSelectLogin').value;
      const msgs = {
        zh: { empty: '❌ 请输入密码', wrong: '❌ 密码错误，请重试', network: '❌ 网络错误，请重试', verifying: '⏳ 验证中...', login: '🔓 登录' },
        en: { empty: '❌ Please enter password', wrong: '❌ Wrong password, please try again', network: '❌ Network error, please retry', verifying: '⏳ Verifying...', login: '🔓 Login' },
        ja: { empty: '❌ パスワードを入力してください', wrong: '❌ パスワードが間違っています。再試行してください', network: '❌ ネットワークエラー。再試行してください', verifying: '⏳ 検証中...', login: '🔓 ログイン' },
        ko: { empty: '❌ 비밀번호를 입력하세요', wrong: '❌ 비밀번호가 잘못되었습니다. 다시 시도하세요', network: '❌ 네트워크 오류. 다시 시도하세요', verifying: '⏳ 확인 중...', login: '🔓 로그인' }
      };
      const t = msgs[lang] || msgs.zh;
      if (!password) {
        errorMsg.textContent = t.empty;
        errorMsg.classList.add('show');
        return false;
      }
      btn.disabled = true;
      btn.textContent = t.verifying;
      errorMsg.classList.remove('show');
      try {
        const response = await fetch('/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password })
        });
        if (response.ok) {
          window.location.href = '/admin?lang=' + lang;
          return false;
        } else {
          const data = await response.json();
          errorMsg.textContent = data.error || t.wrong;
          errorMsg.classList.add('show');
          btn.disabled = false;
          btn.textContent = t.login;
          document.getElementById('password').value = '';
          document.getElementById('password').focus();
        }
      } catch (error) {
        errorMsg.textContent = t.network;
        errorMsg.classList.add('show');
        btn.disabled = false;
        btn.textContent = t.login;
      }
      return false;
    }
    document.getElementById('password').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        handleLogin(e);
      }
    });
  </script>
</body>
</html>
  `;
}

// ======================================================
// 渲染管理面板
// ======================================================
async function renderAdminPanel(request, env) {
  try {
    if (!env?.DB_HOMEPAGE) {
      return new Response('Database not available', { status: 503 });
    }

    const url = new URL(request.url);
    const langParam = url.searchParams.get('lang');
    let lang = 'zh';
    if (langParam && ['zh', 'en', 'ja', 'ko'].includes(langParam)) {
      lang = langParam;
    } else {
      const cookie = request.headers.get('cookie') || '';
      const langMatch = cookie.match(/preferred_lang=([^;]+)/);
      if (langMatch && ['zh', 'en', 'ja', 'ko'].includes(langMatch[1])) {
        lang = langMatch[1];
      }
    }

    await cleanOldData(env);

    const statsResult = await env.DB_HOMEPAGE.prepare(`
      SELECT * FROM stats WHERE id = 1
    `).run();
    const stats = statsResult.results?.[0] || { total_visits: 0, last_visit: null };

    const todayResult = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as count FROM visit_logs 
      WHERE date(visit_time) = date('now')
    `).run();
    const todayVisits = todayResult.results?.[0]?.count || 0;

    const trendResult = await env.DB_HOMEPAGE.prepare(`
      SELECT 
        date(visit_time) as date,
        COUNT(*) as visits
      FROM visit_logs 
      WHERE visit_time >= datetime('now', '-30 days')
      GROUP BY date(visit_time)
      ORDER BY date ASC
    `).run();
    
    const trendData = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = trendResult.results?.find(r => r.date === dateStr);
      trendData.push({
        date: dateStr,
        visits: found ? found.visits : 0
      });
    }

    const recentVisitorsResult = await env.DB_HOMEPAGE.prepare(`
      SELECT 
        visitor_ip,
        country,
        city,
        language,
        visit_time,
        user_agent,
        browser,
        os,
        page_url
      FROM visit_logs 
      ORDER BY visit_time DESC 
      LIMIT 20
    `).run();
    const recentVisitors = recentVisitorsResult.results || [];

    await env.DB_HOMEPAGE.prepare(`
      DELETE FROM online_visitors 
      WHERE last_active < datetime('now', '-5 minutes')
    `).run();
    const onlineResult = await env.DB_HOMEPAGE.prepare(`
      SELECT COUNT(*) as online_count FROM online_visitors
    `).run();
    const onlineCount = onlineResult.results?.[0]?.online_count || 0;

    const analyticsData = await getAnalyticsData(env);

    // 获取用户列表（管理员功能）
    const usersResult = await env.DB_HOMEPAGE.prepare(`
      SELECT id, username, email, display_name, role, created_at, last_login, is_active
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `).run();
    const users = usersResult.results || [];

    const html = renderAdminHTML(stats, trendData, todayVisits, recentVisitors, onlineCount, analyticsData, users, lang);
    
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Admin panel error:', error);
    return new Response('Error loading admin panel: ' + error.message, { status: 500 });
  }
}

// ======================================================
// 获取画像分析数据
// ======================================================
async function getAnalyticsData(env) {
  try {
    const browserResult = await env.DB_HOMEPAGE.prepare(`
      SELECT browser, COUNT(*) as count
      FROM visit_logs
      WHERE browser IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 10
    `).run();

    const osResult = await env.DB_HOMEPAGE.prepare(`
      SELECT os, COUNT(*) as count
      FROM visit_logs
      WHERE os IS NOT NULL
      GROUP BY os
      ORDER BY count DESC
      LIMIT 10
    `).run();

    const countryResult = await env.DB_HOMEPAGE.prepare(`
      SELECT country, COUNT(*) as count
      FROM visit_logs
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `).run();

    return {
      browsers: browserResult.results || [],
      operatingSystems: osResult.results || [],
      countries: countryResult.results || []
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return { browsers: [], operatingSystems: [], countries: [] };
  }
}

// ======================================================
// 渲染管理面板 HTML
// ======================================================
function renderAdminHTML(stats, trendData, todayVisits, recentVisitors, onlineCount, analyticsData, users, lang = 'zh') {
  const totalVisits = stats.total_visits || 0;
  const lastVisit = stats.last_visit ? new Date(stats.last_visit).toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US') : (lang === 'zh' ? '暂无数据' : lang === 'en' ? 'No data' : lang === 'ja' ? 'データなし' : '데이터 없음');
  
  const totalTrendVisits = trendData.reduce((sum, item) => sum + item.visits, 0);
  const avgVisits = trendData.length > 0 ? Math.round(totalTrendVisits / trendData.length) : 0;
  const maxVisits = trendData.length > 0 ? Math.max(...trendData.map(d => d.visits)) : 0;
  
  const L = {
    zh: {
      title: '📊 访客管理面板', back: '← 返回首页', logout: '🚪 退出', autoClean: '🔄 自动清理 >7天',
      onlineNow: `🟢 在线 ${onlineCount} 人`,
      totalVisits: '总访问量', totalSub: '累计访问', todayVisits: '今日访问', todaySub: '最近24小时',
      avgVisits: '日均访问', avgSub: '近30天平均', peakVisits: '访问峰值', peakSub: '单日最高',
      trendTitle: '📈 近30天访问趋势', systemStatus: '📋 系统状态',
      analyticsTitle: '👤 访客画像分析', browserDistribution: '浏览器分布',
      osDistribution: '操作系统分布', countryDistribution: '国家/地区分布',
      item: '统计项', value: '数值', status: '状态', active: '活跃', online: '🟢 在线', offline: '⚪ 离线',
      dbStatus: '数据库状态', dbRunning: 'D1 运行中', dbNormal: '✅ 正常',
      dataRetention: '数据保留', dataRetentionVal: '最近7天', dataRetentionBadge: '🔄 自动清理',
      todayVisitors: '今日访客', todayVisitorsVal: '人', todayVisitorsBadge: '👤 活跃',
      recentVisitors: '🕐 最近访客 (最近20条)', ip: 'IP', location: '位置', language: '语言', time: '访问时间',
      browser: '浏览器', os: '系统', page: '页面', unknown: '未知', empty: '暂无访客记录', emptySub: '等待第一位访客...',
      lastVisitLabel: '最后访问时间', usersTitle: '👥 用户管理', username: '用户名', email: '邮箱',
      displayName: '显示名称', role: '角色', created: '注册时间', lastLogin: '最后登录', active: '状态',
      actions: '操作'
    },
    en: {
      title: '📊 Visitor Management Panel', back: '← Back to Home', logout: '🚪 Logout', autoClean: '🔄 Auto Clean >7 days',
      onlineNow: `🟢 ${onlineCount} online`,
      totalVisits: 'Total Visits', totalSub: 'Cumulative', todayVisits: 'Today\'s Visits', todaySub: 'Last 24 hours',
      avgVisits: 'Daily Average', avgSub: 'Last 30 days avg', peakVisits: 'Peak Visits', peakSub: 'Highest daily',
      trendTitle: '📈 30-Day Visit Trend', systemStatus: '📋 System Status',
      analyticsTitle: '👤 Visitor Analytics', browserDistribution: 'Browser Distribution',
      osDistribution: 'OS Distribution', countryDistribution: 'Country/Region Distribution',
      item: 'Item', value: 'Value', status: 'Status', active: 'Active', online: '🟢 Online', offline: '⚪ Offline',
      dbStatus: 'Database Status', dbRunning: 'D1 Running', dbNormal: '✅ Normal',
      dataRetention: 'Data Retention', dataRetentionVal: 'Last 7 days', dataRetentionBadge: '🔄 Auto Clean',
      todayVisitors: 'Today\'s Visitors', todayVisitorsVal: 'people', todayVisitorsBadge: '👤 Active',
      recentVisitors: '🕐 Recent Visitors (Last 20)', ip: 'IP', location: 'Location', language: 'Language', time: 'Visit Time',
      browser: 'Browser', os: 'OS', page: 'Page', unknown: 'Unknown', empty: 'No visitor records', emptySub: 'Waiting for first visitor...',
      lastVisitLabel: 'Last Visit Time', usersTitle: '👥 User Management', username: 'Username', email: 'Email',
      displayName: 'Display Name', role: 'Role', created: 'Registered', lastLogin: 'Last Login', active: 'Status',
      actions: 'Actions'
    },
    ja: {
      title: '📊 訪問者管理パネル', back: '← ホームに戻る', logout: '🚪 ログアウト', autoClean: '🔄 自動クリーン >7日',
      onlineNow: `🟢 ${onlineCount} オンライン`,
      totalVisits: '総訪問数', totalSub: '累計', todayVisits: '本日の訪問', todaySub: '過去24時間',
      avgVisits: '1日平均', avgSub: '過去30日間平均', peakVisits: 'ピーク訪問', peakSub: '1日最高',
      trendTitle: '📈 過去30日間の訪問傾向', systemStatus: '📋 システムステータス',
      analyticsTitle: '👤 訪問者分析', browserDistribution: 'ブラウザ分布',
      osDistribution: 'OS分布', countryDistribution: '国/地域分布',
      item: '項目', value: '値', status: 'ステータス', active: 'アクティブ', online: '🟢 オンライン', offline: '⚪ オフライン',
      dbStatus: 'データベースステータス', dbRunning: 'D1 実行中', dbNormal: '✅ 正常',
      dataRetention: 'データ保持', dataRetentionVal: '最近7日間', dataRetentionBadge: '🔄 自動クリーン',
      todayVisitors: '本日の訪問者', todayVisitorsVal: '人', todayVisitorsBadge: '👤 アクティブ',
      recentVisitors: '🕐 最近の訪問者 (最新20件)', ip: 'IP', location: '場所', language: '言語', time: '訪問時間',
      browser: 'ブラウザ', os: 'OS', page: 'ページ', unknown: '不明', empty: '訪問記録がありません', emptySub: '最初の訪問者を待っています...',
      lastVisitLabel: '最終訪問時間', usersTitle: '👥 ユーザー管理', username: 'ユーザー名', email: 'メール',
      displayName: '表示名', role: '役割', created: '登録日', lastLogin: '最終ログイン', active: 'ステータス',
      actions: '操作'
    },
    ko: {
      title: '📊 방문자 관리 패널', back: '← 홈으로 돌아가기', logout: '🚪 로그아웃', autoClean: '🔄 자동 정리 >7일',
      onlineNow: `🟢 ${onlineCount}명 온라인`,
      totalVisits: '총 방문수', totalSub: '누적', todayVisits: '오늘 방문', todaySub: '최근 24시간',
      avgVisits: '일일 평균', avgSub: '최근 30일 평균', peakVisits: '최대 방문', peakSub: '일일 최고',
      trendTitle: '📈 최근 30일 방문 추세', systemStatus: '📋 시스템 상태',
      analyticsTitle: '👤 방문자 분석', browserDistribution: '브라우저 분포',
      osDistribution: 'OS 분포', countryDistribution: '국가/지역 분포',
      item: '항목', value: '값', status: '상태', active: '활성', online: '🟢 온라인', offline: '⚪ 오프라인',
      dbStatus: '데이터베이스 상태', dbRunning: 'D1 실행 중', dbNormal: '✅ 정상',
      dataRetention: '데이터 보관', dataRetentionVal: '최근 7일', dataRetentionBadge: '🔄 자동 정리',
      todayVisitors: '오늘 방문자', todayVisitorsVal: '명', todayVisitorsBadge: '👤 활성',
      recentVisitors: '🕐 최근 방문자 (최근 20개)', ip: 'IP', location: '위치', language: '언어', time: '방문 시간',
      browser: '브라우저', os: 'OS', page: '페이지', unknown: '알 수 없음', empty: '방문 기록이 없습니다', emptySub: '첫 번째 방문자를 기다리는 중...',
      lastVisitLabel: '마지막 방문 시간', usersTitle: '👥 사용자 관리', username: '사용자명', email: '이메일',
      displayName: '표시 이름', role: '역할', created: '등록일', lastLogin: '마지막 로그인', active: '상태',
      actions: '작업'
    }
  };
  
  const l = L[lang] || L.zh;
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${l.title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0b0d14;color:#fff;min-height:100vh;padding:40px 20px;animation:fadeIn .6s ease-out}
    @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    .container{max-width:1400px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.1);flex-wrap:wrap;gap:16px;animation:slideUp .6s ease-out}
    .header h1{font-size:32px;font-weight:700;background:linear-gradient(135deg,#fff 0%,#8899bb 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .header .header-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .header a{color:rgba(255,255,255,0.6);text-decoration:none;padding:8px 20px;border:1px solid rgba(255,255,255,0.1);border-radius:20px;transition:all .3s;font-size:14px}
    .header a:hover{background:rgba(255,255,255,0.1);color:#fff;transform:translateY(-2px)}
    .header .clean-badge{font-size:12px;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:12px}
    .header .online-badge{font-size:13px;color:#4ade80;background:rgba(74,222,128,0.1);padding:4px 14px;border-radius:12px;animation:pulse 2s infinite;border:1px solid rgba(74,222,128,0.2)}
    .header .logout-btn{color:rgba(255,100,100,0.5);border-color:rgba(255,100,100,0.2)}
    .header .logout-btn:hover{background:rgba(255,100,100,0.1);color:#ff6b6b}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:40px;animation:slideUp .6s ease-out .1s both}
    .stat-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;backdrop-filter:blur(10px);transition:all .3s;cursor:default}
    .stat-card:hover{background:rgba(255,255,255,0.06);transform:translateY(-4px);box-shadow:0 8px 30px rgba(0,0,0,0.3)}
    .stat-card .label{font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:8px}
    .stat-card .value{font-size:36px;font-weight:700;background:linear-gradient(135deg,#fff 0%,#8899bb 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;transition:all .3s}
    .stat-card .sub{font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px}
    .chart-container{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:30px;margin-bottom:40px;animation:slideUp .6s ease-out .2s both;transition:all .3s}
    .chart-container:hover{border-color:rgba(255,255,255,0.1)}
    .chart-container h2{font-size:20px;font-weight:600;margin-bottom:20px;color:rgba(255,255,255,0.8)}
    .chart{display:flex;align-items:flex-end;gap:8px;height:200px;padding-top:20px;overflow-x:auto}
    .chart-bar{flex:1;min-width:20px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .3s}
    .chart-bar .bar{width:100%;max-width:40px;background:linear-gradient(180deg,#4a6fa5,#8899bb);border-radius:4px 4px 0 0;transition:all .3s;min-height:4px;position:relative;cursor:pointer}
    .chart-bar .bar:hover{opacity:0.8;transform:scaleY(1.05)}
    .chart-bar .bar-label{font-size:10px;color:rgba(255,255,255,0.3);writing-mode:vertical-rl;text-orientation:mixed}
    .chart-bar .bar-value{font-size:11px;color:rgba(255,255,255,0.5)}
    .analytics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:40px;animation:slideUp .6s ease-out .3s both}
    .analytics-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;backdrop-filter:blur(10px);transition:all .3s}
    .analytics-card:hover{background:rgba(255,255,255,0.06);transform:translateY(-2px)}
    .analytics-card h3{font-size:16px;font-weight:600;margin-bottom:16px;color:rgba(255,255,255,0.7)}
    .analytics-item{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
    .analytics-item .name{color:rgba(255,255,255,0.6);font-size:13px}
    .analytics-item .count{color:rgba(255,255,255,0.8);font-size:13px;font-weight:600}
    .analytics-bar{flex:1;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;margin:0 12px;overflow:hidden}
    .analytics-bar .fill{height:100%;background:linear-gradient(90deg,#4a6fa5,#8899bb);border-radius:2px;transition:width 1s ease}
    .info-table{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;overflow-x:auto;margin-bottom:40px;animation:slideUp .6s ease-out .4s both}
    .info-table h2{font-size:20px;font-weight:600;margin-bottom:20px;color:rgba(255,255,255,0.8)}
    .info-table table{width:100%;border-collapse:collapse}
    .info-table th,.info-table td{padding:12px 16px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.05)}
    .info-table th{font-size:12px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.5px}
    .info-table td{font-size:14px;color:rgba(255,255,255,0.8)}
    .info-table tr:hover{background:rgba(255,255,255,0.03)}
    .badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;background:rgba(74,111,165,0.3);color:#8899bb}
    .badge-success{background:rgba(34,197,94,0.2);color:#4ade80}
    .badge-warning{background:rgba(234,179,8,0.2);color:#fbbf24}
    .badge-active{background:rgba(34,197,94,0.2);color:#4ade80}
    .badge-inactive{background:rgba(239,68,68,0.2);color:#ef4444}
    .recent-visitors{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;overflow-x:auto;animation:slideUp .6s ease-out .5s both}
    .recent-visitors h2{font-size:20px;font-weight:600;margin-bottom:20px;color:rgba(255,255,255,0.8)}
    .recent-visitors table{width:100%;border-collapse:collapse}
    .recent-visitors th,.recent-visitors td{padding:10px 14px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px}
    .recent-visitors th{color:rgba(255,255,255,0.4);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
    .recent-visitors td{color:rgba(255,255,255,0.7)}
    .recent-visitors tr:hover{background:rgba(255,255,255,0.03)}
    .ip-cell{font-family:monospace;font-size:12px}
    .time-cell{font-size:12px;color:rgba(255,255,255,0.4)}
    .empty-state{text-align:center;padding:40px 20px;color:rgba(255,255,255,0.3)}
    .language-selector-admin{position:fixed;top:20px;right:20px;z-index:100;background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:4px}
    .language-selector-admin select{background:transparent;color:#fff;border:none;padding:8px 12px;font-size:13px;cursor:pointer;outline:none;border-radius:6px;min-width:100px}
    .language-selector-admin select:hover{background:rgba(255,255,255,0.1)}
    .language-selector-admin select option{background:#1a2233;color:#fff}
    @media(max-width:768px){body{padding:20px 12px}.header h1{font-size:24px}.header .header-actions{width:100%;justify-content:space-between}.stats-grid{grid-template-columns:1fr 1fr;gap:12px}.stat-card .value{font-size:28px}.chart{height:150px;gap:4px}.chart-bar .bar-label{font-size:8px}.analytics-grid{grid-template-columns:1fr 1fr;gap:12px}.recent-visitors th,.recent-visitors td{padding:6px 8px;font-size:11px}.language-selector-admin{top:10px;right:10px}.language-selector-admin select{font-size:12px;padding:4px 8px;min-width:80px}}
    @media(max-width:480px){.stats-grid{grid-template-columns:1fr 1fr;gap:8px}.stat-card{padding:16px}.stat-card .value{font-size:22px}.analytics-grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="language-selector-admin">
    <select id="languageSelectAdmin" onchange="changeAdminLanguage(this.value)">
      <option value="zh" ${lang === 'zh' ? 'selected' : ''}>中文</option>
      <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
      <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
      <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
    </select>
  </div>
  <div class="container">
    <div class="header">
      <h1>${l.title}</h1>
      <div class="header-actions">
        <span class="online-badge">${l.onlineNow}</span>
        <span class="clean-badge">${l.autoClean}</span>
        <a href="/admin/logout" class="logout-btn" onclick="logout(event)">${l.logout}</a>
        <a href="/">${l.back}</a>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="label">${l.totalVisits}</div><div class="value">${totalVisits.toLocaleString()}</div><div class="sub">${l.totalSub}</div></div>
      <div class="stat-card"><div class="label">${l.todayVisits}</div><div class="value">${todayVisits}</div><div class="sub">${l.todaySub}</div></div>
      <div class="stat-card"><div class="label">${l.avgVisits}</div><div class="value">${avgVisits}</div><div class="sub">${l.avgSub}</div></div>
      <div class="stat-card"><div class="label">${l.peakVisits}</div><div class="value">${maxVisits}</div><div class="sub">${l.peakSub}</div></div>
    </div>
    <div class="chart-container">
      <h2>${l.trendTitle}</h2>
      <div class="chart">
        ${trendData.map((item, index) => {
          const maxVal = Math.max(...trendData.map(d => d.visits), 1);
          const height = (item.visits / maxVal) * 180;
          return `<div class="chart-bar" style="animation:slideUp .4s ease-out ${index * 20}ms both;"><div class="bar-value">${item.visits || ''}</div><div class="bar" style="height:${Math.max(height, 4)}px;" title="${item.date}: ${item.visits} ${lang === 'zh' ? '次访问' : lang === 'en' ? 'visits' : lang === 'ja' ? '回訪問' : '회 방문'}"></div><div class="bar-label">${item.date.slice(5)}</div></div>`;
        }).join('')}
      </div>
    </div>
    <div class="analytics-grid">
      <div class="analytics-card">
        <h3>${l.browserDistribution}</h3>
        ${analyticsData.browsers.length > 0 ? analyticsData.browsers.map((item, index) => {
          const total = analyticsData.browsers.reduce((sum, d) => sum + d.count, 0);
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return `<div class="analytics-item" style="animation:slideUp .3s ease-out ${index * 50 + 100}ms both;"><span class="name">${item.browser || l.unknown}</span><div class="analytics-bar"><div class="fill" style="width:${percentage}%;"></div></div><span class="count">${item.count} (${percentage}%)</span></div>`;
        }).join('') : `<div class="empty-state"><p>${l.empty}</p></div>`}
      </div>
      <div class="analytics-card">
        <h3>${l.osDistribution}</h3>
        ${analyticsData.operatingSystems.length > 0 ? analyticsData.operatingSystems.map((item, index) => {
          const total = analyticsData.operatingSystems.reduce((sum, d) => sum + d.count, 0);
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return `<div class="analytics-item" style="animation:slideUp .3s ease-out ${index * 50 + 200}ms both;"><span class="name">${item.os || l.unknown}</span><div class="analytics-bar"><div class="fill" style="width:${percentage}%;"></div></div><span class="count">${item.count} (${percentage}%)</span></div>`;
        }).join('') : `<div class="empty-state"><p>${l.empty}</p></div>`}
      </div>
      <div class="analytics-card">
        <h3>${l.countryDistribution}</h3>
        ${analyticsData.countries.length > 0 ? analyticsData.countries.map((item, index) => {
          const total = analyticsData.countries.reduce((sum, d) => sum + d.count, 0);
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return `<div class="analytics-item" style="animation:slideUp .3s ease-out ${index * 50 + 300}ms both;"><span class="name">${item.country || l.unknown}</span><div class="analytics-bar"><div class="fill" style="width:${percentage}%;"></div></div><span class="count">${item.count} (${percentage}%)</span></div>`;
        }).join('') : `<div class="empty-state"><p>${l.empty}</p></div>`}
      </div>
    </div>
    <div class="info-table">
      <h2>${l.systemStatus}</h2>
      <table>
        <thead><tr><th>${l.item}</th><th>${l.value}</th><th>${l.status}</th></tr></thead>
        <tbody>
          <tr><td>${l.totalVisits}</td><td>${totalVisits.toLocaleString()}</td><td><span class="badge badge-success">${l.active}</span></td></tr>
          <tr><td>${l.lastVisitLabel}</td><td>${lastVisit}</td><td><span class="badge ${new Date(stats.last_visit) > new Date(Date.now() - 3600000) ? 'badge-success' : 'badge-warning'}">${new Date(stats.last_visit) > new Date(Date.now() - 3600000) ? l.online : l.offline}</span></td></tr>
          <tr><td>${l.dbStatus}</td><td>${l.dbRunning}</td><td><span class="badge badge-success">${l.dbNormal}</span></td></tr>
          <tr><td>${l.dataRetention}</td><td>${l.dataRetentionVal}</td><td><span class="badge">${l.dataRetentionBadge}</span></td></tr>
          <tr><td>${l.todayVisitors}</td><td>${todayVisits} ${l.todayVisitorsVal}</td><td><span class="badge">${l.todayVisitorsBadge}</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="recent-visitors">
      <h2>${l.recentVisitors}</h2>
      ${recentVisitors.length > 0 ? `
      <table>
        <thead><tr><th>${l.ip}</th><th>${l.location}</th><th>${l.language}</th><th>${l.browser}</th><th>${l.os}</th><th>${l.page}</th><th>${l.time}</th></tr></thead>
        <tbody>
          ${recentVisitors.map(visitor => `
            <tr><td class="ip-cell">${visitor.visitor_ip || l.unknown}</td><td>${visitor.country || ''} ${visitor.city || ''}</td><td>${visitor.language || l.unknown}</td><td>${visitor.browser || l.unknown}</td><td>${visitor.os || l.unknown}</td><td style="font-size:11px;color:rgba(255,255,255,0.4);">${visitor.page_url || '/'}</td><td class="time-cell">${visitor.visit_time ? new Date(visitor.visit_time).toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US') : l.unknown}</td></tr>
          `).join('')}
        </tbody>
      </table>
      ` : `<div class="empty-state"><p>${l.empty}</p><p style="font-size:12px;margin-top:8px;">${l.emptySub}</p></div>`}
    </div>
    <div class="info-table" style="margin-top:40px;">
      <h2>${l.usersTitle}</h2>
      ${users.length > 0 ? `
      <table>
        <thead><tr><th>ID</th><th>${l.username}</th><th>${l.displayName}</th><th>${l.email}</th><th>${l.role}</th><th>${l.created}</th><th>${l.lastLogin}</th><th>${l.active}</th></tr></thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.username || l.unknown}</td>
              <td>${user.display_name || user.username || l.unknown}</td>
              <td>${user.email || l.unknown}</td>
              <td><span class="badge">${user.role || 'user'}</span></td>
              <td class="time-cell">${user.created_at ? new Date(user.created_at).toLocaleDateString() : l.unknown}</td>
              <td class="time-cell">${user.last_login ? new Date(user.last_login).toLocaleDateString() : l.unknown}</td>
              <td><span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">${user.is_active ? '✅' : '❌'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : `<div class="empty-state"><p>${l.empty}</p></div>`}
    </div>
  </div>
  <script>
    window.changeAdminLanguage = function(lang) {
      document.cookie = 'preferred_lang=' + lang + '; path=/; max-age=31536000; samesite=lax; Secure';
      window.location.href = '/admin?lang=' + lang;
    };
    function logout(event) {
      event.preventDefault();
      const lang = document.getElementById('languageSelectAdmin').value;
      const msgs = { zh: '确定要退出吗？', en: 'Are you sure you want to logout?', ja: 'ログアウトしてもよろしいですか？', ko: '로그아웃하시겠습니까?' };
      if (confirm(msgs[lang] || msgs.zh)) {
        document.cookie = 'admin_auth=; path=/admin; max-age=0; samesite=lax; Secure';
        window.location.href = '/admin?lang=' + lang;
      }
    }
    async function updateOnlineCount() {
      try {
        const response = await fetch('/api/online');
        const data = await response.json();
        if (data.success) {
          const badge = document.querySelector('.online-badge');
          if (badge) {
            const lang = document.getElementById('languageSelectAdmin').value;
            const labels = { zh: '🟢 在线 ' + data.online_count + ' 人', en: '🟢 ' + data.online_count + ' online', ja: '🟢 ' + data.online_count + ' オンライン', ko: '🟢 ' + data.online_count + '명 온라인' };
            badge.textContent = labels[lang] || labels.zh;
          }
        }
      } catch (error) { console.error('Update online count error:', error); }
    }
    setInterval(updateOnlineCount, 30000);
    document.addEventListener('DOMContentLoaded', updateOnlineCount);
  </script>
</body>
</html>
  `;
}

// ======================================================
// 清理旧数据
// ======================================================
async function cleanOldData(env) {
  try {
    const lastCleanKey = 'last_clean_time';
    let lastClean = null;
    if (env?.KV_HOMEPAGE) {
      try { lastClean = await env.KV_HOMEPAGE.get(lastCleanKey); } catch (_) {}
    }
    const now = Date.now();
    if (!lastClean || (now - parseInt(lastClean)) > 86400000) {
      const result = await env.DB_HOMEPAGE.prepare(`DELETE FROM visit_logs WHERE visit_time < datetime('now', '-7 days')`).run();
      await env.DB_HOMEPAGE.prepare(`DELETE FROM online_visitors WHERE last_active < datetime('now', '-5 minutes')`).run();
      console.log(`Cleaned ${result.changes || 0} old records`);
      if (env?.KV_HOMEPAGE) {
        try { await env.KV_HOMEPAGE.put(lastCleanKey, String(now)); } catch (_) {}
      }
    }
  } catch (error) {
    console.error('Clean old data error:', error);
  }
}

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
      clear: '晴朗', mostlyClear: '大部分晴朗', partlyCloudy: '局部多云', cloudy: '多云',
      foggy: '有雾', lightRain: '小雨', moderateRain: '中雨', heavyRain: '大雨',
      lightSnow: '小雪', moderateSnow: '中雪', heavySnow: '大雪', rainShower: '阵雨',
      thunderstorm: '雷暴', unavailable: '天气服务暂时不可用', updating: '天气数据更新中'
    },
    ui: {
      enableLocation: '📍 启用位置服务查看您所在城市的实时天气',
      allowLocation: '🌐 允许获取位置', gettingLocation: '⏳ 获取中...', relocate: '🌐 重新定位',
      locationUpdated: '✅ 位置已更新，天气数据已刷新', locationFailed: '❌ 位置更新失败，请重试',
      locationDenied: '用户拒绝了位置请求', locationUnavailable: '位置信息不可用',
      locationTimeout: '请求超时', locationUnknown: '未知错误',
      usingDefault: '📍 使用默认位置', updateLocation: '更新位置',
      located: '✅ 已定位', precise: '✅ 已定位 (精确)',
      searchPlaceholder: '搜索... (Enter 键搜索)', locationStatus: '📍 位置状态', switchLanguage: '切换语言',
      login: '登录', register: '注册', username: '用户名', password: '密码', email: '邮箱',
      displayName: '显示名称', welcome: '欢迎', guest: '访客', logout: '退出登录'
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
    links: { google: 'Google', github: 'GitHub', hackerNews: 'Hacker News', reddit: 'Reddit' },
    shortcuts: { search: '⌨️  Ctrl+K / Cmd+K 快速搜索' },
    locationUnknown: '未知位置'
  },
  en: {
    name: 'English',
    weather: {
      clear: 'Clear', mostlyClear: 'Mostly Clear', partlyCloudy: 'Partly Cloudy', cloudy: 'Cloudy',
      foggy: 'Foggy', lightRain: 'Light Rain', moderateRain: 'Moderate Rain', heavyRain: 'Heavy Rain',
      lightSnow: 'Light Snow', moderateSnow: 'Moderate Snow', heavySnow: 'Heavy Snow',
      rainShower: 'Rain Shower', thunderstorm: 'Thunderstorm',
      unavailable: 'Weather service temporarily unavailable', updating: 'Weather data updating'
    },
    ui: {
      enableLocation: '📍 Enable location to see weather in your city',
      allowLocation: '🌐 Allow Location', gettingLocation: '⏳ Getting location...', relocate: '🌐 Relocate',
      locationUpdated: '✅ Location updated, weather data refreshed', locationFailed: '❌ Location update failed, please retry',
      locationDenied: 'User denied location request', locationUnavailable: 'Location information unavailable',
      locationTimeout: 'Request timeout', locationUnknown: 'Unknown error',
      usingDefault: '📍 Using default location', updateLocation: 'Update location',
      located: '✅ Located', precise: '✅ Located (Precise)',
      searchPlaceholder: 'Search... (Press Enter)', locationStatus: '📍 Location Status', switchLanguage: 'Switch Language',
      login: 'Login', register: 'Register', username: 'Username', password: 'Password', email: 'Email',
      displayName: 'Display Name', welcome: 'Welcome', guest: 'Guest', logout: 'Logout'
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
    links: { google: 'Google', github: 'GitHub', hackerNews: 'Hacker News', reddit: 'Reddit' },
    shortcuts: { search: '⌨️  Ctrl+K / Cmd+K Quick Search' },
    locationUnknown: 'Unknown Location'
  },
  ja: {
    name: '日本語',
    weather: {
      clear: '晴れ', mostlyClear: 'ほぼ晴れ', partlyCloudy: '一部曇り', cloudy: '曇り',
      foggy: '霧', lightRain: '小雨', moderateRain: '中雨', heavyRain: '大雨',
      lightSnow: '小雪', moderateSnow: '中雪', heavySnow: '大雪', rainShower: 'にわか雨',
      thunderstorm: '雷雨', unavailable: '天気サービスが一時的に利用できません', updating: '天気データを更新中'
    },
    ui: {
      enableLocation: '📍 位置情報を有効にして、あなたの都市の天気を確認する',
      allowLocation: '🌐 位置情報を許可', gettingLocation: '⏳ 取得中...', relocate: '🌐 再取得',
      locationUpdated: '✅ 位置が更新され、天気データが更新されました', locationFailed: '❌ 位置の更新に失敗しました。再試行してください',
      locationDenied: 'ユーザーが位置情報リクエストを拒否しました', locationUnavailable: '位置情報が利用できません',
      locationTimeout: 'リクエストがタイムアウトしました', locationUnknown: '不明なエラー',
      usingDefault: '📍 デフォルトの位置を使用', updateLocation: '位置を更新',
      located: '✅ 位置情報を取得済み', precise: '✅ 位置情報を取得済み (精密)',
      searchPlaceholder: '検索... (Enter キーで検索)', locationStatus: '📍 位置情報の状態', switchLanguage: '言語切り替え',
      login: 'ログイン', register: '登録', username: 'ユーザー名', password: 'パスワード', email: 'メール',
      displayName: '表示名', welcome: 'ようこそ', guest: 'ゲスト', logout: 'ログアウト'
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
    links: { google: 'Google', github: 'GitHub', hackerNews: 'Hacker News', reddit: 'Reddit' },
    shortcuts: { search: '⌨️  Ctrl+K / Cmd+K クイック検索' },
    locationUnknown: '不明な場所'
  },
  ko: {
    name: '한국어',
    weather: {
      clear: '맑음', mostlyClear: '대부분 맑음', partlyCloudy: '부분적으로 흐림', cloudy: '흐림',
      foggy: '안개', lightRain: '약한 비', moderateRain: '중간 비', heavyRain: '강한 비',
      lightSnow: '약한 눈', moderateSnow: '중간 눈', heavySnow: '강한 눈', rainShower: '소나기',
      thunderstorm: '뇌우', unavailable: '날씨 서비스를 일시적으로 사용할 수 없음', updating: '날씨 데이터 업데이트 중'
    },
    ui: {
      enableLocation: '📍 위치 서비스를 활성화하여 해당 도시의 날씨 확인',
      allowLocation: '🌐 위치 허용', gettingLocation: '⏳ 가져오는 중...', relocate: '🌐 위치 재설정',
      locationUpdated: '✅ 위치가 업데이트되었으며 날씨 데이터가 새로 고침되었습니다', locationFailed: '❌ 위치 업데이트 실패, 다시 시도하세요',
      locationDenied: '사용자가 위치 요청을 거부했습니다', locationUnavailable: '위치 정보를 사용할 수 없음',
      locationTimeout: '요청 시간 초과', locationUnknown: '알 수 없는 오류',
      usingDefault: '📍 기본 위치 사용', updateLocation: '위치 업데이트',
      located: '✅ 위치 확인됨', precise: '✅ 위치 확인됨 (정밀)',
      searchPlaceholder: '검색... (Enter 키로 검색)', locationStatus: '📍 위치 상태', switchLanguage: '언어 전환',
      login: '로그인', register: '등록', username: '사용자명', password: '비밀번호', email: '이메일',
      displayName: '표시 이름', welcome: '환영합니다', guest: '게스트', logout: '로그아웃'
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
    links: { google: 'Google', github: 'GitHub', hackerNews: 'Hacker News', reddit: 'Reddit' },
    shortcuts: { search: '⌨️  Ctrl+K / Cmd+K 빠른 검색' },
    locationUnknown: '알 수 없는 위치'
  }
};

// ======================================================
// DATA MODULES
// ======================================================
function getIP(request) {
  const cf = request.cf || {};
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown";
  return { ip: ip, city: cf.city || "", country: cf.country || "", region: cf.region || "", isBot: request.headers.get("user-agent")?.toLowerCase().includes("bot") || false };
}

function getWeatherDescription(code, lang = 'en') {
  const t = i18n[lang] || i18n.en;
  const descriptions = {
    0: t.weather.clear, 1: t.weather.mostlyClear, 2: t.weather.partlyCloudy, 3: t.weather.cloudy,
    45: t.weather.foggy, 48: t.weather.foggy,
    51: t.weather.lightRain, 53: t.weather.moderateRain, 55: t.weather.heavyRain,
    61: t.weather.lightRain, 63: t.weather.moderateRain, 65: t.weather.heavyRain,
    71: t.weather.lightSnow, 73: t.weather.moderateSnow, 75: t.weather.heavySnow,
    80: t.weather.rainShower, 81: t.weather.rainShower, 82: t.weather.rainShower,
    95: t.weather.thunderstorm, 96: t.weather.thunderstorm, 99: t.weather.thunderstorm
  };
  return descriptions[code] || t.weather.updating;
}

async function getWeatherByCoords(lat, lon, lang = 'en', env = null) {
  const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}:${lang}`;
  if (env?.KV_HOMEPAGE) {
    try {
      const cached = await env.KV_HOMEPAGE.get(cacheKey, "json");
      if (cached && cached.temp) return cached;
    } catch (_) {}
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json', 'User-Agent': 'Cloudflare-Worker/1.0' } });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    if (!data.current_weather) throw new Error('Invalid weather data structure');
    const w = data.current_weather;
    const locationName = await getLocationName(lat, lon, lang);
    const result = {
      temp: Math.round(w.temperature) + "°C",
      desc: getWeatherDescription(w.weathercode, lang),
      icon: getWeatherIcon(w.weathercode, w.temperature),
      windspeed: w.windspeed || 0,
      weathercode: w.weathercode,
      lat: lat, lon: lon,
      location: locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      isDefault: false
    };
    if (env?.KV_HOMEPAGE) {
      try { await env.KV_HOMEPAGE.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 }); } catch (_) {}
    }
    return result;
  } catch (e) {
    console.error('Weather fetch failed:', e.message);
    const t = i18n[lang] || i18n.en;
    return { temp: "--", desc: t.weather.unavailable, icon: "⛅", windspeed: 0, weathercode: -1, lat: lat, lon: lon, location: "Unknown Location", isDefault: false };
  }
}

async function getLocationName(lat, lon, lang = 'en') {
  try {
    const languageMap = { 'zh': 'zh', 'en': 'en', 'ja': 'ja', 'ko': 'ko' };
    const language = languageMap[lang] || 'en';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=${language}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
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
  const icons = { 0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "⛈️", 71: "🌨️", 73: "🌨️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "⛈️" };
  return icons[code] || "🌤️";
}

function getQuote(lang) {
  const t = i18n[lang] || i18n.en;
  const quotes = t.quotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getDate(lang) {
  const t = i18n[lang] || i18n.en;
  const d = new Date();
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US', t.dateFormat);
}

// ======================================================
// HTML RENDERER (主页 - 增强版)
// ======================================================
function renderHTML({ ip, weather, quote, date, lang, theme, hasUserLocation, isAuthenticated, user }) {
  const t = i18n[lang] || i18n.en;
  
  const escapedIP = escapeHtml(ip.ip);
  const escapedCity = escapeHtml(ip.city);
  const escapedCountry = escapeHtml(ip.country);
  const escapedQuote = escapeHtml(quote.text);
  const escapedAuthor = escapeHtml(quote.author);
  const escapedLocation = escapeHtml(weather.location || t.locationUnknown || 'Unknown Location');
  
  const usingDefault = !hasUserLocation || weather.isDefault;
  const usingDefaultStr = usingDefault ? 'true' : 'false';
  
  const themeStyles = {
    dark: '',
    light: '',
    ocean: '--bg-color:#0a1628;--text-color:#e8f4f8;--card-bg:rgba(10,40,80,0.3);--card-border:rgba(30,144,255,0.2);--gradient-text:linear-gradient(135deg,#4fc3f7 0%,#0288d1 100%);',
    forest: '--bg-color:#0a1a0a;--text-color:#e8f5e9;--card-bg:rgba(27,94,32,0.3);--card-border:rgba(76,175,80,0.2);--gradient-text:linear-gradient(135deg,#81c784 0%,#2e7d32 100%);',
    sunset: '--bg-color:#1a0a0a;--text-color:#fff3e0;--card-bg:rgba(180,60,30,0.3);--card-border:rgba(255,152,0,0.2);--gradient-text:linear-gradient(135deg,#ffb74d 0%,#e65100 100%);',
    neon: '--bg-color:#0a0a1a;--text-color:#f0f0ff;--card-bg:rgba(156,39,176,0.2);--card-border:rgba(0,255,255,0.2);--gradient-text:linear-gradient(135deg,#00ffff 0%,#ff00ff 100%);'
  };
  
  const themeStyle = themeStyles[theme] || themeStyles.dark;
  
  const themeColors = {
    dark: { bg: '#0b0d14', text: '#fff', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.05)' },
    light: { bg: '#f0f2f5', text: '#1a1a2e', card: 'rgba(255,255,255,0.8)', border: 'rgba(0,0,0,0.08)' },
    ocean: { bg: '#0a1628', text: '#e8f4f8', card: 'rgba(10,40,80,0.3)', border: 'rgba(30,144,255,0.2)' },
    forest: { bg: '#0a1a0a', text: '#e8f5e9', card: 'rgba(27,94,32,0.3)', border: 'rgba(76,175,80,0.2)' },
    sunset: { bg: '#1a0a0a', text: '#fff3e0', card: 'rgba(180,60,30,0.3)', border: 'rgba(255,152,0,0.2)' },
    neon: { bg: '#0a0a1a', text: '#f0f0ff', card: 'rgba(156,39,176,0.2)', border: 'rgba(0,255,255,0.2)' }
  };
  
  const colors = themeColors[theme] || themeColors.dark;
  
  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  const userDisplayName = isAuthenticated && user ? escapeHtml(user.display_name || user.username) : t.ui.guest;
  const userAvatar = isAuthenticated && user ? (user.avatar_url || '👤') : '👤';
  
  return `
<!DOCTYPE html>
<html lang="${lang}" data-theme="${theme}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="description" content="Personalized Edge Dashboard"/>
<title>Edge Home</title>
<style>
:root{
  --bg-color:${colors.bg};
  --text-color:${colors.text};
  --card-bg:${colors.card};
  --card-border:${colors.border};
  --input-bg:rgba(255,255,255,0.06);
  --input-border:rgba(255,255,255,0.08);
  --link-color:rgba(255,255,255,0.4);
  --link-hover:#fff;
  --text-secondary:rgba(255,255,255,0.5);
  --text-muted:rgba(255,255,255,0.3);
  --gradient-text:linear-gradient(135deg,#fff 0%,#8899bb 100%);
  ${themeStyle}
}
[data-theme="light"]{
  --bg-color:#f0f2f5;
  --text-color:#1a1a2e;
  --card-bg:rgba(255,255,255,0.8);
  --card-border:rgba(0,0,0,0.08);
  --input-bg:rgba(255,255,255,0.9);
  --input-border:rgba(0,0,0,0.12);
  --link-color:rgba(0,0,0,0.45);
  --link-hover:#1a1a2e;
  --text-secondary:rgba(0,0,0,0.5);
  --text-muted:rgba(0,0,0,0.35);
  --gradient-text:linear-gradient(135deg,#1a1a2e 0%,#4a6fa5 100%);
}
[data-theme="ocean"]{
  --bg-color:#0a1628;
  --text-color:#e8f4f8;
  --card-bg:rgba(10,40,80,0.3);
  --card-border:rgba(30,144,255,0.2);
  --gradient-text:linear-gradient(135deg,#4fc3f7 0%,#0288d1 100%);
  --link-color:rgba(79,195,247,0.5);
  --link-hover:#4fc3f7;
  --text-secondary:rgba(232,244,248,0.5);
  --text-muted:rgba(232,244,248,0.3);
}
[data-theme="forest"]{
  --bg-color:#0a1a0a;
  --text-color:#e8f5e9;
  --card-bg:rgba(27,94,32,0.3);
  --card-border:rgba(76,175,80,0.2);
  --gradient-text:linear-gradient(135deg,#81c784 0%,#2e7d32 100%);
  --link-color:rgba(129,199,132,0.5);
  --link-hover:#81c784;
  --text-secondary:rgba(232,245,233,0.5);
  --text-muted:rgba(232,245,233,0.3);
}
[data-theme="sunset"]{
  --bg-color:#1a0a0a;
  --text-color:#fff3e0;
  --card-bg:rgba(180,60,30,0.3);
  --card-border:rgba(255,152,0,0.2);
  --gradient-text:linear-gradient(135deg,#ffb74d 0%,#e65100 100%);
  --link-color:rgba(255,183,77,0.5);
  --link-hover:#ffb74d;
  --text-secondary:rgba(255,243,224,0.5);
  --text-muted:rgba(255,243,224,0.3);
}
[data-theme="neon"]{
  --bg-color:#0a0a1a;
  --text-color:#f0f0ff;
  --card-bg:rgba(156,39,176,0.2);
  --card-border:rgba(0,255,255,0.2);
  --gradient-text:linear-gradient(135deg,#00ffff 0%,#ff00ff 100%);
  --link-color:rgba(0,255,255,0.5);
  --link-hover:#00ffff;
  --text-secondary:rgba(240,240,255,0.5);
  --text-muted:rgba(240,240,255,0.3);
}

*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg-color);color:var(--text-color);min-height:100vh;display:flex;justify-content:center;align-items:center;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;transition:background .5s,color .5s}
.bg{position:fixed;inset:0;background:radial-gradient(circle at 20% 30%, var(--bg-gradient-1, #1a2233), transparent 60%),radial-gradient(circle at 80% 20%, var(--bg-gradient-2, #151a2a), transparent 60%),radial-gradient(circle at 50% 80%, var(--bg-gradient-3, #0f1420), transparent 50%),var(--bg-color);z-index:-1;transition:background .5s}
[data-theme="light"] .bg{--bg-gradient-1:#d1d9e6;--bg-gradient-2:#c1c9d6;--bg-gradient-3:#b1b9c6}
[data-theme="ocean"] .bg{--bg-gradient-1:#0a2a4a;--bg-gradient-2:#0a1a3a;--bg-gradient-3:#0a0a2a}
[data-theme="forest"] .bg{--bg-gradient-1:#0a2a0a;--bg-gradient-2:#0a1a0a;--bg-gradient-3:#0a0a0a}
[data-theme="sunset"] .bg{--bg-gradient-1:#2a0a0a;--bg-gradient-2:#1a0a0a;--bg-gradient-3:#0a0a0a}
[data-theme="neon"] .bg{--bg-gradient-1:#0a0a2a;--bg-gradient-2:#0a0a1a;--bg-gradient-3:#0a0a0a}
.bg::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");opacity:0.5;pointer-events:none}
.container{width:100%;max-width:1000px;padding:40px;animation:fadeIn .6s ease-out;position:relative;z-index:1}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;animation:slideUp .6s ease-out}
.time-section{position:relative}
.time{font-size:72px;font-weight:700;letter-spacing:-2px;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;transition:all .5s}
.time-seconds{font-size:24px;opacity:0.4;margin-left:8px;-webkit-text-fill-color:var(--text-secondary)}
.date{margin-top:8px;opacity:.5;font-size:16px;letter-spacing:1px}
.weather-card{text-align:right;background:var(--card-bg);padding:12px 20px;border-radius:16px;backdrop-filter:blur(10px);border:1px solid var(--card-border);min-width:120px;position:relative;transition:all .3s}
.weather-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,0.2)}
.weather-location{font-size:12px;opacity:0.5;margin-bottom:4px;font-weight:300}
.weather-temp{font-size:28px;font-weight:600}
.weather-icon{font-size:32px;margin-right:4px;display:inline-block;transition:transform .3s}
.weather-icon:hover{transform:scale(1.2) rotate(10deg)}
.weather-desc{font-size:13px;opacity:.6;margin-top:4px}
.weather-wind{font-size:12px;opacity:.4;margin-top:2px}
.location-status{font-size:11px;opacity:0.4;margin-top:4px;cursor:help}
.location-status .update-link{color:var(--text-secondary);text-decoration:underline;cursor:pointer}
.location-status .update-link:hover{color:var(--link-hover)}
.search{width:100%;margin:30px 0 20px;animation:slideUp .6s ease-out .1s both}
.search input{width:100%;padding:18px 24px;border-radius:999px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:16px;outline:none;transition:all .3s ease;backdrop-filter:blur(10px)}
.search input::placeholder{color:var(--text-muted)}
.search input:focus{transform:translateY(-2px);border-color:var(--link-hover);box-shadow:0 4px 20px rgba(0,0,0,.15)}
.search input:hover{background:var(--card-bg);border-color:var(--link-color)}
.search-history{margin-top:8px;display:none}
.search-history.show{display:block;animation:slideUp .3s ease-out}
.search-history-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;padding:0 2px}
.search-history-header span{font-size:11px;color:var(--text-muted)}
.search-history-header button{background:none;border:none;color:rgba(255,255,255,.3);font-size:11px;cursor:pointer;padding:2px 6px;border-radius:4px;transition:all .2s}
.search-history-header button:hover{color:#ff6b6b;background:rgba(255,107,107,.1)}
.search-history-item{display:block;width:100%;padding:8px 12px;border:none;background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-size:14px;text-align:left;cursor:pointer;border-radius:6px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:all .2s}
.search-history-item:hover{background:rgba(255,255,255,.1);color:#fff;transform:translateX(4px)}
.quick-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}
.quick-links a{color:var(--link-color);text-decoration:none;font-size:13px;transition:all .2s;padding:6px 12px;border-radius:20px;background:rgba(255,255,255,.03)}
.quick-links a:hover{color:var(--link-hover);background:var(--card-bg);transform:translateY(-2px)}
.quote{margin-top:50px;padding:20px 0;border-top:1px solid var(--card-border);opacity:.7;font-size:16px;line-height:1.8;transition:opacity .3s;animation:slideUp .6s ease-out .2s both}
.quote:hover{opacity:.9}
.theme-toggle{position:fixed;top:20px;right:70px;width:40px;height:40px;border-radius:50%;border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-secondary);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);z-index:100;transition:all .3s}
.theme-toggle:hover{color:var(--link-hover);border-color:var(--link-hover);transform:rotate(180deg)}
.quote-text{font-style:italic;letter-spacing:0.5px}
.quote-author{display:block;margin-top:8px;opacity:.5;font-size:14px;font-style:normal}
.footer{margin-top:60px;color:var(--text-muted);font-size:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding-top:20px;border-top:1px solid var(--card-border);animation:slideUp .6s ease-out .3s both}
.footer span{display:inline-block;transition:all .3s}
.footer span:hover{color:var(--text-secondary)}
.location-prompt{display:${usingDefault ? 'block' : 'none'};background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:16px 20px;margin-bottom:20px;text-align:center;backdrop-filter:blur(10px);animation:slideUp .6s ease-out}
.location-prompt p{opacity:0.7;font-size:14px;margin-bottom:12px}
.location-prompt button{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:var(--text-color);padding:8px 24px;border-radius:20px;cursor:pointer;font-size:14px;transition:all .3s}
.location-prompt button:hover{background:rgba(255,255,255,.2);transform:translateY(-1px)}
.location-prompt button:disabled{opacity:0.4;cursor:not-allowed}
.notification{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--card-bg);backdrop-filter:blur(10px);border:1px solid var(--card-border);padding:12px 24px;border-radius:12px;color:var(--text-color);font-size:14px;z-index:1000;animation:fadeIn .3s ease-out;max-width:90%;text-align:center}
.user-section{display:flex;align-items:center;gap:12px;position:fixed;top:20px;right:140px;z-index:100;background:var(--card-bg);backdrop-filter:blur(10px);border:1px solid var(--card-border);border-radius:20px;padding:6px 16px 6px 12px;transition:all .3s}
.user-section:hover{background:var(--card-bg);border-color:var(--link-color)}
.user-avatar{font-size:20px;line-height:1}
.user-name{font-size:13px;color:var(--text-secondary);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.user-btn{background:none;border:none;color:var(--text-muted);font-size:12px;cursor:pointer;padding:2px 8px;border-radius:4px;transition:all .2s}
.user-btn:hover{color:var(--link-hover);background:rgba(255,255,255,0.1)}
.language-selector{position:fixed;top:20px;right:20px;z-index:100;background:var(--card-bg);backdrop-filter:blur(10px);border:1px solid var(--card-border);border-radius:8px;padding:4px;transition:all .3s}
.language-selector select{background:transparent;color:var(--text-color);border:none;padding:8px 12px;font-size:13px;cursor:pointer;outline:none;border-radius:6px;min-width:100px}
.language-selector select:hover{background:rgba(255,255,255,0.1)}
.language-selector select option{background:#1a2233;color:#fff}
.theme-selector{position:fixed;top:70px;right:20px;z-index:100;background:var(--card-bg);backdrop-filter:blur(10px);border:1px solid var(--card-border);border-radius:8px;padding:4px}
.theme-selector select{background:transparent;color:var(--text-color);border:none;padding:8px 12px;font-size:12px;cursor:pointer;outline:none;border-radius:6px;min-width:100px}
.theme-selector select:hover{background:rgba(255,255,255,0.1)}
.theme-selector select option{background:#1a2233;color:#fff}
@media(max-width:640px){.container{padding:20px}.time{font-size:48px;letter-spacing:-1px}.time-seconds{font-size:18px}.top{flex-direction:column;gap:20px}.weather-card{text-align:left;width:100%;padding:12px 16px}.weather-temp{font-size:24px}.search input{padding:14px 20px;font-size:15px}.quote{font-size:14px;margin-top:30px}.footer{flex-direction:column;gap:4px;font-size:11px}.location-prompt{padding:12px 16px}.language-selector{top:10px;right:10px;padding:2px}.language-selector select{font-size:12px;padding:4px 8px;min-width:80px}.theme-selector{top:60px;right:10px}.theme-selector select{font-size:11px;padding:4px 8px;min-width:70px}.theme-toggle{top:10px;right:60px;width:32px;height:32px;font-size:14px}.user-section{top:10px;right:110px;padding:4px 12px 4px 8px}.user-name{font-size:11px;max-width:60px}}
</style>
</head>
<body>
  <button class="theme-toggle" id="themeToggle" title="切换主题">◐</button>
  
  <div class="user-section" id="userSection">
    <span class="user-avatar">${userAvatar}</span>
    <span class="user-name" id="userName">${userDisplayName}</span>
    ${isAuthenticated ? `<button class="user-btn" onclick="handleLogout()">${t.ui.logout}</button>` : `<button class="user-btn" onclick="showLoginModal()">${t.ui.login}</button>`}
  </div>
  
  <div class="bg"></div>
  <div class="language-selector">
    <select id="languageSelect" onchange="changeLanguage(this.value)">
      ${languages.map(l => `<option value="${l.code}" ${lang === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}
    </select>
  </div>
  <div class="theme-selector">
    <select id="themeSelect" onchange="changeTheme(this.value)">
      <option value="dark" ${theme === 'dark' ? 'selected' : ''}>🌙 Dark</option>
      <option value="light" ${theme === 'light' ? 'selected' : ''}>☀️ Light</option>
      <option value="ocean" ${theme === 'ocean' ? 'selected' : ''}>🌊 Ocean</option>
      <option value="forest" ${theme === 'forest' ? 'selected' : ''}>🌲 Forest</option>
      <option value="sunset" ${theme === 'sunset' ? 'selected' : ''}>🌅 Sunset</option>
      <option value="neon" ${theme === 'neon' ? 'selected' : ''}>💜 Neon</option>
    </select>
  </div>
  
  <div class="container">
    <div class="location-prompt" id="locationPrompt">
      <p>${t.ui.enableLocation}</p>
      <button id="enableLocation" onclick="requestLocation()">${t.ui.allowLocation}</button>
    </div>
    <div class="top">
      <div class="time-section">
        <div class="time"><span id="clockDisplay">--:--</span><span class="time-seconds" id="secondsDisplay">00</span></div>
        <div class="date" id="dateDisplay">${date}</div>
      </div>
      <div class="weather-card">
        <div class="weather-location">📍 ${escapedLocation}</div>
        <div><span class="weather-icon">${weather.icon}</span><span class="weather-temp">${weather.temp}</span></div>
        <div class="weather-desc">${weather.desc}</div>
        ${weather.windspeed > 0 ? `<div class="weather-wind">💨 ${Math.round(weather.windspeed)} km/h</div>` : ''}
        <div class="location-status" id="locationStatus">${usingDefault ? `${t.ui.usingDefault} · <span class="update-link" onclick="requestLocation()">${t.ui.updateLocation}</span>` : `${t.ui.located}`}</div>
      </div>
    </div>
    <div class="search">
      <input id="search" type="text" placeholder="${t.ui.searchPlaceholder}" autofocus aria-label="${t.ui.searchPlaceholder}"/>
      <div id="searchHistory" class="search-history"><div class="search-history-header"><span>最近搜索</span><button id="clearHistory">清除</button></div></div>
      <div class="quick-links">
        <a href="https://www.google.com" target="_blank">${t.links.google}</a>
        <a href="https://github.com" target="_blank">${t.links.github}</a>
        <a href="https://news.ycombinator.com" target="_blank">${t.links.hackerNews}</a>
        <a href="https://www.reddit.com" target="_blank">${t.links.reddit}</a>
      </div>
    </div>
    <div class="quote"><span class="quote-text">“${escapedQuote}”</span><span class="quote-author">- ${escapedAuthor}</span></div>
    <div class="footer">
      <span>📍 ${escapedIP}</span>
      <span>${escapedCity} ${escapedCountry}</span>
      <span id="visitCounter" style="cursor:default;"></span>
      <span>⚡ Cloudflare Edge</span>
    </div>
  </div>
  
  <!-- 登录/注册模态框 -->
  <div id="authModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);z-index:1000;display:none;justify-content:center;align-items:center;">
    <div style="background:var(--bg-color);border:1px solid var(--card-border);border-radius:20px;padding:40px;max-width:420px;width:90%;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h2 id="authModalTitle" style="font-size:24px;font-weight:700;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${t.ui.login}</h2>
        <button onclick="closeAuthModal()" style="background:none;border:none;color:var(--text-muted);font-size:24px;cursor:pointer;">×</button>
      </div>
      <div id="authForm">
        <div class="form-group" style="margin-bottom:16px;">
          <label style="color:var(--text-secondary);font-size:13px;">${t.ui.username}</label>
          <input id="authUsername" type="text" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:16px;outline:none;"/>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label style="color:var(--text-secondary);font-size:13px;">${t.ui.password}</label>
          <input id="authPassword" type="password" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:16px;outline:none;"/>
        </div>
        <div id="authEmailGroup" class="form-group" style="margin-bottom:16px;display:none;">
          <label style="color:var(--text-secondary);font-size:13px;">${t.ui.email}</label>
          <input id="authEmail" type="email" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:16px;outline:none;"/>
        </div>
        <div id="authDisplayNameGroup" class="form-group" style="margin-bottom:16px;display:none;">
          <label style="color:var(--text-secondary);font-size:13px;">${t.ui.displayName}</label>
          <input id="authDisplayName" type="text" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:16px;outline:none;"/>
        </div>
        <button id="authSubmitBtn" onclick="handleAuth()" style="width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#4a6fa5,#8899bb);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s;">${t.ui.login}</button>
        <p id="authSwitchText" style="margin-top:16px;text-align:center;color:var(--text-muted);font-size:13px;cursor:pointer;" onclick="toggleAuthMode()">${t.ui.register}</p>
        <div id="authError" style="color:#ef4444;font-size:13px;margin-top:12px;display:none;text-align:center;"></div>
      </div>
    </div>
  </div>
  
  <script>
    (function(){
      'use strict';
      var currentLang='${lang}';
      var isLoginMode=true;
      var isAuthenticated=${isAuthenticated};
      var currentUser=${isAuthenticated ? JSON.stringify(user) : 'null'};
      
      // =========================
      // 语言切换
      // =========================
      window.changeLanguage=function(lang){
        var select=document.getElementById('languageSelect');
        if(select)select.disabled=true;
        var msgs={zh:'⏳ 切换语言中...',en:'⏳ Switching language...',ja:'⏳ 言語を切り替え中...',ko:'⏳ 언어 전환 중...'};
        showNotification(msgs[lang]||msgs.en);
        fetch('/api/set-language',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:lang})})
        .then(function(response){if(!response.ok)throw new Error('Network response was not ok');return response.json();})
        .then(function(data){if(data.success){window.location.href=window.location.pathname+'?lang='+lang;}else{throw new Error('Language update failed');}})
        .catch(function(error){console.error('语言切换失败:',error);var errMsgs={zh:'❌ 语言切换失败，请重试',en:'❌ Language switch failed, please retry',ja:'❌ 言語の切り替えに失敗しました。再試行してください',ko:'❌ 언어 전환에 실패했습니다. 다시 시도하세요'};showNotification(errMsgs[lang]||errMsgs.en);if(select)select.disabled=false;});
      };
      
      // =========================
      // 主题切换
      // =========================
      window.changeTheme=function(theme){
        document.cookie='theme='+theme+'; path=/; max-age=31536000; samesite=lax; Secure';
        document.documentElement.setAttribute('data-theme',theme);
        var bg=document.querySelector('.bg');
        if(bg)bg.style.transition='background 0.5s';
        fetch('/api/theme',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({theme:theme})})
        .catch(function(error){console.error('Theme save error:',error);});
        var toggle=document.getElementById('themeToggle');
        if(toggle)toggle.textContent=theme==='light'?'◑':'◐';
      };
      
      // =========================
      // 位置请求
      // =========================
      window.requestLocation=function(){
        var button=document.getElementById('enableLocation');
        var t=getTranslations(currentLang);
        if(button){button.disabled=true;button.textContent=t.ui.gettingLocation;}
        if(!navigator.geolocation){alert(t.ui.locationUnavailable);if(button){button.disabled=false;button.textContent=t.ui.allowLocation;}return;}
        navigator.geolocation.getCurrentPosition(
          async function(position){
            var latitude=position.coords.latitude;
            var longitude=position.coords.longitude;
            try{
              var response=await fetch('/api/update-location',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lat:latitude,lon:longitude})});
              var data=await response.json();
              if(data.success){updateWeatherUI(data.weather);var prompt=document.getElementById('locationPrompt');if(prompt)prompt.style.display='none';var status=document.getElementById('locationStatus');if(status){status.innerHTML='✅ '+t.ui.precise;status.style.opacity='0.6';}showNotification(t.ui.locationUpdated);}else{throw new Error(data.error||t.ui.locationFailed);}
            }catch(error){console.error('位置更新失败:',error);showNotification(t.ui.locationFailed);}
            if(button){button.disabled=false;button.textContent=t.ui.relocate;}
          },
          function(error){
            console.error('定位失败:',error);
            var message='❌ '+t.ui.locationUnknown;
            switch(error.code){case 1:message='❌ '+t.ui.locationDenied;break;case 2:message='❌ '+t.ui.locationUnavailable;break;case 3:message='❌ '+t.ui.locationTimeout;break;}
            showNotification(message);
            if(button){button.disabled=false;button.textContent=t.ui.allowLocation;}
          },
          {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
        );
      };
      
      function getTranslations(lang){
        var translations={zh:{ui:{enableLocation:'📍 启用位置服务查看您所在城市的实时天气',allowLocation:'🌐 允许获取位置',gettingLocation:'⏳ 获取中...',relocate:'🌐 重新定位',locationUpdated:'✅ 位置已更新，天气数据已刷新',locationFailed:'❌ 位置更新失败，请重试',locationDenied:'用户拒绝了位置请求',locationUnavailable:'位置信息不可用',locationTimeout:'请求超时',locationUnknown:'未知错误',usingDefault:'📍 使用默认位置',updateLocation:'更新位置',located:'✅ 已定位',precise:'✅ 已定位 (精确)',searchPlaceholder:'搜索... (Enter 键搜索)',locationStatus:'📍 位置状态',login:'登录',register:'注册',logout:'退出登录'}},en:{ui:{enableLocation:'📍 Enable location to see weather in your city',allowLocation:'🌐 Allow Location',gettingLocation:'⏳ Getting location...',relocate:'🌐 Relocate',locationUpdated:'✅ Location updated, weather data refreshed',locationFailed:'❌ Location update failed, please retry',locationDenied:'User denied location request',locationUnavailable:'Location information unavailable',locationTimeout:'Request timeout',locationUnknown:'Unknown error',usingDefault:'📍 Using default location',updateLocation:'Update location',located:'✅ Located',precise:'✅ Located (Precise)',searchPlaceholder:'Search... (Press Enter)',locationStatus:'📍 Location Status',login:'Login',register:'Register',logout:'Logout'}},ja:{ui:{enableLocation:'📍 位置情報を有効にして、あなたの都市の天気を確認する',allowLocation:'🌐 位置情報を許可',gettingLocation:'⏳ 取得中...',relocate:'🌐 再取得',locationUpdated:'✅ 位置が更新され、天気データが更新されました',locationFailed:'❌ 位置の更新に失敗しました。再試行してください',locationDenied:'ユーザーが位置情報リクエストを拒否しました',locationUnavailable:'位置情報が利用できません',locationTimeout:'リクエストがタイムアウトしました',locationUnknown:'不明なエラー',usingDefault:'📍 デフォルトの位置を使用',updateLocation:'位置を更新',located:'✅ 位置情報を取得済み',precise:'✅ 位置情報を取得済み (精密)',searchPlaceholder:'検索... (Enter キーで検索)',locationStatus:'📍 位置情報の状態',login:'ログイン',register:'登録',logout:'ログアウト'}},ko:{ui:{enableLocation:'📍 위치 서비스를 활성화하여 해당 도시의 날씨 확인',allowLocation:'🌐 위치 허용',gettingLocation:'⏳ 가져오는 중...',relocate:'🌐 위치 재설정',locationUpdated:'✅ 위치가 업데이트되었으며 날씨 데이터가 새로 고침되었습니다',locationFailed:'❌ 위치 업데이트 실패, 다시 시도하세요',locationDenied:'사용자가 위치 요청을 거부했습니다',locationUnavailable:'위치 정보를 사용할 수 없음',locationTimeout:'요청 시간 초과',locationUnknown:'알 수 없는 오류',usingDefault:'📍 기본 위치 사용',updateLocation:'위치 업데이트',located:'✅ 위치 확인됨',precise:'✅ 위치 확인됨 (정밀)',searchPlaceholder:'검색... (Enter 키로 검색)',locationStatus:'📍 위치 상태',login:'로그인',register:'등록',logout:'로그아웃'}}};
        return translations[lang]||translations.en;
      }
      
      function updateWeatherUI(weather){
        var iconEl=document.querySelector('.weather-icon');
        var tempEl=document.querySelector('.weather-temp');
        var descEl=document.querySelector('.weather-desc');
        var locationEl=document.querySelector('.weather-location');
        var windEl=document.querySelector('.weather-wind');
        if(iconEl)iconEl.textContent=weather.icon;
        if(tempEl)tempEl.textContent=weather.temp;
        if(descEl)descEl.textContent=weather.desc;
        if(locationEl)locationEl.textContent='📍 '+(weather.location||'Unknown Location');
        if(windEl){if(weather.windspeed>0){windEl.textContent='💨 '+Math.round(weather.windspeed)+' km/h';windEl.style.display='block';}else{windEl.style.display='none';}}
      }
      
      function showNotification(message){
        var existing=document.querySelector('.notification');
        if(existing)existing.remove();
        var notification=document.createElement('div');
        notification.className='notification';
        notification.textContent=message;
        document.body.appendChild(notification);
        setTimeout(function(){notification.style.opacity='0';notification.style.transition='opacity 0.5s';setTimeout(function(){notification.remove();},500);},3000);
      }
      
      // =========================
      // 时钟
      // =========================
      function updateClock(){
        var clockEl=document.getElementById('clockDisplay');
        var secondsEl=document.getElementById('secondsDisplay');
        var dateEl=document.getElementById('dateDisplay');
        if(!clockEl)return;
        var d=new Date();
        var h=String(d.getHours()).padStart(2,'0');
        var m=String(d.getMinutes()).padStart(2,'0');
        var s=String(d.getSeconds()).padStart(2,'0');
        var timeString=h+':'+m;
        var currentTime=clockEl.textContent;
        if(currentTime!==timeString)clockEl.textContent=timeString;
        if(secondsEl)secondsEl.textContent=s;
        if(dateEl){var newDate=d.toLocaleDateString('${lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'ko' ? 'ko-KR' : 'en-US'}',{year:'numeric',month:'long',day:'numeric',weekday:'long'});if(dateEl.textContent!==newDate)dateEl.textContent=newDate;}
      }
      updateClock();
      setInterval(updateClock,1000);
      
      // =========================
      // 搜索
      // =========================
      var STORAGE_KEY='search_history';
      var MAX_HISTORY=10;
      function loadHistory(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch(_){return[];}}
      function saveHistory(query){var history=loadHistory();history=history.filter(function(item){return item!==query;});history.unshift(query);if(history.length>MAX_HISTORY)history=history.slice(0,MAX_HISTORY);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(history));}catch(_){}return history;}
      function renderHistory(history){var container=document.getElementById('searchHistory');if(!container)return;var header=container.querySelector('.search-history-header');container.innerHTML='';if(header)container.appendChild(header);if(history.length===0){container.classList.remove('show');return;}for(var i=0;i<history.length;i++){var btn=document.createElement('button');btn.className='search-history-item';btn.textContent=history[i];btn.addEventListener('click',function(){var q=encodeURIComponent(this.textContent);window.open('https://www.google.com/search?q='+q,'_blank');document.getElementById('search').value='';container.classList.remove('show');});container.appendChild(btn);}container.classList.add('show');}
      function doSearch(query){var q=encodeURIComponent(query);window.open('https://www.google.com/search?q='+q,'_blank');var history=saveHistory(query);renderHistory(history);}
      var searchInput=document.getElementById('search');
      if(searchInput){searchInput.addEventListener('keydown',function(e){var val=this.value.trim();if(e.key==='Enter'&&val){doSearch(val);this.value='';document.getElementById('searchHistory').classList.remove('show');}});searchInput.addEventListener('focus',function(){var history=loadHistory();if(history.length>0)renderHistory(history);});searchInput.addEventListener('blur',function(){setTimeout(function(){document.getElementById('searchHistory').classList.remove('show');},200);});if(document.activeElement===document.body){setTimeout(function(){searchInput.focus();},100);}}
      document.getElementById('clearHistory').addEventListener('click',function(){try{localStorage.removeItem(STORAGE_KEY);}catch(_){}document.getElementById('searchHistory').classList.remove('show');});
      
      // =========================
      // 键盘快捷键
      // =========================
      document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();var search=document.getElementById('search');if(search){search.focus();var history=loadHistory();if(history.length>0)renderHistory(history);}}if(e.key==='Escape'){var search=document.getElementById('search');if(search&&document.activeElement===search){search.value='';search.blur();document.getElementById('searchHistory').classList.remove('show');}}});
      
      // =========================
      // 主题
      // =========================
      var THEME_KEY='theme_preference';
      var themeToggle=document.getElementById('themeToggle');
      var html=document.documentElement;
      function setTheme(theme){html.setAttribute('data-theme',theme);localStorage.setItem(THEME_KEY,theme);document.cookie='theme='+theme+'; path=/; max-age=31536000; samesite=lax; Secure';themeToggle.textContent=theme==='light'?'◑':'◐';var select=document.getElementById('themeSelect');if(select)select.value=theme;}
      var savedTheme=localStorage.getItem(THEME_KEY)||html.getAttribute('data-theme');
      if(savedTheme&&['dark','light','ocean','forest','sunset','neon'].includes(savedTheme))setTheme(savedTheme);
      themeToggle.addEventListener('click',function(){var current=html.getAttribute('data-theme')||'dark';var themes=['dark','light','ocean','forest','sunset','neon'];var idx=themes.indexOf(current);var next=themes[(idx+1)%themes.length];setTheme(next);});
      
      // =========================
      // 位置状态
      // =========================
      var usingDefault=${usingDefaultStr};
      if(!usingDefault){var prompt=document.getElementById('locationPrompt');if(prompt)prompt.style.display='none';}
      if(window.location.search.includes('lang=')){var newUrl=window.location.pathname;var hash=window.location.hash;if(hash)newUrl+=hash;if(window.history&&window.history.replaceState)window.history.replaceState({},document.title,newUrl);}
      
      // =========================
      // 认证相关
      // =========================
      window.showLoginModal=function(){
        var modal=document.getElementById('authModal');
        modal.style.display='flex';
        document.getElementById('authUsername').focus();
      };
      
      window.closeAuthModal=function(){
        document.getElementById('authModal').style.display='none';
        document.getElementById('authError').style.display='none';
      };
      
      window.toggleAuthMode=function(){
        isLoginMode=!isLoginMode;
        var title=document.getElementById('authModalTitle');
        var btn=document.getElementById('authSubmitBtn');
        var switchText=document.getElementById('authSwitchText');
        var emailGroup=document.getElementById('authEmailGroup');
        var displayNameGroup=document.getElementById('authDisplayNameGroup');
        var t=getTranslations(currentLang);
        if(isLoginMode){
          title.textContent=t.ui.login;
          btn.textContent=t.ui.login;
          switchText.textContent=t.ui.register;
          emailGroup.style.display='none';
          displayNameGroup.style.display='none';
        }else{
          title.textContent=t.ui.register;
          btn.textContent=t.ui.register;
          switchText.textContent=t.ui.login;
          emailGroup.style.display='block';
          displayNameGroup.style.display='block';
        }
        document.getElementById('authError').style.display='none';
      };
      
      window.handleAuth=async function(){
        var username=document.getElementById('authUsername').value.trim();
        var password=document.getElementById('authPassword').value;
        var errorEl=document.getElementById('authError');
        var t=getTranslations(currentLang);
        
        if(!username||!password){
          errorEl.textContent='❌ '+(t.ui.username+' & '+t.ui.password+' required');
          errorEl.style.display='block';
          return;
        }
        
        var btn=document.getElementById('authSubmitBtn');
        btn.disabled=true;
        btn.textContent='⏳ ...';
        errorEl.style.display='none';
        
        try{
          var endpoint=isLoginMode?'/api/login':'/api/register';
          var body={username:username,password:password};
          if(!isLoginMode){
            body.email=document.getElementById('authEmail').value.trim();
            body.display_name=document.getElementById('authDisplayName').value.trim()||username;
          }
          
          var response=await fetch(endpoint,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(body)
          });
          
          var data=await response.json();
          if(data.success){
            showNotification(isLoginMode?'✅ '+(t.ui.welcome||'Welcome')+' '+username:'✅ '+(t.ui.register||'Registration')+' successful');
            window.location.reload();
          }else{
            errorEl.textContent='❌ '+(data.error||'Authentication failed');
            errorEl.style.display='block';
          }
        }catch(error){
          errorEl.textContent='❌ Network error, please try again';
          errorEl.style.display='block';
        }
        btn.disabled=false;
        btn.textContent=isLoginMode?t.ui.login:t.ui.register;
      };
      
      window.handleLogout=async function(){
        if(confirm('${lang === 'zh' ? '确定要退出登录吗？' : lang === 'en' ? 'Are you sure you want to logout?' : lang === 'ja' ? 'ログアウトしてもよろしいですか？' : '로그아웃하시겠습니까?'}')){
          try{
            await fetch('/api/logout',{method:'POST'});
            window.location.reload();
          }catch(error){
            console.error('Logout error:',error);
          }
        }
      };
      
      // =========================
      // 访问计数器
      // =========================
      fetch('/api/stats').then(function(res){return res.json();}).then(function(data){if(data&&typeof data.total_visits==='number'){document.getElementById('visitCounter').textContent='👁 '+data.total_visits;}}).catch(function(){document.getElementById('visitCounter').textContent='';});
      
      // =========================
      // 通知（每30秒检查）
      // =========================
      async function checkNotifications(){
        try{
          var response=await fetch('/api/notifications?limit=5');
          var data=await response.json();
          if(data.success&&data.unread_count>0){
            showNotification('🔔 '+data.unread_count+' '+(currentLang==='zh'?'条新通知':currentLang==='en'?'new notifications':currentLang==='ja'?'件の新着通知':'개의 새 알림'));
          }
        }catch(error){}
      }
      
      if(isAuthenticated){
        setTimeout(checkNotifications,5000);
        setInterval(checkNotifications,30000);
      }
      
      console.log('⚡ Edge Home loaded');
      console.log('🌐 Language: '+currentLang);
      console.log('👤 Authenticated: '+isAuthenticated);
      console.log('⌨️  Ctrl+K / Cmd+K Quick Search');
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
  var map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}
