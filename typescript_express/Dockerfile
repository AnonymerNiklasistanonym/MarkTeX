FROM node:latest

# TODO: Routing seemes not to work: `8080/profile` results in error

# TODO: Copy the `.env` file or better copy the `.env.docker` file as `.env`

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# (copy package.json AND package-lock.json)
COPY package*.json ./
RUN npm install --only=production

# Bundle app source??
# TODO: This will use the cache even when things were changed which should not be
COPY dist .
COPY .env.docker .env

# Expose server port
EXPOSE 8080

# Run server
RUN npm run start
