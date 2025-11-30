FROM node:18-alpine

WORKDIR /app

# Copy common modules
COPY common ./common

# Copy service package files
COPY services/prescription/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy service application code
COPY services/prescription/src ./src

# Expose port
EXPOSE 3005

# Start service
CMD ["node", "src/index.js"]

