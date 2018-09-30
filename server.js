
//Import environment variables
const Service = require('./dist/app/services/ServiceManager.js').Service;
const UserService = require('./dist/app/services/UserService').UserService;

require('./environmentVars.js');
require('./dist/app/services/service-manager.js');

//Setup a new application object
//If ever needing massive performance, this could be separated
const App = require('./dist/app/classes/App.js').App;
let djApp = new App();

//Pass that application along to the spotify and slack portions
//Init Slack
require('./dist/bots/slack/server.js')(djApp);
//Init Spotify
require('./dist/spotify/servers/server.js')(djApp);
