#!/bin/zsh
set -u

project_dir="${0:A:h}"
port="8765"
app_url="http://127.0.0.1:${port}/"
log_path="/tmp/boarding-pass-generator.log"

if curl --fail --silent --max-time 1 "$app_url" | grep -q "IATA 登机牌生成器"; then
  open "$app_url"
  exit 0
fi

if [[ ! -f "$project_dir/dist/index.html" ]]; then
  osascript -e 'display alert "无法启动登机牌生成器" message "缺少 dist/index.html，请先重新构建项目。" as critical'
  exit 1
fi

python3 -m http.server "$port" --bind 127.0.0.1 --directory "$project_dir/dist" >"$log_path" 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM

for attempt in {1..30}; do
  if curl --fail --silent --max-time 1 "$app_url" | grep -q "IATA 登机牌生成器"; then
    open "$app_url"
    echo "登机牌生成器已启动：$app_url"
    echo "关闭这个终端窗口即可停止本地服务。"
    wait "$server_pid"
    exit 0
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    osascript -e 'display alert "无法启动登机牌生成器" message "本地端口被占用或 Python 服务启动失败。详情见 /tmp/boarding-pass-generator.log" as critical'
    exit 1
  fi
  sleep 0.1
done

osascript -e 'display alert "无法启动登机牌生成器" message "本地服务启动超时。详情见 /tmp/boarding-pass-generator.log" as critical'
exit 1
