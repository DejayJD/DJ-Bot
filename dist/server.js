require('./config.js');
let App = require('./dist/app/classes/App');
let djApp = new App();
//Init Slack
require('./src/bots/slack/init.js')(djApp);
//Init Spotify
require('./src/spotify/init.js')(djApp);