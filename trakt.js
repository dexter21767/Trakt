const axios = require('axios').default;

const cinemeta = require('./cinemeta');
const host = "https://api.trakt.tv";
//const myurl = "http://127.0.0.1:63355";
const myurl = "https://2ecbbd610840-trakt.baby-beamup.club/";
client = axios.create({
	headers: {
		"Content-type": "application/json",
		"trakt-api-key": "18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281",
		"trakt-api-version": 2
	}
});


async function request(url, header) {

	//console.log(url,'url');
	return await client
		.get(url, header)
		.then(res => {

			// console.log(`statusCode: ${res.status}`);
			return res;

		})
		.catch(error => {
			console.error(error);
			console.log('error');
		});

}

// rab1t 
function list(list_ids) {
	const promises = [];
	console.log(list_ids);
	for (let i = 0; i < list_ids.length; i++) {
		if (list_ids[i].split(':').length > 1) {
			var user_id = list_ids[i].split(':')[0];
			var list_id = list_ids[i].split(':')[1];
			var url = `${host}/users/${user_id}/lists/${list_id}/`;
		} else {
			var url = `${host}/lists/${list_ids[i]}/`;
		}
		console.log(url);
		promises.push(request(url));
	}
	return promises;
}

function popular(type) {
	if (type == "movie") {
		var url = `${host}/movies/popular`;
	} else if (type == "series") {
		var url = `${host}/shows/popular`;
	}
	return request(url).then(data => {
		const promises = [];
		items = data.data;
		var i = 0;
		while (i < 100 && i < items.length) {
			var item = items[i];
			console.log(i);
			console.log(item);
			if (item.ids.imdb) {
				promises.push(cinemeta(type, item.ids.imdb));
			}
			i++;
		}
		return promises;
	})
}

function trending(type, trakt_type) {
	if (type == "movie") {
		var url = `${host}/movies/trending`;
	} else if (type == "series") {
		var url = `${host}/shows/trending`;
	}
	return request(url).then(data => {
		const promises = [];
		items = data.data;
		var i = 0;
		while (i < 100 && i < items.length) {
			var item = items[i];
			console.log(i);
			console.log(item);
			if (item[trakt_type].ids.imdb) {
				promises.push(cinemeta(type, item[trakt_type].ids.imdb));
			}
			i++;
		}
		return promises;
	})
}

function watchlist(type, trakt_type, access_token) { //working

	const header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};

	var url = `${host}/sync/watchlist/${trakt_type}s/`;
	console.log(url);
	return request(url, header).then(data => { return getMeta(data.data, type, trakt_type); })
};

async function list_catalog(type, trakt_type, id) {
	console.log(type, id);
	var url = `${host}/lists/${id}/items/${trakt_type}`;
	var items = (await request(url)).data;
	return await getMeta(items, type, trakt_type);
}

function getMeta(items, type, trakt_type) {
	var promises = [];
	var i = 0;
	while (i < 100 && i < items.length) {
		var item = items[i];
		if (item.type == trakt_type) {
			console.log(i);
			console.log(item);
			if (item[item.type].ids.imdb) {
				console.log()
				promises.push(cinemeta(type, item[item.type].ids.imdb));
			}
		}
		i++;
	}
	return promises;

}

function recomendations(type, trakt_type, access_token) {

	var header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};

	var url = `${host}/sync/recommendations/${trakt_type}s/`;

	return request(url, header).then(data => { return getMeta(data.data, type, trakt_type); })
}

async function getToken(code) { //working
	const data = {
		"code": code,
		"client_id": "18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281",
		"client_secret": "d4214fec4f6f994b79f03430f19441120a44c67441c06cc1dd10dc92d7967b0c",
		"redirect_uri": myurl,
		"grant_type": "authorization_code"
	};
	const url = 'https://api.trakt.tv/oauth/token';
	return axios.post(url, data).then(res => {
		console.log(res.data.access_token);
		return (res.data.access_token)
	}).catch(error => {
		console.log(error);
	})
}




module.exports = { getToken, watchlist, recomendations, list, list_catalog, popular, trending, request, client };