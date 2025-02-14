FROM node:21.7.2-alpine3.19

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port specified in the environment variable or use a default value (e.g., 3000)
ENV PORT=3000
EXPOSE $PORT

RUN npm run build

# Command to run your application
CMD ["npm", "start"]
