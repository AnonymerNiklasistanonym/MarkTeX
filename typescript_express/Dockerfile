FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# (copy package.json AND package-lock.json)
COPY package*.json ./
RUN npm install --only=production

# Bundle app source??
COPY dist .

# Expose server port
EXPOSE 8080

# Run server
RUN npm run dist:start
