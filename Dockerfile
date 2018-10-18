FROM node:8-jessie

MAINTAINER Sam Bengtson <sam.bengtson@gmail.com>

RUN apt-get update 
RUN apt-get install ca-certificates 
RUN apt-get upgrade

COPY package*.json ./
RUN npm install

COPY . .


CMD [ "npm", "start" ]

EXPOSE 8080