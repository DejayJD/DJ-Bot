# Aux-Bot
A radio bot for Slack that synchronizes music between people in slack channels

# Starting the dev environment

SSH into Serveo so that slack can see your local host

`ssh -R 80:localhost:3000 radio-bot.serveo.net`

Then, in a separate terminal, start up node (it also needs to serve on port 3000):

`nodemon server.js`

Then, you may need to authorize OAuth to your server, in that case, go to `localhost:3000/login` or `radio-bot.localtunnel.me/login` and authorize the app with the server