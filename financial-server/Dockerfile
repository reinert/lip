FROM node:alpine

WORKDIR /financial

COPY package*.json .env ./
RUN mkdir ./logs

RUN apk --no-cache add postgresql-client

#RUN npm install && \
#    npm cache clean --force

RUN yarn
