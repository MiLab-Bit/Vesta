#!/bin/bash
# Vesta 一键更新：拉最新代码 -> 构建 -> 构建后校验 -> reload nginx
set -e
cd /opt/vesta

echo "[0/6] 前置检查"
if [ -n "$(git status --porcelain)" ]; then
  echo "!! 工作区有未提交改动, 拒绝部署(先 commit, 否则 pull 会被冲掉或失败):"
  git status --porcelain
  exit 1
fi

echo "[1/6] git pull"
git pull --ff-only

echo "[2/6] 安装依赖"
pnpm install --frozen-lockfile --registry=https://registry.npmmirror.com

echo "[3/6] 构建(sourcemap 已在 vite.config.ts 关闭)"
pnpm build

echo "[4/6] 构建后校验"
# 4a) 不允许 .map 出厂(2026-10: sourcemap 泄露事故)
if find dist -name "*.map" | grep -q .; then
  echo "!! dist 中发现 .map 文件, 中止部署:"
  find dist -name "*.map"
  exit 1
fi
# 4b) dist 不得含任何 key 形态串(VITE_* key 打进 bundle = 公网泄露)
if grep -rqE "AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|gh[pous]_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,}" dist/; then
  echo "!! dist 中发现疑似 API key, 中止部署(检查 .env.local 是否被误用于构建):"
  grep -roE "AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|gh[pous]_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,}" dist/ | head -5
  exit 1
fi
echo "校验通过: 无 .map, 无 key 形态串"

echo "[5/6] reload nginx"
systemctl reload nginx

echo "[6/6] 本地探活"
curl -fsS -o /dev/null -H "Host: vesta.sy-realm.ltd" http://127.0.0.1/ && echo "local 200 OK"

echo "Vesta deployed at $(date '+%F %T') | https://vesta.sy-realm.ltd"
