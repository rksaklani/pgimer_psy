FROM node:18-alpine

WORKDIR /app

# Copy common modules first
COPY common ./common

# Copy service package files
COPY services/user/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy service application code
COPY services/user/src ./src

# Expose port
EXPOSE 3001

# Start service
CMD ["node", "src/index.js"]

