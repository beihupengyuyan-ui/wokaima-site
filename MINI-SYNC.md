# 小程序 ↔ 官网后台 数据打通 · 部署手册

> 本文档对应代码：`lib/mini.ts`、`app/api/mini/**`、`scripts/migrate-mini.mjs`
> 小程序端对应文件：`utils/config.js`、`utils/api.js`、`utils/auth.js`、`utils/orders.js`、`utils/order-status.js`（状态与取消原因口径）、`data/products.js`

## 0. 一句话架构

小程序不碰数据库，只调 6 个 `/api/mini/*` 接口；订单**直接写进现有 `leads` 表**，
后台 `/admin/leads/pending|processing|done`、`/admin/leads/[id]` 直接复用现有页面，
工程师在后台点「已联系 / 已报价 / 已签约」，小程序订单详情立刻同步；
客户取消的订单不在线索三页签里，统一进 `/admin/cancellations`（见 0.1 节）。

| admin 后台 sub_status | 小程序显示 |
| --- | --- |
| `pending`（待处理） | 待确认 |
| `processing`（跟进中） | 已受理 |
| `done`（已完成） | 已完成 |
| `sub_status = 已放弃` | 已取消 |

> 取消**不写** `status='cancelled'`（写了会从后台主状态维度里丢失原始状态），
> 取消 = `sub_status='已放弃'` + tags 追加「用户取消」+ `cancel_source / cancel_reason / cancel_at`。
>
> ⚠️ **后台三个线索列表页必须同时看 `status` 和 `sub_status`**（统一走 `lib/leads.ts`）：
> `sub_status='已放弃'` 的线索一律从「待处理 / 处理中 / 已完成」中排除，只出现在
> **`/admin/cancellations`（客户取消订单模块）**，卡片与详情页都显示红色「已取消」徽标与「无需再跟进」提示。
> 早期版本只按 `status IN ('pending','new')` 查询，导致用户已取消的订单在后台看起来还是崭新的待处理线索。
> SQL 片段（`NOT_CANCELLED_SQL` / `CANCELLED_SQL`）与判定函数都在 `lib/lead-status.ts`，新增列表查询请复用，不要各页自己拼 WHERE。

## 0.1 客户取消订单（后台闭环 + 原因统计）

`/admin/cancellations` 是独立模块（导航第二项，带未处理红点），把「客户取消了」当成一件待办：

- **待处理 / 已处理 / 全部** 三个视图，另有取消原因分布条形图与近 7 天取消数（`cancelStats()`）；
- 一张单的完整链路：客户在**官网**（`/apply/lookup` → `POST /api/site/orders/cancel`）或
  **小程序**（`POST /api/mini/orders/[orderNo]/cancel`，可选 `{ reason }`）自助取消
  → 写 `sub_status='已放弃'` + `cancel_source` / `cancel_reason` / `cancel_at`（`handle_status` 留空 = 未处理）
  → 后台在卡片上选处理结果（`已回访挽回 / 客户确认取消 / 已退款 / 联系不上 / 后台标记放弃`）
  → `POST /api/admin/leads/[id]/cancel` 写 `handle_status='handled'` + `handle_result` + `handled_at`
  → 追加标签「取消已处理」与一条 `follow_ups`；选「已回访挽回」时订单主状态改回 `pending`、
  `sub_status` 清空（**复活**，重新出现在待处理列表，取消原因与时间保留）。
- 后台工程师自己在工作台把单标成「已放弃」= 后台发起的取消，`POST /api/admin/leads/[id]/update`
  自动补 `cancel_source='后台'` 并直接记成「已处理 · 后台标记放弃」，不会污染待处理红点。
- 老数据（本次改造前取消的单）这 6 列是 NULL，页面按「来源未知 / 未填写原因 / 未处理」展示，
  不做猜测性回填；`cancel_at` 缺省时用 `updated_at / created_at` 排序与展示。

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
amount_monthly / lease_term / address / updated_at` + **`sub_status / follow_ups / tags`** +
**`cancel_source / cancel_reason / cancel_note / cancel_at / handle_status / handle_result / handled_at`** + 5 个索引。

> 最后那 7 列是「客户取消订单」模块（0.1 节）用的：老数据一律为 NULL，
> 列表按「来源未知 / 未填写原因 / 未处理」展示。**缺列时的症状**：后台 `/admin/cancellations`
> 与详情页的取消卡片读不到字段（显示未处理 / 未填写原因），
> 且 `POST /api/admin/leads/[id]/cancel` 会 500 —— 补跑一次本脚本即可。

> ⚠️ 最后三列（`sub_status / follow_ups / tags`）是后台工作台用的，比小程序对接更早，
> 当初只在开发机手工 `ALTER` 过、没写进任何脚本。**线上库缺这三列时的症状很容易误判：**
>
> - 后台 `/admin/leads/pending|processing|done` 列表、`/admin/leads/[id]` 详情**都能正常打开**
>   （它们走 `SELECT *`，缺列只表现为读到 `undefined`）；
> - 但 `POST /api/mini/orders` 的 `INSERT` 显式写了这三列 →
>   `SQLite: table leads has no column named sub_status` → **接口直接 500**，
>   小程序侧只看到「请求失败（500）」，订单永远进不了后台。
> - 排查入口：用有效令牌发一次 `POST /api/mini/orders`，若换一个不存在的 `productId`
>   能正常返回 `4004 商品不存在或已下架`（说明鉴权/幂等查询都通），
>   再用真实商品就 500 —— 那就是卡在 `INSERT`，按本节补列即可。
>
> 修好后 `deploy.sh` 每次部署都会自动跑一遍本脚本，不再需要手工补列。

## 3. 发布代码

**推荐：本地一条命令，推送即上线**

```bash
# 在你 Windows 本地的仓库里
git add -A
git commit -m "说明"
git push server main     # 直推服务器裸库 → 服务器钩子自动部署
```

推送那一刻，服务器自动依次做：**备份数据库 → 补缺失字段 → 构建 → 构建成功才重启 pm2 → 自检**，
全过程日志实时回显在你本地的 push 终端（服务器侧存档 `/home/ubuntu/oldsite-deploy.log`）。
构建失败时不会重启，线上仍是上一个可用版本，不会半截上线。

**手动：排查问题时用**

```bash
cd /home/ubuntu/wokaima-site
bash scripts/deploy.sh              # 常规发布
bash scripts/deploy.sh --install    # package.json 有改动时（先装依赖再构建）
```

> **为什么不是「服务器 git pull」了？**
> 这台服务器**连不通 GitHub（实测 http=000）**，所以服务器不再从 GitHub 拉代码，而是从服务器上的裸库拉。
> 服务器上的 remote 已调整：`origin` = `/home/ubuntu/git/wokaima-site.git`（本地路径、秒拉），
> `github` = GitHub（仅作云端存档，需要从本地推）。本地仓库对应新增 `server` remote。
> 自动部署钩子位于裸库 `hooks/post-receive`；把它里面的 `AUTO_DEPLOY` 改成 `0`，就退化成「只更新代码、不自动构建重启」。
>
> **`deploy.sh` 的「工作区检查」只看已跟踪文件**（`git status --porcelain --untracked-files=no`）：
> 本目录里长期存在 `data/wokaima.db*` 备份、`next` 之类未跟踪文件，若把它们也算作「脏」，
> 脚本会永远拒绝部署 —— 这正是「推了代码、线上死活不变」的另一半原因。

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
| **后台接口报错**（如 `leads` 缺列导致 `POST /api/mini/orders` 返 500） | **不再谎报成功**：下单页弹窗「订单已存在本机 · 同步到后台失败：请求失败（500）」；订单详情、我的订单页顶部出现「⚠️ N 笔订单还没同步到后台 + 原因」提示条和「重新同步」按钮 |
| 启动小程序 | `app.js onLaunch` 自动补传一次未同步订单，不用等用户翻到订单页 |
| 补传成功 | 提示条自动消失、`syncError` 清空、本地临时单号换成服务端单号 |
| 同步失败时进订单详情 | **不再显示「订单提交成功」绿横幅**（`created && !order.pendingSync`），避免误导 |

> 表里最后 4 条是小程序端 `utils/orders.js` 的**隔离回归测试**覆盖的（mock `wx` 的 storage、
> stub 掉 `api`/`auth`，7 个场景 23 条断言全过）；真机上的 UI 观感请用开发者工具再点一遍。

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
| POST | `/api/mini/orders/[orderNo]/cancel` | Bearer | 仅 `pending` 可取消 → `sub_status='已放弃'` + 来源/原因/时间（后台进「客户取消订单 · 待处理」） |
| POST | `/api/site/orders/lookup` | 手机号 + 姓名/公司名 | 官网「我的申请」查询（`/apply/lookup`）；逐行核验，不匹配的行不返回 |
| POST | `/api/site/orders/cancel` | 手机号 + 姓名/公司名 | 官网自助取消，写入口径与小程序取消**完全一致**（可选 `{ reason }`） |
| POST | `/api/admin/leads/[id]/cancel` | `admin_auth` cookie | 后台处理取消单：`{ result, note? }` → `handle_status/handle_result/handled_at` + `follow_ups`；`result='已回访挽回'` 时把订单复活回「待处理」 |

统一响应：`{ code, msg, data }`，`code === 0` 成功；`401` 令牌失效（小程序自动重登重试）。

### 6.1 官网自助取消（`/apply/lookup`）

官网表单是主要转化入口，客户临时反悔时手上未必有小程序，所以官网上也给了同一套撤单能力：

- 入口：页脚「租赁方案 · 查询 / 取消申请」、`/apply` 提交成功页的「查询 / 取消申请」。
- 核验：官网没有登录体系，用提交表单时的两项必填项自证 —— **手机号 + 姓名或公司名**。
  查询与取消都按行核验，不匹配的行一个字段都不返回（避免「随便填手机号就能读到客户姓名 / 地址」）。
  这是**软校验不是安全边界**，若要更硬，下一步接短信验证码（当前未做）。
- 可取消范围：只有 `待确认`（`status` ∈ `pending/new` 且 `sub_status` ≠ 已放弃）。
  已受理 / 已完成 一律回「请联系客服 138 8078 8802 取消」。
- 写入：`sub_status='已放弃'` + `tags` 追加「用户取消」+ 一条 `follow_ups`
  「[用户取消] 客户在官网「我的申请」自助取消（申请编号 WKxxxxxx），原因：xxx」，主状态 `status` 不动；
  同时写「客户取消订单」模块要的几列：`cancel_source='官网'`、`cancel_reason`（客户选填，见下）、
  `cancel_note`（选「其他原因」时补的原话）、`cancel_at`，`handle_status` 留空 = 未处理
  → 后台 `/admin/cancellations` 会出现这张单并计入红点，卡片上「原因」与「客户补充的原因」一起显示。
- 取消原因（选填，不拦取消）：`价格原因 / 已选别家 / 暂时不做 / 不想要了 / 信息填错 / 重复提交 / 其他原因`
  （白名单在 `lib/lead-status.ts` 的 `CANCEL_REASONS`，后台原因分布统计只认这几个值，
  客户随便传的值一律当成「未填写原因」）。小程序端同一份原因清单，取消接口可选传 `{ reason }`。
- 只有「其他原因」会就地展开一个输入框，客户补的那句话走 `reasonNote` 落 `cancel_note`：
  **自由文本不进 `cancel_reason`**，否则原因分布会被每个人的措辞拆成几十档。
  `/api/mini/orders/[orderNo]/cancel` 同样接收 `reasonNote`（小程序端当前用 ActionSheet，还没输入框）。
- 申请编号：`WK` + 6 位补零的 `leads.id`（如 `WK000021`），仅供客户与客服对号；
  小程序订单号是 `WK` + 14 位时间戳，两者不会撞。

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
