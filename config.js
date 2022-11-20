var env = process.env.NODE_ENV ? 'beamup':'local';
require('dotenv').config();

var config = {
host: "https://api.trakt.tv",
'API_KEY': process.env.API_KEY,
'client_secret': process.env.client_secret,
'client_id': process.env.client_id
}

switch (env) {
    case 'beamup':
		config.port = process.env.PORT
        config.local = "https://2ecbbd610840-trakt.baby-beamup.club"
        break;

    case 'local':
		config.port = 63355
        config.local = "http://127.0.0.1:" + config.port;
        break;
}

module.exports = config;