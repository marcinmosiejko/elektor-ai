# Start with the official Node.js image
FROM node:19.2-alpine3.15

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of your app's source code to the working directory
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD [ "node", "server/entry.express"]