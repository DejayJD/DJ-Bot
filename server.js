
process.env.CLIENT_ID = '395029622549.394776996867';
process.env.CLIENT_SECRET = '8007d39b304bfc0c0496ea24983911ef';
process.env.SLACK_PORT = 3000;
process.env.VERIFICATION_TOKEN = 'VJf6iTCMoHNed3onBEtDAQsW';
process.env.SPOTIFY_PORT = 3001;

require('./slack/init.js');
require('./spotify/app.js');