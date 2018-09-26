/*
 *  Created By JD.Francis on 9/25/18
 */


currentSongStart = new Date();
function getCurrentPlayTime() {

}

function sync(bot, message) {
    bot.replyPrivate(message, "Syncing up at " + getCurrentPlayTime());
    console.log('FUNK DAT');
}

module.exports = sync;

