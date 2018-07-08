const express = require('express');
const app = express();

app.get('/sync', (req, res) = > {
    res.send('You are now syncing with DJ-Bot!');
})

app.listen(3000, () = > {
    console.log('Example app listening on port 3000!');
})