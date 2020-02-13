FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Mark node build environment as production
ENV NODE_ENV="production"

# Install app dependencies (only the production ones)
# (copy package.json AND package-lock.json)
COPY package.json .
RUN npm install --only=production

# Copy built files
COPY dist .
COPY .env.docker .env

# Expose server port
EXPOSE 8080

# Run server
RUN npm run start
