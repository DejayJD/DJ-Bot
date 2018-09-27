require('./config.js');
let App = require('./src/app/classes/App.js');
let djApp = new App();
//Init Slack
require('./src/bots/slack/init.js')(djApp);
//Init Spotify
require('./src/spotify/init.js')(djApp);