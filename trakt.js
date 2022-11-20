const axios = require('axios').default;
const _ = require('underscore');
const config = require('./config.js');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const count = 100;
const host = config.host;
const myurl = config.local;

client = axios.create({
	headers: {
		"Content-type": "application/json", 
		"trakt-api-key": config.API_KEY,
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
			if (error.response) {
				console.error('error on index.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}

function list_catalog(list) {
	let {id, username, access_token, genre,sort, skip}=list;
	genre = genre?genre:sort;
	let cache_id,url,header;
	if (username) {
		if (access_token) {
			cache_id = username+'_'+id;
			url = `${host}/users/${username}/lists/${id}/items?page=${skip}&limit=${count}&extended=full`;
			header = {
				headers: {
					"Authorization": `Bearer ${access_token}`
				}
			}
	}} else {
		url = `${host}/lists/${id}/items/?page=${skip}&limit=${count}&extended=full`;
		cache_id = id;
	}
		return request(url, header).then(data => { 
			if (data != undefined) { 
				var list = cache.get(cache_id);
				console.log('list from cache',(list && list.length)?list.length:list)
				if(list && list.length) {
					list = list.concat(data.data);
					list = filter(list);			
					
				}else{
					list = data.data;
				}
				console.log('list length',data.data.length)
				cache.set(cache_id,list)
				console.log('total list length',list.length)
				console.log("skip",skip)
				//return list.slice((skip-1)*100, skip*100);
				items= sortList(list, genre).slice((skip-1)*100, skip*100);
				if (items !== undefined) { return getMeta(items)}

			}
		})
}

function filter(list) {	  
	  let result = list.filter(
		(element, index) => index === list.findIndex(
		  other => element.id === other.id
			//&& element.lastname === other.lastname
		));	
	return result;
}

// rab1t 
function list(list_ids, access_token) {
	console.log('list_ids', list_ids)
	if (access_token) {
		var header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		}
	}
	const promises = [];
	for (let i = 0; i < list_ids.length; i++) {
		console.log("list_ids",list_ids[i])
		let list_id,user_id,sort,url;
		if(list_ids[i].match(/trakt_list:\d*(:\w*,\w*)?/gi)){
			
			list_id = list_ids[i].split(':')[1];
			sort = list_ids[i].split(':')[2].split(',')
			url = `${host}/lists/${list_ids[i]}/`;

		//if (list_ids[i].split(':').length > 1 && list_ids[i].split(':')[2].length) {
		} else {
			user_id = list_ids[i].split(':')[0];
			list_id = list_ids[i].split(':')[1];
			sort = list_ids[i].split(':')[2].split(',')
			url = `${host}/users/${user_id}/lists/${list_id}/`;

		}


		promises.push(request(url, header).then(data=>{if(sort){data.data.sort=sort};return data}));

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
					"type": type == "movies" ? "movie" : "series",
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
	if (skip == undefined) {
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
			if (items[i].movie) {
				var item = items[i].movie;
			} else if (items[i].show) {
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
					"type": trakt_type == "movie" ? "movie" : "series",
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
	var url = `${host}/sync/watchlist/?limit=${count}&extended=full`;
	return request(url, header).then(data => { return getMeta(data.data); })
};



function sortList(items, sort) {
	console.log('sorting',sort)
	if (sort) {
		//console.log(items)
		//sort = sort.split(' ');
		if (sort[0] == "added") {
			items = _.sortBy(items, "listed_at" );
		}else {
			items = _.sortBy(items, function (item) { return item[item.type][sort[0]] });
		}
		if (sort[0].match( /(title||runtime)/g)) {
			items = items.reverse();
		}
		if (sort[1] == 'asc') {
			items = items.reverse();
		}
	}
	return items;
}

function getMeta(items) {
	var metas = [];
	var i = 0;
	while (i < items.length) {
		var item = items[i];
		if (item.movie || item.show) {
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
					"type": item.type == "movie" ? "movie" : "series",
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

function recomendations(trakt_type, access_token, genre, skip) {

	var header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	var url = `${host}/recommendations/${trakt_type}s?limit=${count}&extended=full`;
	if (skip !== undefined) {
		url += `&page=${skip}`;
	}
	if (genre !== undefined) {
		url += `&genres=${genre}`;
	}
	console.log(url)
	//return request(url, header).then(data => { console.log(data.data); return getMeta(data.data, type, trakt_type); })
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
					"type": trakt_type == "movie" ? "movie" : "series",
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
		"client_id": config['client_id'],
		"client_secret": config['client_secret'],
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
	if (query == 'trending' || query == 'popular') {
		var url = `${host}/lists/${query}/?limit=20`;
	} else {
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
					user: list.user.name ? list.user.name : list.user.username,
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