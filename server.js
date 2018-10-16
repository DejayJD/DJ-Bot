//Import environment variables
require('./environmentVars.js');
require('./dist/services/ServiceManager.js');
require('log-timestamp')(function() {
	let currentTime = new Date();
	currentTime.setHours(currentTime.getHours() - 5);
	return currentTime.toLocaleString() + ' --- %s' 
})

//Setup a new application object
//If ever needing massive performance, this could be separated
const App = require('./dist/classes/App.js').App;
let djApp = new App();

//Pass that application along to the spotify and slack portions
//Init Slack
require('./dist/servers/slack.js')(djApp);
//Init Spotify
require('./dist/servers/spotify.js')(djApp);
