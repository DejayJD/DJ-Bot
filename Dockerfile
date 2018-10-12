FROM node:latest
RUN mkdir -p /usr/dist/app
WORKDIR /usr/dist/app
COPY package.json /usr/dist/app/
RUN npm install -g forever
RUN npm install
COPY . /usr/dist/app
EXPOSE 3000 3001 80
CMD [ "npm", "start"]