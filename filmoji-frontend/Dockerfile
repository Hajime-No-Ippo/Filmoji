# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies with verbose logging if it fails
RUN npm ci --prefer-offline --no-audit 2>&1 || npm install

COPY . .

# Run build with verbose output
RUN npm run build -- --logLevel info 2>&1

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
