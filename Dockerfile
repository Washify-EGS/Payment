FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production --silent && mv node_modules ../ && npm install uuid && npm install express-session
COPY . .
EXPOSE 8002
CMD ["node", "index.js"]

