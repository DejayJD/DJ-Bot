# DJ-Bot
A radio bots for Slack that synchronizes dj between people in bots channels


# SETUP
```
DEV SERVER - nodemon server.js
COMPILER - npm run build-w
DB - sudo mongod
EXPOSE SLACK API - ngrok http -subdomain=dj-bot 3000
EXPOSE SPOTIFY API - ngrok http -subdomain=dj-bot-spotify 3001
```

# Starting the dev environment

In a terminal, start up node (it also needs to serve on port 3000):

`npm start` or `node server.js`

Also need to start up the database (on port 27017).
In a separate terminal run

`sudo mongod`

-- Note - DONT use nodemon, it will use up your api connections and kick you off
### Slackbot specific
Local tunnel the slack server so that slack can see local host.
Do this in a different terminal than the node

`lt --subdomain radio-bot --port 3000`

Then, you may need to authorize OAuth to your server, in that case, go to `localhost:3000/login` or `radio-bots.localtunnel.me/login` and authorize the app with the server

### Spotify specific
Spotify will start on port 3001 and slack will prompt the user if it needs authentication

# Deployment steps

First, ensure that the compose file is on the server (Skip for existing prod server)
~~~
scp docker-compose.yml ec2-user@54.191.64.155:/var/www/dj-bot -i <pem file>
~~~

Build and the container

~~~
docker build -t dj-bot .
docker save dj-bot > dj-bot.tar
~~~

Copy over the container

~~~
scp -i <pem file> dj-bot.tar ec2-user@54.191.64.155:/var/www/dj-bot
~~~

SSH to the server

~~~
ssh ec2-user@54.191.64.155 -i <pem file>
~~~

Remove the old build

~~~
docker stop controlcentral-test-web
docker rm controlcentral-test-web
docker rmi controlcentral-test-web
~~~

Load the app container

~~~
docker load -i dj-bot.tar
~~~

Run Docker Compose

~~~
cd /var/www/dj-bot & docker-compose up
~~~

The mongo container will be downloaded if its not already present.