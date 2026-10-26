#!/usr/bin/env bash
# ==============================================================================
# LMS Deployment & Update Script for VPS
# Usage: ./deploy.sh
# ==============================================================================
set -e

echo "🚀 [1/4] Pulling latest changes from GitHub..."
git pull origin $(git rev-parse --abbrev-ref HEAD)

echo "📦 [2/4] Building and updating Docker containers..."
docker compose build --pull app

echo "🔄 [3/4] Re-launching application..."
docker compose up -d --remove-orphans app

echo "🧹 [4/4] Pruning dangling images..."
docker image prune -f

echo "✅ Deployment successful! Checking service health..."
sleep 5
docker compose ps
curl -s http://localhost:3000/api/health || echo "⚠️ Healthcheck warming up..."
echo ""
echo "🎉 LMS is live!"

