#!/usr/bin/env bash
# summer2077.com 发布脚本：新建 release 目录 → 校验 → 原子切换 current → 线上检查。
#
# 用法：
#   DEPLOY_HOST=deploy@<服务器IP> [DEPLOY_KEY=~/.ssh/summer2077_deploy] [DEPLOY_PORT=22] \
#     scripts/deploy.sh [--dry-run] [--check-only]
#
#   --dry-run     只在本地打包并列出将发布的文件，不连接服务器
#   --check-only  不发布，只检查线上站点
#
# 仓库里不保存任何主机、用户或密钥；全部来自环境变量。
# 只发布 HEAD 中已提交的文件，工作区有未提交改动时拒绝发布。
# 依赖：bash、git、ssh、tar、curl、sha256sum（Windows 请在 Git Bash 或 WSL 中运行）。
set -euo pipefail

SITE_URL="${SITE_URL:-https://summer2077.com}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/personal-site}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
# 默认不清理旧 release；设置 KEEP_RELEASES=N 才只保留最近 N 个。
KEEP_RELEASES="${KEEP_RELEASES:-0}"

# 发布白名单：Web 根目录只包含这些路径。deploy/、docs/、scripts/、
# README.md、AGENTS.md、CLAUDE.md、.claude/、.workbuddy/ 等一律不发布。
PUBLISH_PATHS=(
  index.html
  404.html
  robots.txt
  sitemap.xml
  site.webmanifest
  baidu_verify_codeva-O70Xp4Tsme.html
  about
  projects
  blog
  css
  js
  assets
)

DRY_RUN=0
CHECK_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --check-only) CHECK_ONLY=1 ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "未知参数：$arg" >&2; exit 2 ;;
  esac
done

log() { printf '\n==> %s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# ---------- 线上检查 ----------
check_site() {
  local failed=0 code url body

  expect() { # expect <期望状态码> <URL>
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$2" || echo 000)"
    if [[ "$code" == "$1" ]]; then
      printf '  ok   %s %s\n' "$code" "$2"
    else
      printf '  FAIL %s（期望 %s）%s\n' "$code" "$1" "$2"
      failed=1
    fi
  }

  log "检查 sitemap 中的每个 canonical URL"
  while read -r url; do
    expect 200 "$url"
  done < <(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed -E 's#</?loc>##g')

  log "检查发布文件、404 与跳转"
  expect 200 "$SITE_URL/robots.txt"
  expect 200 "$SITE_URL/sitemap.xml"
  expect 200 "$SITE_URL/site.webmanifest"
  expect 404 "$SITE_URL/this-page-should-not-exist-$(date +%s)/"
  expect 404 "$SITE_URL/deploy/summer2077.com.nginx.conf"
  expect 404 "$SITE_URL/README.md"
  expect 301 "https://www.summer2077.com/"
  expect 301 "http://summer2077.com/"

  body="$(curl -sS --max-time 20 "$SITE_URL/baidu_verify_codeva-O70Xp4Tsme.html" || true)"
  if [[ "$body" == "$(cat baidu_verify_codeva-O70Xp4Tsme.html)" ]]; then
    echo "  ok   百度验证文件内容一致"
  else
    echo "  FAIL 百度验证文件内容不一致"; failed=1
  fi

  body="$(curl -sS --max-time 20 "$SITE_URL/sitemap.xml" || true)"
  if [[ "$body" == "$(cat sitemap.xml)" ]]; then
    echo "  ok   线上 sitemap.xml 与本地 HEAD 一致"
  else
    echo "  FAIL 线上 sitemap.xml 与本地 HEAD 不一致"; failed=1
  fi

  return "$failed"
}

if [[ "$CHECK_ONLY" == 1 ]]; then
  check_site && { log "线上检查全部通过"; exit 0; } || fail "线上检查有失败项"
fi

# ---------- 本地打包 ----------
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || fail "工作区有未提交改动，请先提交或暂存。"

COMMIT="$(git rev-parse --short=7 HEAD)"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$COMMIT"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

log "打包 $RELEASE_ID（提交 $(git rev-parse HEAD)）"
for p in "${PUBLISH_PATHS[@]}"; do
  git cat-file -e "HEAD:$p" 2>/dev/null || fail "白名单路径不在 HEAD 中：$p"
done
git archive --format=tar HEAD "${PUBLISH_PATHS[@]}" | tar -x -C "$STAGE/"

# 防止意外文件进入 Web 根目录
if find "$STAGE" \( -name '.*' -o -name '*.md' -o -name '*.conf' -o -name '*.sh' \) | grep -q .; then
  find "$STAGE" \( -name '.*' -o -name '*.md' -o -name '*.conf' -o -name '*.sh' \)
  fail "打包结果包含不应公开的文件"
fi

MANIFEST="$STAGE.sha256"
(cd "$STAGE" && find . -type f | LC_ALL=C sort | xargs sha256sum) > "$MANIFEST"
FILE_COUNT="$(wc -l < "$MANIFEST")"
echo "共 $FILE_COUNT 个文件，清单："
sed 's/^/  /' "$MANIFEST"

if [[ "$DRY_RUN" == 1 ]]; then
  log "dry-run 结束，未连接服务器"
  rm -f "$MANIFEST"
  exit 0
fi

# ---------- 上传与切换 ----------
[[ -n "${DEPLOY_HOST:-}" ]] || fail "请设置 DEPLOY_HOST，例如 DEPLOY_HOST=deploy@<服务器IP>"
SSH_OPTS=(-p "$DEPLOY_PORT" -o BatchMode=yes)
[[ -n "${DEPLOY_KEY:-}" ]] && SSH_OPTS+=(-i "$DEPLOY_KEY" -o IdentitiesOnly=yes)
SSH_CMD="ssh ${SSH_OPTS[*]}"

RELEASES="$DEPLOY_ROOT/releases"
PARTIAL="$RELEASES/.$RELEASE_ID.partial"

log "上传到 $DEPLOY_HOST:$PARTIAL"
$SSH_CMD "$DEPLOY_HOST" "set -e; test -d '$RELEASES'; mkdir '$PARTIAL'"
find "$STAGE" -type d -exec chmod 755 {} +
find "$STAGE" -type f -exec chmod 644 {} +
tar -C "$STAGE" -cf - . | $SSH_CMD "$DEPLOY_HOST" "tar -xf - -C '$PARTIAL'"
# 清单放在 Web 根目录之外，供事后审计
$SSH_CMD "$DEPLOY_HOST" "cat > '$RELEASES/$RELEASE_ID.sha256'" < "$MANIFEST"

log "服务器端校验并原子切换 current"
# shellcheck disable=SC2087
$SSH_CMD "$DEPLOY_HOST" bash -s <<REMOTE
set -euo pipefail
cd '$PARTIAL'
sha256sum --quiet -c '$RELEASES/$RELEASE_ID.sha256'
actual=\$(find . -type f | wc -l)
[[ "\$actual" == "$FILE_COUNT" ]] || { echo "文件数不一致：\$actual != $FILE_COUNT" >&2; exit 1; }
mv '$PARTIAL' '$RELEASES/$RELEASE_ID'
previous=\$(readlink -f '$DEPLOY_ROOT/current' || true)
ln -sfn '$RELEASES/$RELEASE_ID' '$DEPLOY_ROOT/.current.tmp'
mv -Tf '$DEPLOY_ROOT/.current.tmp' '$DEPLOY_ROOT/current'
echo "current -> \$(readlink '$DEPLOY_ROOT/current')"
echo "上一个 release：\$previous"
# 仅在 KEEP_RELEASES>0 时清理，从不删除 current 指向的目录
if [[ $KEEP_RELEASES -gt 0 ]]; then
cur=\$(readlink -f '$DEPLOY_ROOT/current')
ls -1dt '$RELEASES'/*/ | sed 's#/\$##' | tail -n +$((KEEP_RELEASES + 1)) | while read -r old; do
  [[ "\$old" == "\$cur" ]] || { rm -rf -- "\$old"; rm -f -- "\$old.sha256"; echo "已清理 \$old"; }
done
fi
REMOTE

log "线上检查"
if check_site; then
  log "发布完成：$RELEASE_ID"
else
  echo
  echo "线上检查有失败项。回滚到上一个 release："
  echo "  $SSH_CMD $DEPLOY_HOST \"ln -sfn $RELEASES/<上一个release> $DEPLOY_ROOT/.current.tmp && mv -Tf $DEPLOY_ROOT/.current.tmp $DEPLOY_ROOT/current\""
  exit 1
fi
