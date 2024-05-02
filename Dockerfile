FROM node:alpine

WORKDIR /dist

COPY . .

USER nobody

EXPOSE 3000