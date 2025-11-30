FROM node:18-alpine

WORKDIR /app

# Copy common modules
COPY common ./common

# Copy service package files
COPY services/adult-walk-in-clinical-performa-service/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy service application code
COPY services/adult-walk-in-clinical-performa-service/src ./src

# Expose port
EXPOSE 3003

# Start service
CMD ["node", "src/index.js"]

