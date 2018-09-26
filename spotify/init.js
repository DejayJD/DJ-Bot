/*
 *  Created By JD.Francis on 9/25/18
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const port = 3001;
const querystring = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');
const _ = require('lodash');
const request = require('request');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT
});
let stateKey = 'spotify_auth_state';

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

// Retrieve an access token.
const searchString = 'Funk Dat sagat';
spotifyApi.clientCredentialsGrant().then(
    async function (data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        let token = data.body['access_token'];
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(token);
        // main();
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
);


async function search(searchString) {
    try {
        let data = await spotifyApi.searchTracks(searchString);
        // console.log('Funk Dat results', data.body);
        return data.body;
    }
    catch (e) {

    }
}


app.get('/login', function (req, res) {

    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    let scopes = [
        'user-read-private',
        'user-library-read',
        'user-read-email',
        'user-read-playback-state',
        'streaming',
        'user-modify-playback-state'
    ];
    let scope = _.join(scopes, ' ');
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.SPOTIFY_REDIRECT,
            state: state
        }));


});
app.get('/callback', function (req, res) {
    // your application requests refresh and access tokens
    var code = req.query.code || null;

    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    // after checking the state parameter

    if (state === null || state !== storedState) {
        console.error("Unable to auth user, state mismatch!");
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: process.env.SPOTIFY_REDIRECT,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                spotifyApi.setAccessToken(access_token);
                spotifyApi.setRefreshToken(refresh_token);

                // var options = {
                //     url: 'https://api.spotify.com/v1/me',
                //     headers: {'Authorization': 'Bearer ' + access_token},
                //     json: true
                // };
                //
                // // use the access token to access the Spotify Web API
                // request.get(options, function (error, response, body) {
                //     console.log(body);
                // });

                // // we can also pass the token to the browser to make requests from there
                // res.redirect('http://localhost' + port + '/#' +
                //     querystring.stringify({
                //         access_token: access_token,
                //         refresh_token: refresh_token
                //     }));
                res.status(200).send('Success!')
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/skip', async function (req, res) {
    try {
        await spotifyApi.skipToNext();
    }
    catch (e) {
        res.status(500).send(e);
    }
    res.status(200).send("Skipped");
});
app.get('/play', async function (req, res) {
    try {
        await spotifyApi.play();
        res.status(200).send("Playing");
    }
    catch (e) {
        res.status(500).send(e);
    }
});


currentSong = {
    currentUri: null,
    startTime: null
};
app.get('/funk-dat', async function (req, res) {
    try {
        let searchResults = await search(searchString);
        let firstTrack = searchResults.tracks.items[0];
        let uri = firstTrack.uri;
        await spotifyApi.play({uris:[uri]});
        currentSong.currentUri = uri;
        currentSong.startTime = new Date();
        res.status(200).send("FUNK DAT");
    }
    catch (e) {
        res.status(500).send(e);
    }
});



app.get('/sync', async function (req, res) {
    try {
        let playbackDifference = Math.abs(new Date() - currentSong.startTime);
        console.log(typeof playbackDifference);
        console.log(playbackDifference);
        await spotifyApi.play({uris:[currentSong.currentUri], 'position_ms':playbackDifference});
        res.status(200).send("Synced up!");
    }
    catch (e) {
        res.status(500).send(e);
    }
});

app.get('/pause', async function (req, res) {
    try {
        await spotifyApi.pause();
    }
    catch (e) {
        res.status(500).send(e);
    }
    res.status(200).send("FUNK DAT");
});

app.get('/current-playback', async function (req, res) {
    try {
        let searchResults = await search(searchString);
        let firstTrack = searchResults.tracks.items[0];
        await spotifyApi.play();
        // spotifyApi.transferMyPlayback()
    }
    catch (e) {
        res.status(500).send(e);
    }
    res.status(200).send("FUNK DAT");
});

app.get('/search', async function (req, res) {
    try {
        let searchString = req.query['searchString'];
        let searchResults = await search(searchString);
        let firstTrack = searchResults.tracks.items[0];
        res.status(200).send(firstTrack);
    }
    catch (e) {
        res.status(500).send(e);
    }
});

app.get('/express-test', function (req, res) {
    res.status(200).send("Server is working");
});
app.listen(port, () => console.log(`User login server listening on port ${port}!`));