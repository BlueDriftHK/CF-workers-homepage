# 🔒 安全政策

## 支持版本

| 版本 | 支持状态 |
| ------- | ------------------ |
| 2.x     | ✅ 支持中 |
| 1.x     | ❌ 已停止支持 |
| < 1.0   | ❌ 已停止支持 |

我们积极支持最新主版本的安全更新。1.x 版本已不再维护，可能包含未修复的安全漏洞。

---

## 📋 报告漏洞

**我们非常重视安全问题。** 如果您在 Edge Homepage 中发现了安全漏洞，请按照以下步骤操作：

### 如何报告

1. **不要**公开披露漏洞（例如在 GitHub Issues、讨论区或公共论坛）
2. **邮件**发送详细信息至：**security@yourdomain.com**
3. **如果可能，使用 PGP 加密**（指纹见下方）
4. **等待**我们的回应，再公开披露

### 需要提供的信息

请尽可能提供详细信息：

- **描述** - 这是什么漏洞？
- **受影响版本** - 哪些版本受到影响？
- **复现步骤** - 我们如何复现该问题？
- **影响范围** - 攻击者可能利用它做什么？
- **建议修复方案** - 您是否有潜在的解决方案？
- **概念验证** - 代码或截图（如适用）

### 响应时间线

| 阶段 | 时间 | 描述 |
|-------|-----------|-------------|
| **确认收到** | 24小时内 | 我们将确认收到您的报告 |
| **调查** | 3-5天 | 我们将调查并验证该问题 |
| **修复开发** | 1-2周 | 我们将开发并测试修复方案 |
| **发布** | 与下个版本同步 | 修复将随下个版本发布 |

### PGP 公钥

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Your PGP public key here]
-----END PGP PUBLIC KEY BLOCK-----
```

---

## 🛡️ 安全措施

### 已实施的安全功能

| 类别 | 措施 | 状态 |
|------|------|------|
| **传输安全** | HTTPS 强制（HSTS） | ✅ 已实施 |
| **内容安全** | CSP（内容安全策略） | ✅ 已实施 |
| **点击劫持** | X-Frame-Options: DENY | ✅ 已实施 |
| **MIME 类型** | X-Content-Type-Options: nosniff | ✅ 已实施 |
| **XSS 防护** | X-XSS-Protection | ✅ 已实施 |
| **密码存储** | SHA-256 + Salt | ✅ 已实施 |
| **会话管理** | HttpOnly + Secure + SameSite | ✅ 已实施 |
| **SQL 注入** | 参数化查询 | ✅ 已实施 |
| **输入验证** | 基础验证 + HTML 转义 | ⚠️ 需增强 |
| **速率限制** | 登录限流 | ❌ 计划中 |

---

## 🔐 安全配置建议

### 1. 修改默认密码

**立即执行！** 默认管理员密码 `admin123` 应在首次部署后立即更改。

```bash
# 在 wrangler.toml 中设置强密码
[vars]
ADMIN_PASSWORD = "your_very_strong_password_here"
```

或在 Cloudflare Dashboard 中设置环境变量。

### 2. 启用登录限流（推荐）

在 `handleLogin` 函数中添加登录尝试限流：

```javascript
// 登录限流
const rateLimitKey = `login_attempts:${ip}`;
const attempts = await env.KV_HOMEPAGE.get(rateLimitKey) || 0;
if (attempts >= 5) {
  return new Response(JSON.stringify({ 
    error: '登录尝试次数过多，请 5 分钟后再试。' 
  }), { status: 429 });
}
await env.KV_HOMEPAGE.put(rateLimitKey, String(parseInt(attempts) + 1), { 
  expirationTtl: 300 
});
```

### 3. 增强密码策略

建议用户使用强密码：

```javascript
// 密码验证
function validatePassword(password) {
  if (password.length < 8) {
    return '密码至少需要 8 个字符';
  }
  if (!/[A-Z]/.test(password)) {
    return '密码必须包含大写字母';
  }
  if (!/[a-z]/.test(password)) {
    return '密码必须包含小写字母';
  }
  if (!/[0-9]/.test(password)) {
    return '密码必须包含数字';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return '密码必须包含特殊字符 (!@#$%^&*)';
  }
  return null; // 验证通过
}
```

### 4. 定期备份数据库

```bash
# 备份 D1 数据库
wrangler d1 export homepage-stats --output=backup_$(date +%Y%m%d).sql

# 或使用 Cloudflare Dashboard 导出
```

---

## 📊 数据隐私

### 收集的数据

| 数据类型 | 用途 | 保留期限 |
|----------|------|----------|
| IP 地址 | 访客分析、安全日志 | 最多 30 天 |
| 用户代理 | 设备/浏览器统计 | 最多 30 天 |
| 地理位置 | 访客来源分析 | 最多 30 天 |
| 用户名 | 用户认证 | 账号有效期内 |
| 邮箱 | 用户通知 | 账号有效期内 |
| 密码哈希 | 身份验证 | 账号有效期内 |

### 数据保护措施

- ✅ IP 地址在 30 天后自动匿名化（哈希或截断）
- ✅ 密码使用 SHA-256 + Salt 哈希存储（不可逆）
- ✅ 会话令牌随机生成（64位）
- ✅ 所有数据传输使用 HTTPS
- ✅ 数据库访问需要认证

### 用户权利

根据 GDPR/CCPA 规定，用户享有以下权利：

1. **访问权** - 查看我们收集了哪些数据
2. **更正权** - 更正不准确的数据
3. **删除权** - 请求删除个人数据
4. **限制处理权** - 限制数据处理
5. **数据可携权** - 导出数据
6. **反对权** - 反对数据处理

---

## 🚨 安全事件响应

### 事件响应流程

```
发现事件 → 评估影响 → 控制损害 → 调查原因 → 修复漏洞 → 通知用户 → 总结改进
```

### 事件响应团队

| 角色 | 职责 | 联系方式 |
|------|------|----------|
| 安全负责人 | 协调整个响应过程 | security@yourdomain.com |
| 技术负责人 | 技术调查和修复 | tech@yourdomain.com |
| 公关负责人 | 对外沟通 | press@yourdomain.com |

### 通知用户

如果发生涉及用户数据的安全事件，我们将：

1. 通过电子邮件通知受影响的用户
2. 在网站发布公告
3. 说明事件性质、影响范围和已采取的措施

---

## 🛠️ 安全最佳实践

### 部署安全

- [ ] 修改默认管理员密码
- [ ] 启用环境变量存储敏感信息
- [ ] 使用 Secrets 而非纯文本变量
- [ ] 定期更新 Worker 版本
- [ ] 监控 Worker 日志中的异常

### 代码安全

- [ ] 使用参数化查询（已实现）
- [ ] 验证所有用户输入
- [ ] 转义所有 HTML 输出
- [ ] 使用 HttpOnly Cookie
- [ ] 实现 CSRF 保护
- [ ] 限制 API 请求频率

### 运维安全

- [ ] 定期备份数据库
- [ ] 监控异常访问模式
- [ ] 定期审查用户权限
- [ ] 启用审计日志
- [ ] 定期进行安全审计

---

## 📝 安全相关资源

### 外部资源

- [Cloudflare Workers 安全最佳实践](https://developers.cloudflare.com/workers/security/)
- [OWASP Top 10 安全风险](https://owasp.org/www-project-top-ten/)
- [Cloudflare D1 安全文档](https://developers.cloudflare.com/d1/security/)
- [MDN HTTP 安全头指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)

### 内部资源

- [安全公告](./SECURITY_ADVISORY.md)
- [部署指南](./DEPLOYMENT.md)
- [API 安全文档](./API_SECURITY.md)

---

## 📧 联系方式

| 用途 | 邮箱 | 响应时间 |
|------|------|----------|
| **报告安全漏洞** | asiacomk@gmail.com | 24小时内 |
| **安全咨询** | asiacomk@gmail.com | 48小时内 |
| **一般问题** | asiacomk@gmail.com | 72小时内 |

---

## 🔄 更新日志

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-06-29 | 1.0 | 初始版本 |

---

## ✅ 签署确认

| 角色 | 姓名 | 日期 | 签名 |
|------|------|------|------|
| 安全负责人 | | | |
| 项目维护者 | | | |

---

**最后更新**: 2026年6月29日  
**下次审查**: 2026年9月29日  
**审查频率**: 每季度

---

*本安全政策是 Edge Homepage 项目的一部分。如有任何安全问题，请立即联系我们。*
