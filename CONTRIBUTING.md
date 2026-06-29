# 🤝 贡献指南

首先，感谢您考虑为 Edge Homepage 做出贡献！🎉 正是像您这样的人让这个项目变得更好。本文档提供了为项目做出贡献的指南。

---

## 📋 目录

- [行为准则](#行为准则)
- [许可证声明](#许可证声明)
- [如何贡献](#如何贡献)
- [报告问题](#报告问题)
- [提出增强建议](#提出增强建议)
- [首次代码贡献](#首次代码贡献)
- [Pull Request 流程](#pull-request-流程)
- [开发环境](#开发环境)
- [编码规范](#编码规范)
- [提交信息规范](#提交信息规范)
- [测试指南](#测试指南)
- [文档要求](#文档要求)
- [获取帮助](#获取帮助)

---

## 📜 行为准则

本项目遵循 [贡献者公约行为准则](https://www.contributor-covenant.org/zh-cn/version/2/0/code_of_conduct/)。参与本项目即表示您同意遵守该准则。

### 我们的承诺

我们承诺为所有人提供无骚扰的参与体验，无论年龄、体型、残疾、种族、性别特征、性别认同和表达、经验水平、教育程度、社会经济地位、国籍、个人外貌、种族、宗教或性取向。

### 我们的标准

有助于营造积极环境的行为：
- 使用欢迎和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

不可接受的行为：
- 使用性暗示语言或图像
- 挑衅、侮辱或贬损性评论
- 公开或私下骚扰
- 未经明确许可发布他人私人信息
- 其他不道德或不专业的行为

---

## ⚖️ 许可证声明

**重要**：本项目使用 **GNU General Public License v3.0** 许可证。

### 您需要了解的内容

| 项目 | 状态 |
|------|------|
| 商业使用 | ✅ 允许 |
| 修改代码 | ✅ 允许 |
| 分发代码 | ✅ 允许 |
| 公开源代码 | ✅ **必须**（修改后） |
| 保留版权声明 | ✅ 必须 |
| 专利授权 | ✅ 包含 |
| 私人使用 | ✅ 允许 |
| 更改许可证 | ❌ 禁止 |

### 贡献者协议

向本项目贡献代码即表示您同意：

1. 您的贡献将在 **GPL-3.0** 许可证下发布
2. 您有权授予该许可
3. 如有要求，您同意提供贡献的原始来源

完整许可证文本请查看 [LICENSE](LICENSE) 文件。

---

## 🎯 如何贡献

### 贡献类型

| 类型 | 说明 | 难度 |
|------|------|------|
| 🐛 **报告 Bug** | 提交问题报告 | 简单 |
| 💡 **功能建议** | 提交新功能想法 | 简单 |
| 📝 **文档改进** | 修复错别字、改进说明 | 简单 |
| 🔧 **代码贡献** | 修复 Bug 或添加新功能 | 中等-困难 |
| 🌍 **翻译** | 添加或改进语言翻译 | 中等 |
| 🎨 **设计** | UI/UX 改进 | 中等 |

### 寻找任务

1. 查看 [Issues](https://github.com/BlueDriftHK/CF-workers-homepage/issues)
2. 查找标签：
   - `good first issue` - 适合新手
   - `help wanted` - 需要帮助
   - `bug` - 需要修复
   - `enhancement` - 新功能

---

## 🐛 报告问题

### 提交前

1. **搜索**现有 Issues，避免重复
2. **确认**问题在最新版本中仍然存在
3. **收集**相关信息（日志、截图、复现步骤）

### Bug 报告模板

```markdown
**描述问题**
清晰简洁地描述问题是什么。

**复现步骤**
复现行为的步骤：
1. 访问 '...'
2. 点击 '....'
3. 看到错误

**预期行为**
清晰简洁地描述你期望发生什么。

**截图**
如适用，添加截图帮助解释问题。

**环境信息（请填写以下信息）：**
- 浏览器及版本：[例如 Chrome 120]
- Worker 版本：[例如 v2.0]
- 部署方式：[例如 Wrangler CLI]

**附加信息**
在此处添加任何其他上下文。
```

---

## 💡 提出增强建议

### 功能请求模板

```markdown
**功能描述**
清晰简洁地描述你想要的功能。

**问题背景**
为什么需要这个功能？它解决了什么问题？

**建议方案**
描述你认为应该如何实现。

**替代方案**
描述你考虑过的替代解决方案。

**附加信息**
在此处添加任何其他上下文或截图。
```

---

## 💻 首次代码贡献

### 前置要求

- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org/) 16 或更高版本
- 已安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- 已安装 Git

### 搭建开发环境

#### 1. Fork 仓库

访问 [Edge Homepage](https://github.com/BlueDriftHK/CF-workers-homepage) 点击 Fork 按钮。

#### 2. 克隆您的 Fork

```bash
git clone https://github.com/YOUR_USERNAME/CF-workers-homepage.git
cd CF-workers-homepage
```

#### 3. 添加上游远程仓库

```bash
git remote add upstream https://github.com/BlueDriftHK/CF-workers-homepage.git
```

#### 4. 安装依赖

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 安装项目依赖（如适用）
npm install
```

#### 5. 创建分支

```bash
# 分支命名规范
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
# 或
git checkout -b docs/your-doc-update
```

---

## 🔄 Pull Request 流程

### 提交前

1. **更新**您的分支到最新的上游代码
2. **充分测试**您的更改
3. **更新**相关文档
4. **遵循**提交信息格式

### PR 模板

```markdown
## 📝 描述

清晰简洁地描述这个 PR 做了什么。

## 🔗 相关 Issue

- Closes #123
- Related to #456

## ✅ 检查清单

- [ ] 代码符合项目风格指南
- [ ] 已添加/更新测试
- [ ] 已更新文档
- [ ] 提交信息符合格式
- [ ] 未引入破坏性变更

## 📸 截图（如适用）

添加截图帮助理解您的更改。

## 🧪 测试

描述您测试了什么以及如何测试。
```

### PR 审查流程

1. **至少 1 名**维护者审查
2. **处理**所有审查意见
3. **通过**所有 CI 检查
4. **合并**到主分支

---

## 🛠️ 开发环境

### 本地开发

```bash
# 启动本地开发服务器
wrangler dev --main src/index.js --port 8787

# 访问 http://localhost:8787
```

### 本地数据库

```bash
# 创建本地 D1 数据库
wrangler d1 create local-db --local

# 应用迁移
wrangler d1 execute local-db --file=./schema.sql --local
```

### 调试

```bash
# 启用详细日志
wrangler dev --log-level debug

# 查看实时日志（部署后）
wrangler tail
```

---

## 📝 编码规范

### 通用规范

- 使用 **2 个空格**缩进
- 使用 **UTF-8** 编码
- 使用 **LF** 行尾（Unix 风格）
- 文件末尾保留一个空行
- 删除尾随空格

### JavaScript 规范

#### 命名规范

```javascript
// 变量和函数 - camelCase
const userName = 'John';
function getUserInfo() { ... }

// 类 - PascalCase
class UserManager { ... }

// 常量 - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 私有变量 - 下划线前缀
const _internalState = { ... };

// 布尔变量 - is/has/can 前缀
const isAuthenticated = true;
const hasPermission = false;
```

#### 代码风格

```javascript
// 使用 const 和 let，避免 var
const name = 'value';
let count = 0;

// 使用模板字符串
const message = `Hello, ${name}!`;

// 使用箭头函数
const add = (a, b) => a + b;

// 使用解构
const { username, email } = user;

// 使用数组方法
const result = items.map(item => item.value);

// 使用 async/await
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 添加注释
// 单行注释

/**
 * 多行注释
 * 描述函数用途
 * @param {string} name - 用户名
 * @returns {string} 欢迎消息
 */
function greet(name) {
  return `Welcome, ${name}!`;
}
```

#### ESLint 配置

```javascript
// 推荐的 ESLint 规则
module.exports = {
  extends: ['eslint:recommended'],
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'arrow-spacing': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
```

### SQL 规范

```sql
-- 表名 - 小写加下划线
CREATE TABLE user_sessions (
  -- 字段名 - 小写加下划线
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- 外键 - fk_ 前缀
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引 - idx_ 前缀
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
```

### HTML/CSS 规范

```html
<!-- 使用小写标签 -->
<div class="container">
  <!-- 使用双引号 -->
  <input type="text" placeholder="输入用户名">
  <!-- 使用语义化标签 -->
  <nav>导航</nav>
  <main>主要内容</main>
  <footer>页脚</footer>
</div>
```

```css
/* 使用 CSS 变量 */
:root {
  --primary-color: #4a6fa5;
  --text-color: #fff;
}

/* 使用 BEM 命名法 */
.card { ... }
.card__header { ... }
.card--active { ... }

/* 使用语义化类名 */
.header { ... }
.main-content { ... }
.footer { ... }
```

---

## 📝 提交信息规范

### 格式

```
<类型>: <主题>

<正文>

<脚注>
```

### 类型

| 类型 | 图标 | 说明 | 示例 |
|------|------|------|------|
| `feat` | ✨ | 新功能 | `feat: 添加天气缓存功能` |
| `fix` | 🐛 | 修复 Bug | `fix: 修复登录超时问题` |
| `docs` | 📝 | 文档更新 | `docs: 更新 API 文档` |
| `style` | 🎨 | 代码格式 | `style: 格式化代码缩进` |
| `refactor` | ♻️ | 代码重构 | `refactor: 提取公共函数` |
| `perf` | ⚡ | 性能优化 | `perf: 优化数据库查询` |
| `test` | ✅ | 测试相关 | `test: 添加单元测试` |
| `chore` | 🔧 | 构建/工具 | `chore: 更新 Wrangler 配置` |
| `security` | 🔒 | 安全相关 | `security: 修复 XSS 漏洞` |
| `i18n` | 🌍 | 国际化 | `i18n: 添加日语翻译` |

### 示例

```
feat: 添加用户注册功能

- 实现用户注册 API 端点
- 添加密码哈希验证
- 创建用户表结构
- 添加注册页面 UI

Closes #123
```

---

## ✅ 测试指南

### 手动测试清单

提交代码前，请确认以下测试通过：

- [ ] 主页正常加载
- [ ] 天气数据正常显示
- [ ] 位置定位正常工作
- [ ] 主题切换正常
- [ ] 语言切换正常
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 用户登出功能正常
- [ ] 管理面板正常访问
- [ ] 统计数据显示正常
- [ ] 访客分析数据正常
- [ ] 通知功能正常

### API 测试

```bash
# 测试健康检查
curl http://localhost:8787/health

# 测试统计 API
curl http://localhost:8787/api/stats

# 测试用户注册
curl -X POST http://localhost:8787/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# 测试用户登录
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

---

## 📚 文档要求

### 需要更新的文档

根据您的更改类型更新相应文档：

| 更改类型 | 需要更新的文档 |
|----------|---------------|
| 新功能 | README.md、API 文档、Wiki |
| Bug 修复 | 如影响行为则更新文档 |
| 配置更改 | wrangler.toml 注释、README.md |
| 数据库更改 | 数据库设计文档、迁移脚本 |
| API 更改 | API 文档、README.md |
| UI 更改 | 截图（如需要） |

### 文档风格

- 使用清晰的中文
- 使用标题和列表组织内容
- 包含代码示例
- 保持一致性

---

## 💬 获取帮助

### 联系方式

| 渠道 | 用途 |
|------|------|
| [GitHub Issues](https://github.com/BlueDriftHK/CF-workers-homepage/issues) | 报告问题、功能请求 |
| [GitHub Discussions](https://github.com/BlueDriftHK/CF-workers-homepage/discussions) | 讨论、提问 |
| Email: maintainer@yourdomain.com | 直接联系维护者 |

### 常见问题

**Q: 我该如何开始贡献？**
A: 查看 [good first issue](https://github.com/BlueDriftHK/CF-workers-homepage/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) 标签。

**Q: 我需要什么开发环境？**
A: Node.js 16+、Wrangler CLI、Cloudflare 账号。

**Q: 如何测试我的更改？**
A: 使用 `wrangler dev` 本地测试，确保所有功能正常。

**Q: 如何处理冲突？**
A: 使用 `git rebase upstream/main` 解决冲突。

---

## 📄 许可证

通过贡献代码，您同意您的贡献将在 **GNU General Public License v3.0** 许可证下发布。

### 许可证要点

- ✅ 您可以自由使用、修改和分发
- ✅ 修改后的代码必须开源
- ❌ 不得更改许可证
- ❌ 不得添加额外限制

完整许可证文本请查看 [LICENSE](LICENSE) 文件。

---

**感谢您的贡献！** ❤️

**BlueDriftHK**
