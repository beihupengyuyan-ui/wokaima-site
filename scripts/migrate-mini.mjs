/**
 * 小程序对接用数据库迁移：给 leads 扩列 + 建索引。
 *
 * 用法（本地或服务器都能跑，可重复执行）：
 *   node scripts/migrate-mini.mjs
 *
 * 说明：SQLite 不支持 DROP COLUMN，ADD COLUMN 也不支持 IF NOT EXISTS，
 *      所以这里先用 PRAGMA table_info 探测，缺哪列补哪列。
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbFile = path.join(process.cwd(), "data", "wokaima.db");
if (!fs.existsSync(dbFile)) {
    console.error("✗ 找不到数据库文件：" + dbFile);
    process.exit(1);
}

const db = new Database(dbFile);
db.pragma("journal_mode = WAL");

const cols = db.prepare("PRAGMA table_info(leads)").all().map((c) => c.name);

const add = (name, ddl) => {
    if (cols.includes(name)) {
        console.log("  skip   " + name);
        return;
    }
    db.exec(`ALTER TABLE leads ADD COLUMN ${ddl}`);
    console.log("  added  " + name);
};

console.log("迁移 " + dbFile);
add("source", "source TEXT DEFAULT 'web'"); // 'web' | 'miniprogram'
add("openid", "openid TEXT"); // 微信用户归属
add("order_no", "order_no TEXT"); // WK+北京时间14位+3位随机
add("client_order_no", "client_order_no TEXT"); // 幂等键
add("items_json", "items_json TEXT"); // [{productId,name,qty,unit,dailyRent,monthlyRent}]
add("amount_daily", "amount_daily REAL DEFAULT 0"); // 服务端重算
add("amount_monthly", "amount_monthly REAL DEFAULT 0"); // 服务端重算
add("lease_term", "lease_term TEXT");
add("address", "address TEXT"); // 详细地址（region 存省市区+详细完整串）
add("updated_at", "updated_at TEXT");

// 后台工作台（/admin/leads/[id] 与 /api/admin/leads/[id]/update）依赖的三列。
// 它们比小程序对接更早存在，当初只在本机手工 ALTER 过、从没写进任何脚本，
// 于是线上库缺这三列时：admin 列表/详情只是读到 undefined（看起来正常），
// 但 POST /api/mini/orders 的 INSERT 显式写了这三列 → SQLite 抛
// "table leads has no column named sub_status" → 接口 500、订单永远进不来。
add("sub_status", "sub_status TEXT"); // 细粒度进度：已联系 / 已报价 / 已签约 / 已放弃…
add("follow_ups", "follow_ups TEXT"); // 跟进记录 JSON [{time,text}]
add("tags", "tags TEXT"); // 标签 JSON

db.exec("CREATE INDEX IF NOT EXISTS idx_leads_openid ON leads(openid)");
db.exec("CREATE INDEX IF NOT EXISTS idx_leads_order_no ON leads(order_no)");
db.exec("CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source, status)");
db.exec("CREATE INDEX IF NOT EXISTS idx_leads_client_order_no ON leads(client_order_no)");

console.log("\n✓ 迁移完成，当前 leads 字段：");
console.log("  " + db.prepare("PRAGMA table_info(leads)").all().map((c) => c.name).join(", "));
db.close();
