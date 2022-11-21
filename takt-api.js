const axios = require('axios').default;
const config = require('./config.js');

async function request(url, header) {

	return await client
		.get(url, header, { timeout: 5000 })
		.then(res => {
			return res;
		})
		.catch(error => {
			if (error.response) {
				console.error('error on index.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}
