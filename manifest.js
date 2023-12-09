const fs = require('fs');
const config = require('./config.js')('beamup');

let manifest = {
    "id": "community.trakt-tv",
    "version": "0.2.6",
    "name": "Trakt Tv",
    "description": "Addon for getting Trakt's public and user lists, recommendations and watch list.",
    "logo": `${config.local}/public/logo.png`,
    "background": `${config.local}/public/background.png`,
    "catalogs": [],
    "resources": [{ "name": "meta", "types": [ "series","movie" ], "idPrefixes": [ "trakt:" ] }],
    "types": [], 
    "idPrefixes": [ "trakt" ],
    "behaviorHints": {
        "configurable": true,
        "configurationRequired": false
    }
}

fs.writeFileSync('./manifest.json', JSON.stringify(manifest));

//module.exports = manifest;