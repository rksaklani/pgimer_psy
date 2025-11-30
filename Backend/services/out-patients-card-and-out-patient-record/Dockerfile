FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/out-patients-card-and-out-patient-record/package*.json ./services/out-patients-card-and-out-patient-record/

# Install dependencies
RUN npm install

# Copy service code
COPY services/out-patients-card-and-out-patient-record ./services/out-patients-card-and-out-patient-record
COPY common ./common

WORKDIR /app/services/out-patients-card-and-out-patient-record

# Create uploads directory
RUN mkdir -p uploads/temp

EXPOSE 3002

CMD ["node", "src/index.js"]

