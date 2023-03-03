FROM node:18-slim
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
ENTRYPOINT ["npm", "run", "db:generate"]
ENTRYPOINT ["npm", "run", "db:push"]
ENTRYPOINT ["npm", "run", "start"]
