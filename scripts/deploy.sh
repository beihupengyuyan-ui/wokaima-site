#!/usr/bin/env bash
# 沃凯玛官网 · 服务器全量部署脚本（在服务器上运行，不是在 Windows 本地）
#
# 用法：
#   cd /home/ubuntu/wokaima-site
#   bash scripts/deploy.sh                 # 常规发布
#   bash scripts/deploy.sh --install       # package.json 改过时，先装依赖再构建
#
# 依次做 7 件事：看版本 → 检查工作区 → 拉代码 → (可选)装依赖 → 备份并迁移数据库 → 构建 → 重启 pm2 → 自检。
# 任何一步失败都会立刻停下，绝不会带着半截状态去重启进程。
set -euo pipefail

APP_NAME="${APP_NAME:-wokaima}"
APP_DIR="${APP_DIR:-/home/ubuntu/wokaima-site}"
PORT="${PORT:-3000}"
DO_INSTALL=0

for arg in "$@"; do
    case "$arg" in
        --install) DO_INSTALL=1 ;;
        *) echo "未知参数：$arg（可用参数只有 --install）"; exit 2 ;;
    esac
done

cd "$APP_DIR"

echo "== 0. 出发前版本 =="
git log -1 --oneline

echo
echo "== 1. 检查服务器工作区 =="
if [ -n "$(git status --porcelain)" ]; then
    echo "✗ 服务器上有未提交的改动，git pull 会被拒绝。"
    echo "  这正是「本地推了代码、线上一直不变」最常见的原因：拉取失败，构建用的还是旧代码。"
    echo
    git status --short
    echo
    echo "  确认这些改动不需要保留后，二选一："
    echo "    git stash push -u -m 'server edits before deploy'   # 暂存，可恢复"
    echo "    git checkout -- . && git clean -fd                   # 直接丢弃"
    echo "  然后重新执行本脚本。"
    exit 1
fi
echo "工作区干净 ✓"

echo
echo "== 2. 拉取最新代码 =="
git fetch --prune origin
git pull --ff-only origin main
echo "拉取后版本：$(git log -1 --oneline)"

if [ "$DO_INSTALL" = "1" ]; then
    echo
    echo "== 3. 安装依赖 =="
    npm install
else
    echo
    echo "== 3. 跳过依赖安装 =="
    echo "（本次没改 package.json；若构建报找不到模块，请改用：bash scripts/deploy.sh --install）"
fi

echo
echo "== 4. 备份并迁移数据库 =="
if [ -f data/wokaima.db ]; then
    STAMP="$(date +%Y%m%d%H%M)"
    cp data/wokaima.db "data/wokaima.db.bak.$STAMP"
    echo "已备份：data/wokaima.db.bak.$STAMP"
else
    echo "⚠ 没找到 data/wokaima.db（首次部署会由迁移脚本新建）"
fi
node scripts/migrate-mini.mjs

echo
echo "== 5. 构建 =="
npm run build

echo
echo "== 6. 重启 pm2 =="
pm2 restart "$APP_NAME" --update-env
sleep 2
pm2 describe "$APP_NAME" | grep -E 'status|uptime' || true

echo
echo "== 7. 自检 =="
CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo '000')"
echo "首页 HTTP 状态：$CODE   （200 = 正常）"
echo -n "商品接口："
curl -s "http://127.0.0.1:$PORT/api/mini/products" | head -c 160 || true
echo
echo
echo "部署完成。线上版本：$(git log -1 --oneline)"
echo "如果浏览器还看到旧内容，先按 Ctrl+F5 强刷一次（静态资源带缓存）。"
