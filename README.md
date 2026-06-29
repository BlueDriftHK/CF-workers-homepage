# ⚡ Edge Homepage

> 一个部署在 Cloudflare Workers 边缘节点的现代化、高性能个人导航与数据分析仪表板

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![D1](https://img.shields.io/badge/D1-Database-4A6FA5?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![KV](https://img.shields.io/badge/KV-Storage-4A6FA5?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/kv/)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Weather-FF6B35?style=flat-square)](https://open-meteo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/yourusername/edge-homepage/pulls)
[![Deployed on Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-F38020?style=flat-square&logo=cloudflare)](https://home.bjhr.space)

**实时天气 · 访客分析 · 多用户系统 · 6种主题 · 毫秒级响应 · 企业级安全防护**

**版本**: 2.0 | **许可证**: MIT | **最后更新**: 2026-06-29

---

## 📖 目录

- [✨ 功能特性](#-功能特性)
- [🎯 项目亮点](#-项目亮点)
- [🛠️ 技术栈](#️-技术栈)
- [🏗️ 系统架构](#️-系统架构)
- [📊 数据模型](#-数据模型)
- [🚀 快速开始](#-快速开始)
- [🗄️ 数据库配置](#️-数据库配置)
- [🔐 环境变量](#-环境变量)
- [📡 API 接口文档](#-api-接口文档)
- [🧪 命令行测试](#-命令行测试)
- [🎨 主题系统](#-主题系统)
- [🌍 多语言支持](#-多语言支持)
- [🚢 部署指南](#-部署指南)
- [📁 项目结构](#-项目结构)
- [📸 截图展示](#-截图展示)
- [🔧 本地开发](#-本地开发)
- [📋 更新日志](#-更新日志)
- [❓ 常见问题](#-常见问题)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

---

## ✨ 功能特性

### 🌐 核心功能

| 功能 | 说明 | 状态 |
|------|------|------|
| 🕐 **实时时钟** | 显示当前时间（含秒数），每秒自动更新，优雅的时间显示 | ✅ |
| 🌤️ **实时天气** | 基于 Open-Meteo API，支持多语言天气描述，自动缓存 | ✅ |
| 📍 **位置定位** | 浏览器 Geolocation API 定位，自动获取当地天气 | ✅ |
| 🔍 **智能搜索** | Google 搜索，带搜索历史记录（localStorage 持久化） | ✅ |
| ⌨️ **键盘快捷键** | `Ctrl+K` / `Cmd+K` 快速聚焦搜索，`Esc` 清空搜索 | ✅ |
| 💬 **每日名言** | 多语言名言轮播，每次刷新随机展示，支持中/英/日/韩 | ✅ |
| 🔗 **快速链接** | Google、GitHub、Hacker News、Reddit 一键访问 | ✅ |
| 📱 **响应式设计** | 完美适配桌面、平板、手机，流畅的触摸交互 | ✅ |

### 🎨 个性化系统

| 功能 | 说明 | 状态 |
|------|------|------|
| 🌍 **多语言支持** | 中文、English、日本語、한국어，自动检测浏览器语言 | ✅ |
| 🎨 **6种主题** | Dark、Light、Ocean、Forest、Sunset、Neon，一键切换 | ✅ |
| 👤 **用户系统** | 注册/登录/登出，7天会话管理，安全密码哈希 | ✅ |
| 🔔 **实时通知** | 系统通知和用户通知，30秒轮询检查，未读计数 | ✅ |
| 🖼️ **用户头像** | 支持 emoji 头像，可扩展为自定义上传 | ✅ |

### 📊 管理面板

| 功能 | 说明 | 状态 |
|------|------|------|
| 📈 **访问统计** | 总访问量、今日访问、日均访问、访问峰值，实时更新 | ✅ |
| 📊 **趋势图表** | 近30天访问趋势，带动画条形图，鼠标悬停显示详情 | ✅ |
| 👤 **访客画像** | 浏览器分布、操作系统分布、国家/地区分布，百分比展示 | ✅ |
| 🟢 **实时在线** | 显示当前在线人数，30秒自动更新，脉冲动画 | ✅ |
| 📋 **最近访客** | 显示IP、位置、浏览器、操作系统、访问页面、时间 | ✅ |
| 👥 **用户管理** | 查看注册用户列表，显示角色、状态、注册时间 | ✅ |
| 🗑️ **自动清理** | 自动清理7天前的访问日志，24小时检查一次 | ✅ |
| 🔐 **密码保护** | 管理面板独立密码保护，Cookie 持久化登录 | ✅ |

### 📈 访客分析增强

| 功能 | 说明 | 状态 |
|------|------|------|
| 📄 **页面浏览统计** | 记录并分析用户访问路径，热门页面排行 | ✅ |
| 🔗 **来源域名跟踪** | 识别访客来源网站，分析流量来源 | ✅ |
| 🔑 **会话跟踪** | 追踪用户完整访问会话，区分独立访客 | ✅ |
| 📱 **屏幕分辨率** | 记录设备屏幕信息，了解用户设备分布 | ✅ |
| ⏱️ **页面停留时间** | 分析用户 engagement，优化内容布局 | ✅ |
| 📊 **每小时分布** | 展示访问时段热度，了解用户活跃时间 | ✅ |

### 🛡️ 企业级安全

| 安全项 | 配置 | 说明 |
|--------|------|------|
| **CSP 策略** | 动态 nonce | 防止 XSS 和数据注入攻击 |
| **HSTS** | max-age=31536000 | 强制 HTTPS 连接，提升安全性 |
| **X-Frame-Options** | DENY | 防止点击劫持攻击 |
| **X-Content-Type-Options** | nosniff | 防止 MIME 类型混淆攻击 |
| **X-XSS-Protection** | 1; mode=block | 浏览器 XSS 过滤器增强 |
| **密码哈希** | SHA-256 + Salt | 安全存储用户密码，防止彩虹表攻击 |
| **Cookie 安全** | HttpOnly + Secure + SameSite | 防止 XSS 和 CSRF 攻击 |
| **会话管理** | 7天过期 + 自动续期 | 平衡安全与用户体验 |

---

## 🎯 项目亮点

- ⚡ **极致性能** - 运行在 Cloudflare 边缘网络，全球延迟 < 50ms，毫秒级响应
- 🔒 **隐私优先** - 所有数据存储在自己的 D1 数据库中，完全掌控，无第三方追踪
- 🌐 **全球加速** - Cloudflare CDN 自动加速静态资源，Anycast 网络智能路由
- 🎨 **现代设计** - 玻璃态毛玻璃效果，优雅动画过渡，沉浸式视觉体验
- 📱 **全端适配** - 桌面、平板、手机完美适配，触控优化
- 🔧 **零成本运营** - Cloudflare 免费额度足够个人使用（10万请求/天）
- 🚀 **一键部署** - 使用 Wrangler CLI 快速部署更新，CI/CD 友好
- 📊 **数据驱动** - 完整的访客分析系统，帮助了解用户行为
- 🌍 **国际化** - 4种语言支持，自动检测用户语言偏好
- 🎨 **高度可定制** - 6种主题 + 可扩展主题系统，满足个性化需求

---

## 🛠️ 技术栈

### 后端技术

| 技术 | 说明 | 官网 | 版本 |
|------|------|------|------|
| **Cloudflare Workers** | 无服务器边缘计算平台 | [链接](https://workers.cloudflare.com/) | 2024-01-01 API |
| **D1 Database** | Cloudflare 原生 SQLite 数据库 | [链接](https://developers.cloudflare.com/d1/) | 原生 |
| **KV Storage** | 键值存储（缓存天气数据） | [链接](https://developers.cloudflare.com/kv/) | 原生 |
| **Cache API** | Edge 页面缓存 | [链接](https://developers.cloudflare.com/workers/runtime-apis/cache/) | WHATWG |

### 第三方 API

| API | 说明 | 官网 | 限制 |
|-----|------|------|------|
| **Open-Meteo** | 免费天气和地理编码 API | [链接](https://open-meteo.com/) | 10000 请求/天 |

### 前端技术

| 技术 | 说明 |
|------|------|
| **原生 JavaScript** | 无框架依赖，轻量高效 |
| **CSS 变量** | 实现动态主题系统 |
| **CSS 动画** | 流畅的过渡和动画效果 |
| **Flexbox/Grid** | 响应式布局 |
| **Web API** | Geolocation、localStorage、fetch、Crypto |

### 浏览器兼容性

| 浏览器 | 最低版本 | WebSocket | Canvas | 状态 |
|--------|----------|-----------|--------|------|
| Chrome | 80+ | ✅ | ✅ | 完全支持 |
| Firefox | 75+ | ✅ | ✅ | 完全支持 |
| Safari | 13.1+ | ✅ | ✅ | 完全支持 |
| Edge | 80+ | ✅ | ✅ | 完全支持 |
| Opera | 67+ | ✅ | ✅ | 完全支持 |

---

## 🏗️ 系统架构

### 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              客户端                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────────┐ │
│  │   浏览器     │  │   curl      │  │   API 客户端                        │ │
│  │   (Chrome)  │  │   (CLI)     │  │   (Python/JS)                       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS / WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Cloudflare 边缘网络                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Cloudflare Worker                               │ │
│  │                                                                         │ │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐  │ │
│  │  │   认证中间件   │───▶│   路由分发    │───▶│     响应生成器         │  │ │
│  │  │  (JWT/会话)   │    │   (URL匹配)   │    │   (HTML/JSON/流)      │  │ │
│  │  └───────────────┘    └───────┬───────┘    └───────────┬───────────┘  │ │
│  │                              │                          │              │ │
│  │          ┌───────────────────┼──────────────────────────┘              │ │
│  │          │                   │                                         │ │
│  │          ▼                   ▼                                         │ │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐  │ │
│  │  │   主页渲染     │    │  API 端点     │    │     管理面板           │  │ │
│  │  │    (/)        │    │   处理器      │    │     (/admin)          │  │ │
│  │  │   + 主题      │    │  + 限流      │    │     + 密码验证         │  │ │
│  │  │   + 多语言    │    │  + 缓存      │    │     + 数据统计         │  │ │
│  │  └───────────────┘    └───────┬───────┘    └───────────────────────┘  │ │
│  │                              │                                         │ │
│  │          ┌───────────────────┼──────────────────────────────────┐      │ │
│  │          │                   │                                  │      │ │
│  │          ▼                   ▼                                  ▼      │ │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐  │ │
│  │  │  外部 API      │    │   D1 Database │    │   KV Storage          │  │ │
│  │  │  Open-Meteo   │    │   (SQLite)    │    │   (缓存)              │  │ │
│  │  │  (天气/地理)   │    │               │    │                       │  │ │
│  │  └───────────────┘    └───────────────┘    └───────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 数据流

1. **用户请求** → Worker 接收 HTTPS 请求
2. **认证检查** → 验证会话 Cookie，获取用户信息
3. **路由匹配** → 根据 URL 路径分发到对应处理器
4. **数据处理** → 查询 D1 数据库 / KV 缓存 / 调用外部 API
5. **响应生成** → 渲染 HTML 或返回 JSON
6. **缓存策略** → Edge Cache 缓存静态页面，KV 缓存天气数据
7. **响应返回** → 返回给用户，包含安全响应头

---

## 📊 数据模型

### 核心表结构

#### stats - 访问统计表
```sql
CREATE TABLE stats (
  id INTEGER PRIMARY KEY,
  total_visits INTEGER DEFAULT 0,
  last_visit DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### visit_logs - 访问日志表
```sql
CREATE TABLE visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_ip TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  language TEXT,
  referer TEXT,
  visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  os TEXT,
  browser TEXT,
  page_url TEXT,
  referrer_domain TEXT,
  session_id TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  time_on_page INTEGER DEFAULT 0
);
```

#### users - 用户表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  preferences TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

#### user_sessions - 用户会话表
```sql
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_token TEXT UNIQUE NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### notifications - 通知表
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT DEFAULT 'info',
  title TEXT,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### ER 关系图

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    users    │────▶│  user_sessions   │     │  notifications  │
│─────────────│     │──────────────────│     │─────────────────│
│ id          │     │ id               │     │ id              │
│ username    │     │ user_id (FK)     │     │ user_id (FK)    │
│ email       │     │ session_token    │     │ type            │
│ password_hash│     │ ip               │     │ title           │
│ display_name│     │ user_agent       │     │ content         │
│ avatar_url  │     │ created_at       │     │ is_read         │
│ role        │     │ expires_at       │     │ created_at      │
│ created_at  │     └──────────────────┘     └─────────────────┘
│ last_login  │
│ is_active   │     ┌──────────────────┐     ┌─────────────────┐
└─────────────┘     │    visit_logs    │     │  online_visitors│
                    │──────────────────│     │─────────────────│
                    │ id               │     │ id              │
                    │ visitor_ip       │     │ visitor_ip (UNI)│
                    │ user_agent       │     │ user_agent      │
                    │ country          │     │ last_active     │
                    │ city             │     │ session_id      │
                    │ language         │     └─────────────────┘
                    │ referer          │
                    │ visit_time       │     ┌─────────────────┐
                    │ os               │     │     stats       │
                    │ browser          │     │─────────────────│
                    │ page_url         │     │ id              │
                    │ referrer_domain  │     │ total_visits    │
                    │ session_id       │     │ last_visit      │
                    │ screen_width     │     └─────────────────┘
                    │ screen_height    │
                    │ time_on_page     │     ┌─────────────────┐
                    └──────────────────┘     │ system_notifications│
                                             │─────────────────│
                                             │ id              │
                                             │ type            │
                                             │ title           │
                                             │ content         │
                                             │ link            │
                                             │ priority        │
                                             │ is_active       │
                                             │ created_at      │
                                             └─────────────────┘
```

---

## 🚀 快速开始

### 前置条件

| 要求 | 版本 | 说明 |
|------|------|------|
| Node.js | v16 或更高 | 用于运行 Wrangler CLI |
| Wrangler CLI | 最新版本 | Cloudflare Workers 命令行工具 |
| Cloudflare 账号 | - | 需要开通 Workers 和 D1 |
| Git | - | 用于克隆项目 |

### 方式一：Wrangler CLI 部署（推荐）

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 克隆项目
git clone https://github.com/yourusername/edge-homepage.git
cd edge-homepage

# 4. 创建 D1 数据库
wrangler d1 create homepage-stats
# 保存返回的 database_id

# 5. 创建 KV 命名空间
wrangler kv:namespace create "HOMEPAGE_KV"
wrangler kv:namespace create "HOMEPAGE_KV" --preview
# 保存返回的 id 和 preview_id

# 6. 配置 wrangler.toml
# 填入 database_id、kv id 和 preview_id

# 7. 初始化数据库
# 在 D1 Studio 中执行 SQL（见下方）

# 8. 部署
wrangler deploy

# 9. （可选）绑定自定义域名
wrangler routes add https://your-domain.com
```

### 方式二：Cloudflare Dashboard 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **创建应用程序** > **创建 Worker**
3. 将 `src/index.js` 文件中的全部代码复制并粘贴到编辑器中
4. 点击 **保存并部署**
5. 在 **设置** > **变量** 中添加环境变量
6. 在 **绑定** 中添加 D1 数据库和 KV 命名空间绑定
7. 在 **触发器** 中绑定自定义域名（可选）

### 方式三：使用 Git 仓库直接部署

1. 在 Cloudflare Dashboard 中进入 **Workers & Pages**
2. 点击 **创建应用程序** > **Pages** > **连接到 Git**
3. 连接你的 GitHub 仓库
4. 设置框架预设为 **None**
5. 构建命令留空
6. 点击 **保存并部署**

---

## 🗄️ 数据库配置

### 初始化表结构

在 D1 Studio 中执行以下 SQL：

```sql
-- ======================================================
-- 1. 统计表
-- ======================================================
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY,
  total_visits INTEGER DEFAULT 0,
  last_visit DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO stats (id, total_visits) VALUES (1, 0);

-- ======================================================
-- 2. 访问日志表
-- ======================================================
CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_ip TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  language TEXT,
  referer TEXT,
  visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  os TEXT,
  browser TEXT,
  page_url TEXT,
  referrer_domain TEXT,
  session_id TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  time_on_page INTEGER DEFAULT 0
);

-- ======================================================
-- 3. 在线状态表
-- ======================================================
CREATE TABLE IF NOT EXISTS online_visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_ip TEXT UNIQUE,
  user_agent TEXT,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id TEXT
);

-- ======================================================
-- 4. 用户表
-- ======================================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  preferences TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);

-- ======================================================
-- 5. 用户会话表
-- ======================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_token TEXT UNIQUE NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- 6. 通知表
-- ======================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT DEFAULT 'info',
  title TEXT,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================
-- 7. 系统通知表
-- ======================================================
CREATE TABLE IF NOT EXISTS system_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT DEFAULT 'info',
  title TEXT,
  content TEXT,
  link TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 8. 每日统计表
-- ======================================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE UNIQUE,
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  top_pages TEXT,
  top_referrers TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 9. 创建索引（提高查询性能）
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_visit_time ON visit_logs(visit_time);
CREATE INDEX IF NOT EXISTS idx_visit_session ON visit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_visit_page ON visit_logs(page_url);
CREATE INDEX IF NOT EXISTS idx_visit_referrer ON visit_logs(referrer_domain);
CREATE INDEX IF NOT EXISTS idx_online_last_active ON online_visitors(last_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_active ON system_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);
```

### 验证数据库

```sql
-- 查看所有表
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- 查看 visit_logs 表结构
PRAGMA table_info(visit_logs);

-- 查看用户表
SELECT * FROM users;

-- 查看统计数据
SELECT * FROM stats;
```

---

## 🔐 环境变量

### 变量列表

| 变量名 | 类型 | 说明 | 默认值 | 必填 |
|--------|------|------|--------|------|
| `ADMIN_PASSWORD` | 文本 | 管理面板登录密码 | `admin123` | ✅ |
| `WEATHER_LAT` | 文本 | 默认纬度（备用位置） | `35.77` | ❌ |
| `WEATHER_LON` | 文本 | 默认经度（备用位置） | `140.32` | ❌ |

### 配置方式

**通过 wrangler.toml：**
```toml
[vars]
ADMIN_PASSWORD = "your_secure_password"
WEATHER_LAT = "35.77"
WEATHER_LON = "140.32"
```

**通过 Cloudflare Dashboard：**
1. 进入 Worker 页面
2. 点击 **设置** → **变量**
3. 点击 **添加变量**
4. 输入变量名和值
5. 点击 **保存**

**通过命令行（推荐用于敏感信息）：**
```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put WEATHER_LAT
wrangler secret put WEATHER_LON
```

---

## 📡 API 接口文档

### 完整端点列表

| 端点 | 方法 | 参数 | 限流 | 描述 |
|------|------|------|------|------|
| `/health` | GET | - | ❌ | 健康检查 |
| `/` | GET | - | ❌ | 主页面（HTML） |
| `/admin` | GET | - | ❌ | 管理面板（HTML） |
| `/api/stats` | GET | - | ❌ | 获取访问统计 |
| `/api/online` | GET | - | ❌ | 获取在线人数 |
| `/api/analytics` | GET | `period` | ❌ | 获取访客分析数据 |
| `/api/analytics/realtime` | GET | - | ❌ | 获取实时数据 |
| `/api/analytics/session` | POST | `session_id` 等 | ❌ | 会话跟踪 |
| `/api/register` | POST | `username, email, password` | ❌ | 用户注册 |
| `/api/login` | POST | `username, password` | ❌ | 用户登录 |
| `/api/logout` | POST | - | ❌ | 用户登出 |
| `/api/user` | GET | - | ❌ | 获取用户信息 |
| `/api/notifications` | GET | `limit` | ❌ | 获取通知列表 |
| `/api/notifications/mark-read` | POST | `notification_id` | ❌ | 标记通知已读 |
| `/api/update-location` | POST | `lat, lon` | ❌ | 更新位置 |
| `/api/set-language` | POST | `lang` | ❌ | 切换语言 |
| `/api/theme` | POST | `theme` | ❌ | 保存主题偏好 |

### API 响应示例

#### 🏥 健康检查 `/health`
```
OK
```

#### 📊 访问统计 `/api/stats`
```json
{
  "success": true,
  "total_visits": 1234,
  "session_id": "sess_1234567890_abc123",
  "timestamp": "2024-06-29T12:00:00.000Z"
}
```

#### 👤 用户登录 `/api/login`
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "role": "user"
  }
}
```

#### 📈 访客分析 `/api/analytics?period=7d`
```json
{
  "success": true,
  "data": {
    "trend": [
      {"date": "2024-06-23", "visits": 10, "unique_visitors": 8}
    ],
    "top_pages": [
      {"page_url": "/", "views": 50, "unique_visitors": 30}
    ],
    "top_referrers": [
      {"referrer_domain": "google.com", "visits": 20}
    ],
    "browsers": [
      {"browser": "Chrome", "count": 80}
    ],
    "operating_systems": [
      {"os": "Windows", "count": 60}
    ],
    "hourly_distribution": [
      {"hour": "14", "visits": 25}
    ],
    "summary": {
      "total_visits": 1000,
      "unique_visitors": 500,
      "avg_time_on_page": 120
    }
  },
  "period": "7d",
  "timestamp": "2024-06-29T12:00:00.000Z"
}
```

#### 🔔 通知列表 `/api/notifications`
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "info",
      "title": "欢迎使用 Edge Homepage",
      "content": "感谢您使用 Edge Homepage！",
      "link": "/",
      "is_read": 0,
      "created_at": "2024-06-29T12:00:00.000Z",
      "source": "system"
    }
  ],
  "unread_count": 1
}
```

---

## 🧪 命令行测试

### 基础测试
```bash
# 健康检查
curl https://your-worker.dev/health

# 获取主页
curl https://your-worker.dev/

# 获取访问统计
curl https://your-worker.dev/api/stats

# 获取在线人数
curl https://your-worker.dev/api/online
```

### 用户认证测试
```bash
# 用户注册
curl -X POST https://your-worker.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456","display_name":"Test User"}'

# 用户登录
curl -X POST https://your-worker.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}' \
  -c cookies.txt

# 获取用户信息（需要 Cookie）
curl https://your-worker.dev/api/user \
  -b cookies.txt

# 用户登出
curl -X POST https://your-worker.dev/api/logout \
  -b cookies.txt
```

### 数据分析测试
```bash
# 获取访客分析（7天）
curl https://your-worker.dev/api/analytics?period=7d

# 获取访客分析（30天）
curl https://your-worker.dev/api/analytics?period=30d

# 获取实时数据
curl https://your-worker.dev/api/analytics/realtime

# 获取在线人数
curl https://your-worker.dev/api/online
```

### 通知测试
```bash
# 获取通知列表
curl https://your-worker.dev/api/notifications?limit=10

# 标记通知已读
curl -X POST https://your-worker.dev/api/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{"all":true}'
```

---

## 🎨 主题系统

### 预设主题

| 主题 | 名称 | 颜色风格 | Emoji |
|------|------|----------|-------|
| **Dark** | 暗色 | 经典深色，护眼舒适 | 🌙 |
| **Light** | 亮色 | 明亮简洁，清晰易读 | ☀️ |
| **Ocean** | 海洋 | 蓝色系，清新宁静 | 🌊 |
| **Forest** | 森林 | 绿色系，自然舒适 | 🌲 |
| **Sunset** | 日落 | 橙色系，温暖浪漫 | 🌅 |
| **Neon** | 霓虹 | 紫色 + 青色，炫酷潮流 | 💜 |

### 自定义主题

在 `renderHTML` 函数中修改 `themeColors` 对象：

```javascript
const themeColors = {
  // ... 现有主题
  custom: { 
    bg: '#your-bg-color', 
    text: '#your-text-color', 
    card: 'rgba(255,255,255,0.05)', 
    border: 'rgba(255,255,255,0.08)', 
    accent: '#your-accent-color', 
    glow: 'rgba(your-accent,0.3)', 
    gradient: 'linear-gradient(135deg,color1,color2)' 
  }
};
```

然后在 HTML 中添加主题选项：
```html
<option value="custom" ${theme === 'custom' ? 'selected' : ''}>🎨 Custom</option>
```

---

## 🌍 多语言支持

### 支持的语言

| 语言代码 | 语言名称 | 翻译完成度 |
|----------|----------|------------|
| `zh` | 中文 | ✅ 100% |
| `en` | English | ✅ 100% |
| `ja` | 日本語 | ✅ 100% |
| `ko` | 한국어 | ✅ 100% |

### 添加新语言

在 `i18n` 对象中添加新语言配置：

```javascript
const i18n = {
  // ... 现有语言
  fr: {
    name: 'Français',
    weather: {
      clear: 'Clair',
      mostlyClear: 'Plutôt clair',
      // ... 更多天气翻译
    },
    ui: {
      enableLocation: '📍 Activer la localisation',
      // ... 更多 UI 翻译
    },
    quotes: [
      { text: 'La simplicité est la sophistication suprême', author: 'Léonard de Vinci' },
      // ... 更多名言
    ],
    dateFormat: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    links: { google: 'Google', github: 'GitHub', hackerNews: 'Hacker News', reddit: 'Reddit' }
  }
};
```

---

## 🚢 部署指南

### 首次部署

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 部署
wrangler deploy
```

### 更新部署

```bash
# 更新代码后重新部署
wrangler deploy
```

### 查看日志

```bash
# 实时查看日志
wrangler tail

# 查看最近 100 条日志
wrangler tail --format=json | head -100

# 过滤错误日志
wrangler tail --filter "status:>=400"
```

### 回滚

在 Cloudflare Dashboard 中：
1. 进入 Worker 页面
2. 点击 **部署** 标签
3. 选择之前的版本
4. 点击 **回滚**

### 生产环境配置

```bash
# 设置生产环境变量
wrangler secret put ADMIN_PASSWORD --env production
wrangler secret put WEATHER_LAT --env production
wrangler secret put WEATHER_LON --env production

# 部署到生产
wrangler deploy --env production
```

---

## 📁 项目结构

```
edge-homepage/
├── src/
│   └── index.js              # Cloudflare Worker 主文件 (~1800行)
│       ├── export default { fetch }  # 主入口
│       ├── 认证函数 (authenticate, handleLogin, handleRegister, handleLogout)
│       ├── 通知函数 (handleGetNotifications, handleMarkNotificationsRead)
│       ├── 分析函数 (handleAnalytics, handleRealtimeAnalytics, handleSessionTracking)
│       ├── 统计函数 (handleStats, handleOnline)
│       ├── renderLoginPage()          # 登录页面
│       ├── renderHTML()               # 主页渲染 (优化UI)
│       ├── renderAdminHTML()          # 管理面板渲染 (优化UI)
│       ├── renderAdminPanel()         # 管理面板数据获取
│       ├── getAnalyticsData()         # 分析数据获取
│       ├── cleanOldData()             # 清理旧数据
│       ├── detectLanguage()           # 语言检测
│       ├── i18n                       # 多语言数据 (中/英/日/韩)
│       ├── getIP()                    # IP获取
│       ├── getWeatherByCoords()       # 天气获取
│       ├── getWeatherDescription()    # 天气描述
│       ├── getLocationName()          # 位置名称
│       ├── getWeatherIcon()           # 天气图标
│       ├── getQuote()                 # 名言
│       ├── getDate()                  # 日期
│       ├── detectDeviceInfo()         # 设备检测
│       ├── generateSessionToken()     # 会话令牌
│       ├── generateSessionId()        # 会话ID
│       ├── hashPassword()             # 密码哈希
│       ├── verifyPassword()           # 密码验证
│       └── escapeHtml()               # HTML转义
├── wrangler.toml              # Cloudflare Workers 配置
├── package.json              # 项目配置
├── LICENSE                   # MIT 许可证
└── README.md                 # 项目文档（本文件）
```

### 核心文件说明

| 文件 | 大小 | 说明 |
|------|------|------|
| `index.js` | ~1800行 | Worker 主程序，包含所有功能模块 |
| `wrangler.toml` | - | Worker 配置、绑定和环境变量 |
| `README.md` | - | 完整的项目文档 |

---

## 📸 截图展示

### 主页 - 暗色主题
![主页-暗色](https://via.placeholder.com/800x500/0b0d14/ffffff?text=Homepage+Dark+Theme)

### 主页 - 亮色主题
![主页-亮色](https://via.placeholder.com/800x500/f0f2f5/1a1a2e?text=Homepage+Light+Theme)

### 管理面板
![管理面板](https://via.placeholder.com/800x500/0b0d14/ffffff?text=Admin+Panel)

### 多语言支持
![多语言](https://via.placeholder.com/800x500/0b0d14/ffffff?text=Multi-language+Support)

### 移动端适配
![移动端](https://via.placeholder.com/400x700/0b0d14/ffffff?text=Mobile+View)

---

## 🔧 本地开发

### 使用 Wrangler 本地预览

```bash
# 安装依赖
npm install -g wrangler

# 克隆项目
git clone https://github.com/yourusername/edge-homepage.git
cd edge-homepage

# 本地启动（预览模式）
wrangler dev --main src/index.js --port 8787

# 访问 http://localhost:8787
```

### 使用 curl 测试本地 API

```bash
# 健康检查
curl http://localhost:8787/health

# 访问统计
curl http://localhost:8787/api/stats

# 用户登录
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

### 调试技巧

```bash
# 启用本地日志
wrangler dev --log-level debug

# 查看实时日志（部署后）
wrangler tail

# 使用 Chrome DevTools 调试
# 在 wrangler dev 模式下，按 D 键打开 Devtools
```

---

## 📋 更新日志

### v2.0 (2026-06-29)

**🎨 UI 大升级**
- 全新玻璃态毛玻璃效果设计
- 现代化卡片布局和动画
- 优化移动端体验

**🌍 多语言支持**
- 新增中文、English、日本語、한국어
- 自动检测浏览器语言
- 语言偏好持久化

**👤 用户系统**
- 注册/登录/登出功能
- 7天会话管理
- 安全密码哈希（SHA-256 + Salt）

**🔔 实时通知**
- 系统通知和用户通知
- 30秒轮询检查
- 未读消息计数

**📊 访客分析增强**
- 页面浏览统计
- 来源域名跟踪
- 会话跟踪
- 屏幕分辨率记录

**🎨 6种主题**
- Dark、Light、Ocean、Forest、Sunset、Neon
- 一键切换，偏好持久化

**📱 响应式优化**
- 完美适配移动端
- 触摸交互优化

**🔒 安全增强**
- CSP 动态 nonce
- HSTS 强制 HTTPS
- 完整安全响应头

**⚡ 性能优化**
- KV 缓存天气数据
- Edge Cache 页面缓存
- 数据库索引优化

### v1.0 (2026-06-20)

- 🚀 初始版本发布
- 🌤️ 实时天气功能
- 📍 位置定位
- 📊 基础访问统计
- 🔍 Google 搜索
- 💬 每日名言
- 🔗 快速链接

---

## ❓ 常见问题

### 1. 登录管理面板的密码是什么？
**A:** 默认密码是 `admin123`，您可以在环境变量 `ADMIN_PASSWORD` 中修改。

### 2. 天气数据不显示怎么办？
**A:**
- 检查 Open-Meteo API 是否可访问
- 确认 `WEATHER_LAT` 和 `WEATHER_LON` 环境变量已设置
- 查看 Worker 日志中的错误信息
- 确认 KV 缓存是否正常

### 3. 用户注册后无法登录？
**A:**
- 确认密码正确
- 检查用户是否在 `users` 表中：`SELECT * FROM users WHERE username = 'your_username';`
- 查看 Worker 日志中的错误信息
- 密码哈希函数可能有问题，重新部署后重试

### 4. 如何重置访问统计？
**A:** 在 D1 Studio 中执行：
```sql
UPDATE stats SET total_visits = 0 WHERE id = 1;
```

### 5. 如何清理所有访问日志？
**A:** 在 D1 Studio 中执行：
```sql
DELETE FROM visit_logs;
DELETE FROM online_visitors;
UPDATE stats SET total_visits = 0 WHERE id = 1;
```

### 6. 部署后页面没有更新？
**A:**
- 清除浏览器缓存 (Ctrl+Shift+Delete)
- 硬刷新页面 (Ctrl+F5)
- 确认部署成功：`wrangler deploy`
- 检查 Edge Cache 是否缓存了旧页面

### 7. 数据库连接失败？
**A:**
- 确认 D1 数据库已创建
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确认数据库绑定名称与代码一致 (`DB_HOMEPAGE`)

### 8. 如何添加自定义主题？
**A:** 在 `renderHTML` 函数中的 `themeColors` 对象中添加新主题配置。

### 9. 访客分析数据不准确？
**A:**
- 确认 `visit_logs` 表有数据
- 检查 `page_url`、`referrer_domain`、`session_id` 字段是否有值
- 确认数据库索引已创建

### 10. 如何备份数据？
**A:** 在 D1 Studio 中导出数据，或使用：
```bash
wrangler d1 export homepage-stats --output=backup.sql
```

---

## 🤝 贡献指南

### 贡献流程

```bash
# 1. Fork 本项目
# 2. 克隆到本地
git clone https://github.com/YOUR_USERNAME/edge-homepage.git

# 3. 创建特性分支
git checkout -b feature/AmazingFeature

# 4. 提交更改
git add .
git commit -m '✨ Add some AmazingFeature'

# 5. 推送并开启 Pull Request
git push origin feature/AmazingFeature
```

### 代码规范

- 使用 2 空格缩进
- 变量命名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 添加必要的注释
- 保持代码风格一致

### 提交信息格式

| 类型 | 图标 | 说明 | 示例 |
|------|------|------|------|
| feat | ✨ | 新功能 | `feat: add health check endpoint` |
| fix | 🐛 | 修复问题 | `fix: websocket timeout issue` |
| docs | 📝 | 文档更新 | `docs: update API documentation` |
| style | 🎨 | 代码格式 | `style: update card hover effect` |
| refactor | ♻️ | 代码重构 | `refactor: extract common functions` |
| perf | ⚡ | 性能优化 | `perf: optimize concurrent test` |
| test | ✅ | 测试相关 | `test: add unit tests` |
| chore | 🔧 | 构建/工具 | `chore: update wrangler config` |
| security | 🔒 | 安全相关 | `security: add rate limiting` |

### Pull Request 检查清单

- [ ] 代码符合项目规范
- [ ] 已测试通过
- [ ] 更新了相关文档
- [ ] 提交信息格式正确
- [ ] 未引入破坏性变更

---

## 📄 许可证

本项目使用 **MIT 许可证**。

| 项目 | 说明 |
|------|------|
| 商业使用 | ✅ 允许 |
| 修改代码 | ✅ 允许 |
| 分发代码 | ✅ 允许 |
| 公开源代码 | ❌ 不需要 |
| 保留版权声明 | ✅ 必须 |
| 专利授权 | ✅ 包含 |
| 私人使用 | ✅ 允许 |

完整许可证文本请查看 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

### 开源项目与服务

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Open-Meteo](https://open-meteo.com/) - 免费天气数据 API
- [D1](https://developers.cloudflare.com/d1/) - 原生 SQLite 数据库
- [KV](https://developers.cloudflare.com/kv/) - 键值存储
- [Font Awesome](https://fontawesome.com/) - 图标库（已内联）

### 贡献者

感谢所有为本项目做出贡献的开发者！

---

## 📞 联系方式

| 渠道 | 链接 |
|------|------|
| **项目链接** | [GitHub](https://github.com/yourusername/edge-homepage) |
| **演示地址** | [https://home.bjhr.space](https://homepagedemo.bjhr.space) |
| **问题反馈** | [GitHub Issues](https://github.com/BlueDriftHK/edge-homepage/issues) |
| **讨论区** | [GitHub Discussions](https://github.com/BlueDriftHK/edge-homepage/discussions) |

---

## ⭐ Star History

如果这个项目对你有帮助，欢迎 Star 支持！

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/edge-homepage&type=Date)](https://star-history.com/#yourusername/edge-homepage&Date)

---

**Made with ❤️ by BlueDriftHK*

**MIT License · 开源自由 · 持续更新**
