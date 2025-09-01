# Frontend Build
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to run the build
RUN npm install -g serve

EXPOSE 3000

# Serve the build
CMD ["serve", "-s", "build", "-l", "3000"]
