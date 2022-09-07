const axios = require('axios').default;

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

	return await client
		.get(url, header, { timeout: 5000 })
		.then(res => {
			return res;
		})
		.catch(error => {
			console.error(error);
		});

}

// rab1t 
function list(list_ids) {
	const promises = [];
	for (let i = 0; i < list_ids.length; i++) {
		if (list_ids[i].split(':').length > 1) {
			var user_id = list_ids[i].split(':')[0];
			var list_id = list_ids[i].split(':')[1];
			var url = `${host}/users/${user_id}/lists/${list_id}/`;
		} else {
			var url = `${host}/lists/${list_ids[i]}/`;
		}
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
		const metas = [];
		items = data.data;
		var i = 0;
		while (i < 100 && i < items.length) {
			var item = items[i];
			console.log(i);
			console.log(item);
			if (item.ids.imdb) {
				metas.push({
					"id": item.ids.imdb,
					"type": type,
					"name": item.title,
					"poster": `https://images.metahub.space/poster/small/${item.ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item.ids.imdb}/img`,
					"releaseInfo": item.year
				});
			}
			i++;
		}
		return metas;
	})
}

function trending(type, trakt_type) {

	var url = `${host}/${trakt_type}s/trending`;

	return request(url).then(data => {
		const metas = [];
		items = data.data;
		var i = 0;
		while (i < 100 && i < items.length) {
			var item = items[i];
			console.log(i);
			console.log(item);
			if (item[trakt_type].ids.imdb) {
				metas.push({
					"id": item[trakt_type].ids.imdb,
					"type": type,
					"name": item[trakt_type].title,
					"poster": `https://images.metahub.space/poster/small/${item[trakt_type].ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item[trakt_type].ids.imdb}/img`,
					"releaseInfo": item[trakt_type].year
				});
			}
			i++;
		}
		return metas;
	})
}

function watchlist(type, trakt_type, access_token) { //working

	const header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	var url = `${host}/sync/watchlist/${trakt_type}s/`;
	return request(url, header).then(data => { return getMeta(data.data, type, trakt_type); })
};

function list_catalog(type, trakt_type, id) {
	var url = `${host}/lists/${id}/items/${trakt_type}`;
	return request(url).then(data => { return getMeta(data.data, type, trakt_type) })
		;
}

function getMeta(items, type, trakt_type) {
	var metas = [];
	var i = 0;
	while (i < 100 && i < items.length) {
		var item = items[i];
		if (item.type == trakt_type) {
			if (item[item.type].ids.imdb) {
				metas.push({
					"id": item[trakt_type].ids.imdb,
					"type": type,
					"name": item[trakt_type].title,
					"poster": `https://images.metahub.space/poster/small/${item[trakt_type].ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item[trakt_type].ids.imdb}/img`,
					"releaseInfo": item[trakt_type].year
				});
			}
		}
		i++;
	}
	console.log('metas', metas)
	return metas;

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
		return (res.data.access_token)
	}).catch(error => {
		console.error(error);
	})
}

module.exports = { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client };