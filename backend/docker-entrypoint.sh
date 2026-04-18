#!/bin/sh
set -e

echo "--- Starting TrackMyExpenses Entrypoint ---"

# Step 1: Wait for Database
echo "Validating database connection..."
MAX_RETRIES=20
COUNT=0

# Loop until check-db.ts succeeds or MAX_RETRIES is reached
until npx ts-node check-db.ts || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "Database not ready. Waiting 3s... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 3
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "CRITICAL: Database connection failed after $MAX_RETRIES attempts. Exiting."
  exit 1
fi

echo "Database is ready!"

# Step 2: Ensure Prisma Client is generated
echo "Updating Prisma Client..."
npx prisma generate

# Step 3: Run Migrations (if enabled)
if [ "${PRISMA_MIGRATE_DEPLOY:-true}" = "true" ]; then
  echo "Applying Prisma migrations..."
  npx prisma migrate deploy
else
  echo "Skipping Prisma migrations (PRISMA_MIGRATE_DEPLOY=${PRISMA_MIGRATE_DEPLOY})"
fi

echo "--- Startup Complete: Starting Application ---"

# Step 4: Execute the application command
exec npm run start:prod
