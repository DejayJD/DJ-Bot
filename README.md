# DJ-Bot
A radio bots for Slack that synchronizes dj between people in bots channels

# Starting the dev environment

In a terminal, start up node (it also needs to serve on port 3000):

`nodemon server.js`


### Slackbot specific
Local tunnel the slack server so that slack can see local host.
Do this in a different terminal than the node

`lt --subdomain radio-bot --port 3000`

Then, you may need to authorize OAuth to your server, in that case, go to `localhost:3000/login` or `radio-bots.localtunnel.me/login` and authorize the app with the server

### Spotify specific
In order to allow spotify authorization to manage your device, you need to login.
Go to `localhost:3001/login` to set up the auth.