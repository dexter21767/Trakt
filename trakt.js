const axios = require('axios').default;
var _ = require('underscore');

const count = 100;
const host = "https://api.trakt.tv";
const myurl = "http://127.0.0.1:63355";
//const myurl = "https://2ecbbd610840-trakt.baby-beamup.club/";
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
			//console.error(error);
			console.error('error on trakt.js request:', error.response.status, error.response.statusText, error.config.url);
		});

}

// rab1t 
function list(list_ids) {
	console.log('list_ids',list_ids)
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

function popular(type, genre, skip) {
	if (type == "movies") {
		var url = `${host}/movies/popular?page=${skip}&limit=${count}&extended=full`;
	} else if (type == "series") {
		var url = `${host}/shows/popular?page=${skip}&limit=${count}&extended=full`;
	}
	if (genre !== undefined) {
		url = url + `&genres=${genre}`;
	}
	return request(url).then(data => {
		const metas = [];
		items = data.data;
		var i = 0;
		while (i < count && i < items.length) {
			var item = items[i];
			if (item.ids.imdb) {
				if (item.trailer) {
					var trailer = [{ source: item.trailer.split('?v=')[1], type: "Trailer" }];
					//var trailer = [{ "ytId":  item.trailer.split('?v=')[1]}];
				} else {
					var trailer = [];
				}
				var year = item.year ? item.year.toString() : "N/A";
				metas.push({
					"id": item.ids.imdb,
					"type": type =="movies"?"movie":"series",
					"name": item.title,
					"poster": `https://images.metahub.space/poster/small/${item.ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item.ids.imdb}/img`,
					"releaseInfo": year,
					"description": item.overview || '',
					"genres": item.genres || [],
					"trailers": trailer || []
				});
			}
			i++;
		}
		return metas;
	})
}

function trending(trakt_type, genre, skip) {
	if(skip == undefined){
		skip = 1;
	}
	var url = `${host}/${trakt_type}s/trending/?page=${skip}&limit=${count}&extended=full`;
	
	if (genre !== undefined) {
		url = url + `&genres=${genre}`;
	}
	
	return request(url).then(data => {
		const metas = [];
		items = data.data;
		var i = 0;
		while (i < count && i < items.length) {
			if(items[i].movie){
				var item = items[i].movie;
			}else if(items[i].show){
				var item = items[i].show;
			}
			if (item.ids.imdb) {
				if (item.trailer) {
					var trailer = [{ source: item.trailer.split('?v=')[1], type: "Trailer" }];
					//var trailer = [{ "ytId":  item[trakt_type].trailer.split('?v=')[1]}];
				} else {
					var trailer = [];
				}
				var year = item.year ? item.year.toString() : "N/A";
				metas.push({
					"id": item.ids.imdb,
					"type": item.type =="movie"?"movie":"series",
					"name": item.title,
					"poster": `https://images.metahub.space/poster/small/${item.ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item.ids.imdb}/img`,
					"releaseInfo": year,
					"description": item.overview || '',
					"genres": item.genres || [],
					"trailers": trailer || []
				});
			}
			i++;
		}
		return metas;
	})
}

function watchlist(access_token) { //working
	const header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	console.log(header);
	var url = `${host}/sync/watchlist/?limit=${count}&extended=full`;
	return request(url, header).then(data => { return getMeta(data.data); })
};

function list_catalog(id, sort, skip) {
	var url = `${host}/lists/${id}/items/?page=${skip}&limit=${count}&extended=full`;
	return request(url).then(data => { if(data !== undefined){return sortList(data.data, sort)} }).then(items => { if(items !== undefined){return getMeta(items)} });
}

function sortList(items, sort) {
	if (sort) {
		sort = sort.split(' ');
		if (sort[0] == "added") { sort[0] = "listed_at" }
		console.log(sort)
		if (sort[0] == "listed_at") {
			items = _.sortBy(items, sort[0]);
		} else {
			items = _.sortBy(items, function (item) { return item[item.type][sort[0]] });
		}
		if (sort[1] == 'desc') {
			items = items.reverse();
		}
	}
	return items;
}

function getMeta(items) {
	var metas = [];
	var i = 0;
	while (i < count && i < items.length) {
		var item = items[i];
		if(item.movie||item.show){
			if (item[item.type].ids.imdb) {
				if (item[item.type].trailer) {
					var trailer = [{ source: item[item.type].trailer.split('?v=')[1], type: "Trailer" }];
					//var trailer = [{"ytId": item[trakt_type].trailer.split('?v=')[1] }];
				} else {
					var trailer = [];
				}
				var year = item[item.type].year ? item[item.type].year.toString() : "N/A";
				metas.push({
					"id": item[item.type].ids.imdb,
					"type": item.type =="movie"?"movie":"series",
					"name": item[item.type].title,
					"poster": `https://images.metahub.space/poster/small/${item[item.type].ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item[item.type].ids.imdb}/img`,
					"releaseInfo": year,
					"description": item[item.type].overview || '',
					"genres": item[item.type].genres || [],
					"trailers": trailer || []
				});
			}
		}
		i++;
	}
	return metas;

}

function recomendations(access_token, genre, skip) {

	var header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	var url = `${host}/recommendations/?limit=${count}&extended=full`;
	if(skip!==undefined){
		url += `&page=${skip}`;
	}
	if (genre !== undefined) {
		url += `&genres=${genre}`;
	}
	//return request(url, header).then(data => { console.log(data.data); return getMeta(data.data, type, trakt_type); })
	return request(url).then(data => {
		const metas = [];
		items = data.data;
		var i = 0;
		while (i < count && i < items.length) {
			var item = items[i][items[i].type];
			console.log(item)
			if (item.ids.imdb) {
				if (item.trailer) {
					var trailer = [{ source: item.trailer.split('?v=')[1], type: "Trailer" }];
					//var trailer = [{ "ytId":  item.trailer.split('?v=')[1]}];
				} else {
					var trailer = [];
				}
				var year = item.year ? item.year.toString() : "N/A";
				metas.push({
					"id": item.ids.imdb,
					"type": item.type =="movie"?"movie":"series",
					"name": item.title,
					"poster": `https://images.metahub.space/poster/small/${item.ids.imdb}/img`,
					"background": `https://images.metahub.space/background/medium/${item.ids.imdb}/img`,
					"releaseInfo": year,
					"description": item.overview || '',
					"genres": item.genres || [],
					"trailers": trailer || []
				});
			}
			i++;
		}
		return metas;
	})
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


function listOfLists(query) {
	const popular = [];
	if(query == 'trending'|| query == 'popular'){
		var url = `${host}/lists/${query}/?limit=20`;
	}else{
		var url = `${host}/search/list/?query=${query}`;
	}
	return request(url).then(data => {
		for (let i = 0; i < data.data.length; i++) {
			var list = data.data[i].list;
			if (list.privacy == "public") {
				//console.log(list)
				popular.push({
					name: list.name,
					id: list.ids.trakt,
					user: list.user.name?list.user.name:list.user.username,
					likes: list.likes,
					item_count: list.item_count,
					description: list.description
				});
			}
		}
		return popular;
	});
}


module.exports = { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client, listOfLists };