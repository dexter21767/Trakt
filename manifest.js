const fs = require('fs');
const config = require('./config.js')('beamup');

let manifest = {
    "id": "community.trakt-tv",
    "version": "0.2.7",
    "name": "Trakt Tv",
    "description": "Addon for getting Trakt's public and user lists, recommendations and watch list.",
};

manifest = { ...manifest,
    "logo": `${config.local}/public/logoPS.png?ver=${manifest.version}`,
    "background": `${config.local}/public/background.png?ver=${manifest.version}`,
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