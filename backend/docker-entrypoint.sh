#!/bin/sh
set -eu

echo "Generating Prisma client..."
npx prisma generate

if [ "${PRISMA_MIGRATE_DEPLOY:-true}" = "true" ]; then
  echo "Applying Prisma migrations..."
  npx prisma migrate deploy
else
  echo "Skipping Prisma migrations because PRISMA_MIGRATE_DEPLOY=${PRISMA_MIGRATE_DEPLOY}"
fi

exec npm run start:prod
