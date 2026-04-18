FROM node:20-alpine

# Install dos2unix to solve CRLF issues
RUN apk add --no-cache dos2unix

WORKDIR /app

# Optimization: Skip Puppeteer browser download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Step 1: Copy scripts first and normalize them immediately
COPY docker-entrypoint.sh ./
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Step 2: Dependencies
COPY package*.json ./
# Using npm install instead of ci as it can be more resilient to timeouts 
# and doesn't require a perfect package-lock during dev fixing.
RUN npm install --no-audit --no-fund

# Step 3: Prisma
COPY prisma ./prisma
RUN npx prisma generate

# Step 4: Source code
COPY . .

# Normalize everything else just in case
RUN find . -name "*.sh" -exec dos2unix {} +

# Build the application
RUN npm run build

EXPOSE 3000

# Use /bin/sh directly to avoid execution issues
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
