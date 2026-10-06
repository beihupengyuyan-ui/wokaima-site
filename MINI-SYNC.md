# 小程序 ↔ 官网后台 数据打通 · 部署手册

> 本文档对应代码：`lib/mini.ts`、`app/api/mini/**`、`scripts/migrate-mini.mjs`
> 小程序端对应文件：`utils/config.js`、`utils/api.js`、`utils/auth.js`、`utils/orders.js`、`data/products.js`

## 0. 一句话架构

小程序不碰数据库，只调 6 个 `/api/mini/*` 接口；订单**直接写进现有 `leads` 表**，
所以 admin 后台的 `/admin/leads/pending|processing|done`、`/admin/leads/[id]` **一行都不用改**，
工程师在后台点「已联系 / 已报价 / 已签约」，小程序订单详情立刻同步。

| admin 后台 sub_status | 小程序显示 |
| --- | --- |
| `pending`（待处理） | 待确认 |
| `processing`（跟进中） | 已受理 |
| `done`（已完成） | 已完成 |
| `sub_status = 已放弃` | 已取消 |

> 取消**不写** `status='cancelled'`，否则线索会从 admin 三个列表页消失。小程序取消 = `sub_status='已放弃'` + tags 追加「用户取消」。

## 1. 服务器环境变量

在服务器 `.env.local`（或 pm2 的 env）里补三项，然后 `pm2 restart wokaima --update-env`：

```bash
WX_APPID=wx 开头的 18 位 AppID（真实值见 .env.local，不要提交进仓库）
WX_SECRET=微信公众平台 → 开发管理 → 开发设置 → AppSecret
MINI_TOKEN_SECRET=随便一串长随机字符串（本地和服务器各自独立即可）
```

> 提交前自检（避免误提交密钥）：`git diff --cached | Select-String 'wx[0-9a-f]{16}|[0-9a-f]{32}'` —— 有命中就说明有密钥形态的串进了暂存区。
> 注意：**AppID 也会被 GitHub 密钥扫描识别成 `Tencent WeChat API App ID` 并告警，那是误报**（AppID 是公开标识，单独拿到换不到 access_token），
> 在仓库 Security → Secret scanning 里把该告警 Dismiss 成 False positive 即可。

⚠️ `WX_SECRET` **只能放服务端**，绝不能写进小程序代码。

> `MINI_TOKEN_SECRET` 是**必填项**：服务器上没配时，小程序登录接口会直接返回
> 「服务端未配置 MINI_TOKEN_SECRET」，订单接口一律 401（**官网和后台完全不受影响**）。
> 这是刻意设计——绝不允许服务端悄悄回落到代码里的默认密钥，
> 否则任何拿到源码的人都能伪造令牌，读走客户手机号 / 地址。

## 2. 数据库迁移（先备份，幂等，可重复执行）

```bash
cd /home/ubuntu/wokaima-site
cp data/wokaima.db data/wokaima.db.bak.$(date +%Y%m%d%H%M)
node scripts/migrate-mini.mjs
```

新增列：`source / openid / order_no / client_order_no / items_json / amount_daily /
amount_monthly / lease_term / address / updated_at` + 4 个索引。

## 3. 发布代码

```bash
cd /home/ubuntu/wokaima-site
git pull            # 或本地 git push 后服务器再 pull
npm install         # 本次没加依赖，可跳过
npm run build
pm2 restart wokaima
```

> 更省事：仓库里已带一键脚本 `scripts/deploy.sh`，在服务器上执行 `bash scripts/deploy.sh`
> 即可完成上面全部步骤（额外含数据库备份、迁移与部署后自检）；`package.json` 有改动时用
> `bash scripts/deploy.sh --install`。脚本发现服务器有未提交改动会直接拒绝执行，
> 避免「git pull 失败了、但仍在用旧代码构建」这种最隐蔽的线上不更新。

## 4. 部署后自测（照着敲，看到什么就是什么）

```bash
# 4.1 商品接口（应返回 3 条，monthText 形如 ¥900 / 月）
curl -s http://127.0.0.1:3000/api/mini/products | head -c 300; echo

# 4.2 未带令牌查订单（应返回 {"code":401,...}）
curl -s http://127.0.0.1:3000/api/mini/orders; echo

# 4.3 登录接口拿到真实 code 才能测；没有真机就跳到下一步
```

真机联调时，看小程序控制台 + `pm2 logs wokaima` 两侧的输出来定位。

## 4.1 本地已实测的可靠性行为（联调脚本真跑，非推演）

| 场景 | 结果 |
| --- | --- |
| 断网首次启动 | 员工机拿到包内兜底商品，不白屏 |
| 断网下单 | 订单落本地队列，页面正常提示「订单已保存，联网后自动提交」，不丢单 |
| 断网下拉订单 | 本地待同步单不被服务端列表覆盖清空 |
| 恢复网络 | 自动补交成功，本地临时单号被服务端单号替换，旧号走别名表仍可查 |
| 弱网重试 / 连点两次 | 同一 `clientOrderNo` 连发两次，服务端只留 1 条 |
| 换 openid 复用他人订单号 | 返回 `4009` 拒绝（防越权读取客户信息） |
| 金额篡改 | 服务端按 `data/products.ts` 重算，客户端数字一律不信 |

## 5. 域名策略（微信硬性要求）

| 阶段 | 小程序端 | 说明 |
| --- | --- | --- |
| 现在 | `utils/config.js` 里 `baseUrl = 'http://43.142.84.234'` | 开发者工具勾「不校验合法域名」，真机用**开发版** |
| 备案期发体验版 | `mode: 'cloud'` + 云函数 `proxy` | 云函数出网不受域名白名单限制 |
| 备案通过后 | `mode: 'http'` + `baseUrl = 'https://你的域名'` | 公众平台 → 开发管理 → 服务器域名 → request 合法域名 |

## 6. 接口清单

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/mini/products?version=x` | 无 | 商品列表；version 一致只回 `{unchanged:true}` |
| POST | `/api/mini/auth/login` | 无 | `{code}` → `{token, openid}`（HMAC 自签，7 天） |
| POST | `/api/mini/orders` | Bearer | 下单；`clientOrderNo` 幂等；金额与订单号服务端重算 |
| GET | `/api/mini/orders?status=all` | Bearer | 只返回当前 openid 的订单 + counts |
| GET | `/api/mini/orders/[orderNo]` | Bearer | 订单详情（校验归属） |
| POST | `/api/mini/orders/[orderNo]/cancel` | Bearer | 仅 `pending` 可取消 → `sub_status='已放弃'` |

统一响应：`{ code, msg, data }`，`code === 0` 成功；`401` 令牌失效（小程序自动重登重试）。

## 7. 三条红线

1. **AppSecret 只放服务端**，任何情况下不进小程序包。
2. **金额、订单号一律服务端重算**，不信任客户端传来的数字。
3. **`/api/admin/leads/[id]/update` 的鉴权务必复查**（当前只靠 `admin_auth` cookie，
   若服务器没有 WAF，HTTP 环境下 cookie 易被窃听，建议尽快上 HTTPS）。

## 8. 待办（当前未做，按需再说）

- 商品图片仍是小程序包内本地图（`/images/products/*.png`），新增商品图需同步放进小程序包；
  若以后要动态加图，需配 CDN 并把域名加进 downloadFile 合法域名。
- `lib/db.ts` 的 `CREATE TABLE` 还是老结构（本次没动它，避免影响线上）。
  本机全新部署时需先跑一次 `scripts/migrate-mini.mjs`。
