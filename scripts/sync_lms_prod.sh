#!/usr/bin/env bash
# ==============================================================================
# Automated LMS Data Importer & Synchronizer for Production VPS
# Usage: ./scripts/sync_lms_prod.sh
# ==============================================================================
set -e

echo "🚀 [1/3] Copying clean LMS datasets to MongoDB container..."
docker cp data lms-mongodb:/tmp/data
docker cp scripts/import_lms_mongo.js lms-mongodb:/tmp/import_lms_mongo.js

echo "🔄 [2/3] Synchronizing all courses, lessons, users & enrollments..."
docker exec lms-mongodb mongosh -u "${MONGO_ROOT_USER:-admin}" -p "${MONGO_ROOT_PASSWORD:-change-me-in-production}" --authenticationDatabase admin nextload /tmp/import_lms_mongo.js

echo "🧹 [3/3] Cleaning up temporary files inside container..."
docker exec lms-mongodb rm -rf /tmp/data /tmp/import_lms_mongo.js

echo "🎉 LMS Data Synchronized Successfully in Production!"

