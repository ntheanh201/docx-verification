FROM node:14.15.1-alpine3.10 as builder
MAINTAINER ginnerversmile@gmail.com
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14.15.1-alpine3.10 as production
WORKDIR /usr/app
COPY --from=builder /usr/src/app ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]


