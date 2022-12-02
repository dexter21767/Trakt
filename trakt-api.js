const axios = require('axios').default;
const config = require('./config.js');
const _ = require('underscore');
const NodeCache = require("node-cache");
const Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


const count = 100;
const host = config.host;
const myurl = config.local;

client = axios.create({
	headers: {
		"Content-type": "application/json",
		"trakt-api-key": config.API_KEY,
		"trakt-api-version": 2
	},timeout: 50000
});

async function request(url = String, header = Object) {

	return await client
		.get(url, header)
		.then(res => {
			return res;
		})
		.catch(error => {
			if (error.response) {
				console.error('error on trakt-api.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}

async function popular(type, genre, skip) {
	try {
		if (type == "movies") {
			var url = `${host}/movies/popular?page=${skip}&limit=${count}&extended=full`;
		} else if (type == "series") {
			var url = `${host}/shows/popular?page=${skip}&limit=${count}&extended=full`;
		}

		if (genre !== undefined) url += `&genres=${genre}`;

		data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		let items = ConvertToStremio(NormalizeLists(data.data));
		return items;
	} catch (e) {
		console.error(e);
	}
}

async function trending(trakt_type = String, genre, skip) {
	try {
		if (skip == undefined) {
			skip = 1;
		}
		var url = `${host}/${trakt_type}s/trending/?page=${skip}&limit=${count}&extended=full`;

		if (genre !== undefined) {
			url = url + `&genres=${genre}`;
		}

		data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		let items = ConvertToStremio(NormalizeLists(data.data, trakt_type));
		return items;

	}
	catch (e) {
		console.error(e)
	}
}

async function watchlist(access_token = String) { //working
	const header = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	var url = `${host}/sync/watchlist/?limit=${count}&extended=full`;
	data = await request(url,header);

	if (!data || !data.data) throw "error getting data (recommended list)";

	let items = ConvertToStremio(NormalizeLists(data.data));
	return items;

};

async function list_catalog(list) {
	try {
		let { id, username, access_token, genre, sort, skip } = list;
		const cached_id = username?`${id}:${username}`: id ;
		genre = genre ? genre : sort;
		let url, header;
		if (username) {
			if (access_token) {
				url = `${host}/users/${username}/lists/${id}/items?page=${skip}&limit=${count}&extended=full`;
				header = {
					headers: {
						"Authorization": `Bearer ${access_token}`
					}
				}
			}
		}
		else url = `${host}/lists/${id}/items/?page=${skip}&limit=${count}&extended=full`;

		data = await request(url, header);

		if (!data || !data.data) throw "error getting data (recommended list)";
		let NormalizedItems = NormalizeLists(data.data);

		let Cached = Cache.get(cached_id);
		
		if(Cached && Cached.length) {
			console.log("Cached",Cached.length);
			list = Cached.concat(NormalizedItems);
			console.log("list",list.length);
			list = filter(NormalizedItems);
			console.log("list",list.length);
			
		}else{
			list = NormalizedItems;
		}
		if(list) Cache.set(cached_id,list);
		console.log("list",list.length);
		items= SortList(list, genre);
		if(items && items.length>100){
			if((skip*100)<itmes.length) items = items.slice((skip-1)*100, skip*100);
			else items = items.slice(itmes.length-100,itmes.length);
		}
		if (items)  return ConvertToStremio(items)
		return ConvertToStremio(list)
	} catch (e) {
		console.error(e);
	}

}

async function recomendations(trakt_type = String, access_token = String, genre = String, skip) {
	try {

		let header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		};

		let url = `${host}/recommendations/${trakt_type}s?limit=${count}&extended=full`;
		if (skip !== undefined) url += `&page=${skip}`;
		if (genre !== undefined) url += `&genres=${genre}`;

		console.log("access_token",access_token)

		data = await request(url, header);
		if (!data || !data.data) throw "error getting data (recommended list)";

		let items = ConvertToStremio(NormalizeLists(data.data, trakt_type));
		return items;

	} catch (e) {
		console.error(e);
	}
}

function SortList(items = Array, sort = Array) {
	console.log('sorting', sort)

	if (sort && sort[0]!=',') {
		//sort = sort.split(' ');
		if (sort[0] == "added") {
			items = _.sortBy(items, "listed_at");
		}else{
			items = _.sortBy(items, function (item) { return item[sort[0]] });
		}
		if (sort[0].match(/(title||runtime)/g)) {
			items = items.reverse();
		}
		if (sort[1] == 'asc') {
			items = items.reverse();
		}
	}
	return items;
}

function ConvertToStremio(items = Array) {
	const metas = [];
	for (let i = 0; i < items.length; i++) {
		var item = items[i];

		if(item.ids){
			metas.push({
				"id": item.ids.imdb || ("trakt:" + item.ids.trakt),
				"type": item.type == "movie" ? "movie" : "series",
				"name": item.title,
				"poster": item.ids.imdb ? `https://images.metahub.space/poster/small/${item.ids.imdb}/img` : "",
				"background": item.ids.imdb ? `https://images.metahub.space/background/medium/${item.ids.imdb}/img` : "",
				"releaseInfo": item.year ? item.year.toString() : "N/A",
				"description": item.overview || '',
				"genres": item.genres || [],
				"trailers": item.trailer ? [{ source: item.trailer.split('?v=')[1], type: "Trailer" }] : []
			});
		}
	}
	return metas;
}

function NormalizeLists(list = Array, type = String) {
	const new_list = [];

	for (let i = 0; i < list.length; i++) {
		let new_element = {};
		const element = list[i];
		const keys = Object.keys(element);
		for (let keyid = 0; keyid < keys.length; keyid++) {
			let key = keys[keyid];
			if (key == element.type || key == type) {
				let subelement = element[key];
				const subkeys = Object.keys(subelement);
				for (let subkeyid = 0; subkeyid < subkeys.length; subkeyid++) {
					let subkey = subkeys[subkeyid];
					new_element[subkey] = subelement[subkey];
				}
			} else {
				new_element[key] = element[key];
			}
		}
		if (!new_element.type && type) new_element.type = type;
		new_list.push(new_element);
	}
	return new_list;
}

async function getToken(code = String) {
	const data = {
		"code": code,
		"client_id": config['client_id'],
		"client_secret": config['client_secret'],
		"redirect_uri": myurl,
		"grant_type": "authorization_code"
	};

	const url = `${host}/oauth/token`;

	return axios.post(url, data).catch(error => { return error });
}

async function listOfLists(query = String) {
	try {
		const popular = [];
		if (query == 'trending' || query == 'popular')  url = `${host}/lists/${query}/?limit=20`;
		else var url = `${host}/search/list/?query=${query}`;

		data = await request(url);
		if(!data || !data.data) throw "error";
		for (let i = 0; i < data.data.length; i++) {
			var list = data.data[i].list;
			if (list.privacy == "public") {
				popular.push({
					name: list.name,
					id: list.ids.trakt,
					user: list.user.ids.slug?list.user.ids.slug:list.user.username,
					slug:list.ids.slug,
					likes: list.likes,
					item_count: list.item_count,
					description: list.description,
					sort: list["sort_by"]+","+list["sort_how"]
				});
			}
		}
		return popular;

	} catch (e) {
		console.error(e);
	}
}

function list(list_ids = Array, access_token = String) {
	console.log("list_ids",list_ids)
	//return
	if (access_token) header = { headers: { "Authorization": `Bearer ${access_token}` } }

	const promises = [];

	for (let i = 0; i < list_ids.length; i++) {
		let id = list_ids[i];
		if (id.startsWith("trakt_list:")) id = id.replace('trakt_list:', '')
		console.log("id", id)
		let { url , sort } = idSplit(id);

		if (url) promises.push(request(url, header).then(data => { if (sort) { data.data.sort = sort }; return data }));
	}
	return promises;
}

function idSplit(id = String) {

	let list_id,sort,url,user_id;

	/*if (id.match(/\d+(:\w+:\w+)?/gi)) {
		list_id = id.split(':')[0];
		sort = id.split(':')[1].split(',');
		url = `${host}/lists/${id}/`;
	} else {
	*/	user_id = id.split(':')[0];
		list_id = id.split(':')[1];
		sort = id.split(':')[2].split(',');
		url = `${host}/users/${user_id}/lists/${list_id}/`;
	//}
	console.log(id,sort)
	return { list_id: list_id, user_id: user_id, sort: sort || [], url: url }

}

function filter(list) {	  
	let result = list.filter(
	  (element, index) => index === list.findIndex(
		other => element.id === other.id
		  //&& element.lastname === other.lastname
	  ));	
  return result;
}

module.exports = { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client, listOfLists };