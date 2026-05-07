#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_PID=""
WEB_PID=""
CLEANED_UP=0

cleanup() {
  if [ "$CLEANED_UP" -eq 1 ]; then
    return
  fi
  CLEANED_UP=1

  echo
  echo "Shutting down..."
  if [ -n "$WEB_PID" ]; then
    kill "$WEB_PID" 2>/dev/null || true
    wait "$WEB_PID" 2>/dev/null || true
  fi
  if [ -n "$API_PID" ]; then
    kill "$API_PID" 2>/dev/null || true
    wait "$API_PID" 2>/dev/null || true
  fi
  docker compose -f "$ROOT/docker-compose.yml" down --remove-orphans 2>/dev/null || true
  echo "Stopped."
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# --- pre-flight ---
for cmd in curl docker java mvn npm; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Error: '$cmd' is required but not found."; exit 1; }
done

# --- postgres ---
echo "[1/3] Starting PostgreSQL..."
docker compose -f "$ROOT/docker-compose.yml" up -d --wait postgres 2>/dev/null || {
  docker compose -f "$ROOT/docker-compose.yml" up -d postgres
  echo "       Waiting for PostgreSQL..."
  until docker compose -f "$ROOT/docker-compose.yml" exec -T postgres pg_isready -U freshmart -d freshmart >/dev/null 2>&1; do
    sleep 0.5
  done
}
echo "       PostgreSQL ready."

# --- api ---
echo "[2/3] Starting API..."
cd "$ROOT/freshmart/api"
echo "       Building API..."
mvn clean package -q -DskipTests -Dmaven.test.skip=true
java -jar target/*.jar &
API_PID=$!

echo "       Waiting for API..."
until curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; do
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "Error: API failed to start. See Maven output above."
    exit 1
  fi
  sleep 0.5
done
echo "       API ready — http://localhost:8080"

# --- web ---
echo "[3/3] Starting Web..."
echo
echo "  Web:  http://localhost:5173"
echo "  API:  http://localhost:8080"
echo
echo "Press Ctrl+C to stop."
echo

cd "$ROOT/freshmart/web"
npm run dev -- --strictPort &
WEB_PID=$!
wait "$WEB_PID"
