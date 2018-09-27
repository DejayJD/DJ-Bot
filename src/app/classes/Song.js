class Song {
    uri; // spotify uri
    startTime; // song start time - will be null if not played yet
    endTime; // song finish time - will be null if currently going on
    albumCover; // album artwork
    emotes; // list of emotes the song got
    saved; // list of people who saved it
}
module.exports = Song;