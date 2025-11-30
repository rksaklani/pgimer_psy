FROM node:18-alpine

WORKDIR /app

# Copy common modules
COPY common ./common

# Copy service package files
COPY services/detailed-workup-service/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy service application code
COPY services/detailed-workup-service/src ./src

# Expose port
EXPOSE 3004

# Start service
CMD ["node", "src/index.js"]

