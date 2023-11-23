# Use an official Node.js runtime as the base image
FROM node:18.13.0

# Set the working directory in the container
WORKDIR /

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install
RUN npm install fluent-ffmpeg
RUN npm install ffmpeg-static
RUN npm install -g ytdl-core@4.9.1 --save --save-exact
RUN npm install -g ytpl@latest --save --save-exact

# Copy the rest of your application's source code to the container
COPY . .

# Expose the port your app will run on
EXPOSE 8000

# Define the command to run your Node.js application
CMD [ "node", "beatbuddy.js" ]
