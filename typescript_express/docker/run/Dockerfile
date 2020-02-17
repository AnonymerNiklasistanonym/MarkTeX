FROM alpine:latest

# Install npm/nodejs
RUN apk add --update npm

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (only the production ones)
# (copy package.json AND package-lock.json)
COPY package.json .
RUN npm install --only=production

# Mark node build environment as production
ENV NODE_ENV="production"

# Copy built files
COPY dist .
COPY .env.docker .env

# Expose server port
EXPOSE 8080

# Run server (but only when the container is run)
CMD [ "npm", "run", "start" ]
