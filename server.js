
//Import environment variables
require('./config.js');

//Setup a new application object
//If ever needing massive performance, this could be separated
const App = require('./dist/app/classes/App.js').App;
let djApp = new App();

//Pass that application along to the spotify and slack portions
//Init Slack
require('./dist/bots/slack/init.js')(djApp);
//Init Spotify
require('./dist/spotify/init.js')(djApp);