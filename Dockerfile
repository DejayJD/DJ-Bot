FROM node:latest
ADD . /dist
WORKDIR /dist
RUN npm install
RUN npm install -g nodemon
EXPOSE 3000 3001
CMD [ "nodemon", "server.js"]