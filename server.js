
//Import environment variables
require('./config.js');

//Setup a new application object
let App = require('./dist/src/app/classes/App.js');
let djApp = new App();

//Pass that application along to the spotify and slack portions
//Init Slack
require('./src/bots/slack/init.js')(djApp);
//Init Spotify
require('./src/spotify/init.js')(djApp);