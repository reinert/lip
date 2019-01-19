FROM node:alpine

WORKDIR /auth

COPY package*.json .env config.json ./
COPY .keys ./.keys
RUN mkdir ./logs

#RUN npm install && \
#    npm cache clean --force

RUN yarn
