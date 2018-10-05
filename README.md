# DJ-Bot
A radio bots for Slack that synchronizes dj between people in bots channels

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