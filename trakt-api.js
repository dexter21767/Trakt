const axios = require('axios').default;
const config = require('./config.js');
const tmdbMeta = require('./tmdb.js');
const _ = require('underscore');

const NodeCache = require("node-cache");
const Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const { sort_array, host, count, local: myurl } = config;

client = axios.create({
	baseURL: host,
	headers: {
		"Content-type": "application/json",
		"trakt-api-key": config.API_KEY,
		"trakt-api-version": 2,
		"Accept-Encoding": "*"
	},
	timeout: 50000,
});

async function request(url = String, header = {}) {
	//console.log(header)

	return await client({
		method: 'get',
		url: url,
		headers: header.headers
	}).then(res => {
		return res;
	})
		.catch(error => {

			console.error(error);
			if (error.response) {
				console.error('error on trakt-api.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}

async function popular(user_data = {}) {
	try {
		const { trakt_type, type, access_token, genre, skip, RPDBkey } = user_data;

		let url = `/${trakt_type}s/popular/?extended=full`;

		if (!url) throw "error getting url";
		if (skip) url += `&page=${skip}`;
		if (count) url += `&limit=${count}`;
		if (genre) url += `&genres=${genre}`;

		const data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type), RPDBkey);
		return items;
	} catch (e) {
		console.error(e);
	}
}

async function trending(user_data = {}) {
	try {
		const { trakt_type, type, access_token, genre, skip, RPDBkey } = user_data;

		let url = `/${trakt_type}s/trending/?extended=full`;

		if (!url) throw "error getting url";
		if (skip) url += `&page=${skip}`;
		if (count) url += `&limit=${count}`;

		if (genre) url += `&genres=${genre}`;

		const data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type), RPDBkey);

		return items;
	}
	catch (e) {
		console.error(e)
	}
}

async function watchlist(user_data = {}) {
	try {

		const { trakt_type, type, access_token, genre, skip, RPDBkey } = user_data;

		if (!access_token) throw "access_token is required"
		const header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		};
		const url = `/sync/watchlist/?extended=full`;
		const data = await request(url, header);

		if (!data || !data.data) throw "error getting data (recommended list)";

		let items = NormalizeLists(data.data);

		if (genre && genre.length) items = SortList(items, genre);

		if (items && items.length > 100) {
			if ((skip * 100) < items.length) items = items.slice((skip - 1) * 100, skip * 100);
			else items = items.slice(items.length - 100, items.length);
		}

		if (items) return await ConvertToStremio(items, RPDBkey)

		return await ConvertToStremio(items, RPDBkey);
	} catch (e) {
		console.error(e)
	}
};

async function recomendations(user_data = {}) {
	try {
		const { trakt_type, type, access_token, genre, skip, RPDBkey } = user_data;


		if (!access_token) throw "access_token is required"

		const header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		};

		let url = `/recommendations/${trakt_type}s?limit=${count}&extended=full`;
		if (skip !== undefined) url += `&page=${skip}`;
		if (genre !== undefined) url += `&genres=${genre}`;

		//console.log("access_token", access_token)

		const data = await request(url, header);
		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type), RPDBkey);
		return items;

	} catch (e) {
		console.error(e);
	}
}

async function search(trakt_type = String, query = String, RPDBkey = {}) {
	try {

		let url = `/search/${trakt_type}?query=${encodeURIComponent(query)}&extended=full`;

		const data = await request(url);
		if (!data || !data.data) throw "error getting data (search)";
		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type), RPDBkey);

		return items;

	} catch (e) {
		console.error(e);
	}
}

async function list_catalog(list = {}) {
	try {

		//const { trakt_type, type, access_token, genre, skip, RPDBkey } = user_data;

		let { id, username, access_token, genre, sort, skip, RPDBkey } = list;
		const cached_id = username ? `${id}:${username}` : id;
		genre = genre ? genre : sort;

		const Cached = Cache.get(cached_id);

		if (Cached) return await ConvertToStremio(Cached, RPDBkey);
		else {
			let url, header;
			if (username) {
				url = `/users/${username}/lists/${id}/items?extended=full`;
				if (access_token) {
					header = {
						headers: {
							"Authorization": `Bearer ${access_token}`
						}
					}
				}
			}
			else url = `/lists/${id}/items/?extended=full`;
			//console.log(url)

			const data = await request(url, header);
			if (!data || !data.data) throw "error getting data (recommended list)";




			let items = NormalizeLists(data.data);

			if (genre && genre.length) items = SortList(items, genre);

			if (items && items.length > 100) {
				if ((skip * 100) < items.length) items = items.slice((skip - 1) * 100, skip * 100);
				else items = items.slice(items.length - 100, items.length);
			}

			if (items) return await ConvertToStremio(items, RPDBkey)
			/*
			const NormalizedItems = NormalizeLists(data.data);
			Cache.set(cached_id, NormalizedItems);
			const items = SortList(await ConvertToStremio(NormalizedItems,RPDBkey),genre);
			return items;*/
		}
	} catch (e) {
		console.error(e);
	}

}

function SortList(items = [], sort = []) {
	//console.log('sorting', sort)
	if (!sort || !sort.length || sort[0] == ',') return items;

	let [sort_by, sort_how] = sort;

	if (sort_by == "added") {
		items = _.sortBy(items, function (item) {
			return new Date(item['listed_at'])
		});
	}
	else if (sort_by == "released") {
		items = _.sortBy(items, function (item) {
			return new Date(item['released'])
		});
	}
	/*
	else if (sort_by == "popularity") {
		items = _.sortBy(items, function (item) {
			return (item.rating * item.votes);
		});
	}*/
	else if (sort_by == "rank") items = _.sortBy(items, "rank");
	else if (sort_by == "title") {
		items = _.sortBy(items, function (item) {
			str = item.title.toLowerCase();
			words = str.split(" ");
			if (words.length <= 1) return str;
			if (words[0] == 'a' || words[0] == 'the' || words[0] == 'an')
				return words.splice(1).join(" ");
			return str;
		});
	}
	else if (sort_by == "runtime") items = items = _.sortBy(items, "runtime");
	else if (sort_by == "votes") items = items = _.sortBy(items, "votes");
	else if (sort_by == "rating") items = items = _.sortBy(items, "rating");

	if (sort_how == 'asc') {
		items = items.reverse();
	}
	//console.log(items.slice(0,5));
	return items;
}

async function ConvertToStremio(items = [], RPDBkey = {}) {
	if (RPDBkey) RPDBkey.valid = await checkRPDB(RPDBkey);
	const metas = [];
	console.log('ConvertToStremio', items.length)
	for (let i = 0; i < items.length; i++) {
		const item = items[i];

		if (item.ids && item.type == "movie" || item.type == "show") {
			const type = item.type == "movie" ? "movie" : "series";
			const images = await getPoster(type, item.ids, RPDBkey);
			let meta = {
				"id": item.ids.imdb || ("trakt:" + item.ids.trakt),
				"type": type,
				"name": item.title,
				"poster": images.poster || '',
				"background": images.background || '',
				"releaseInfo": item.year ? item.year.toString() : (item.released?.split('-')[0] ? item.released.split('-')[0] : "N/A"),
				"description": item.overview || '',
				"genres": item.genres || [],
				"trailers": item.trailer ? [{ source: item.trailer.split('?v=')[1], type: "Trailer" }] : []
			}
            if(meta.type =="movie") meta.behaviorHints={"defaultVideoId": meta.id}
			metas.push(meta);
		}
	}
	return metas;
}

async function getImages(type = String, ids = Object) {
	let meta = {};
	if (ids.tmdb) {
		const images = await tmdb(type, ids.tmdb);
		//console.log(images)
		if (images) {
			if (images.poster) meta.poster = images.poster;
			if (images.background) meta.background = images.background;
		}
	}
	return meta
}

async function getPoster(type, IDs = {}, RPDBkey = {}) {
	//console.log('getPoster',type, IDs,RPDBkey)

	const { trakt, imdb, tmdb, tvdb } = IDs;
	const { key, valid, poster, posters, tier } = RPDBkey;
	const posterType = poster || 'poster-default';

	let meta = {
		poster:'',
		background:'',
	}
	let idType;
	if (imdb) idType = 'imdb';
	else if (tmdb) idType = 'tmdb';
	else if (tvdb) idType = 'tvdb';
	//console.log('idType',idType)
	if(!idType) return meta;

	if (key && valid) {
		meta.poster = `https://api.ratingposterdb.com/${key}/${idType}/${posterType}/${IDs[idType]}.jpg?fallback=true`;
		if(tier > 2){
			meta.background = `https://api.ratingposterdb.com/${key}/${idType}/backdrop-default/${IDs[idType]}.jpg?fallback=true`
		}
	} 
	if (imdb) {
		if(!meta.poster) meta.poster = `https://images.metahub.space/poster/small/${imdb}/img`;
		if(!meta.background) meta.background = `https://images.metahub.space/background/medium/${imdb}/img`;
	}
	//console.log('trakt',trakt,'tmdb',tmdb&&(!meta.poster || !meta.background))
	if(tmdb &&(!meta.poster || !meta.background)){
		const images = await tmdbMeta(type, tmdb);
		//console.log(images);
		if (images) {
			if (!meta.poster && images.poster) meta.poster = images.poster;
			if (!meta.background && images.background) meta.background = images.background;
		}
	}
	return meta;
}

async function checkRPDB(RPDBkey = {}) {
	let valid = false;
	try {
		validate = await client.get(`https://api.ratingposterdb.com/${RPDBkey.key}/isValid`)
		if (validate?.data?.valid) valid = validate.data.valid;
		else valid = false;
	} catch (e) {
		valid = false;
	}

	return valid;

}

function NormalizeLists(list = [], type = String) {
	const new_list = [];

	for (let i = 0; i < list.length; i++) {
		let new_element = {};
		const element = list[i];
		const keys = Object.keys(element);
		for (let keyid in keys) {
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

async function getToken({code ,refresh_token}) {
	let data = {
		"client_id": config['client_id'],
		"client_secret": config['client_secret'],
		"redirect_uri": myurl,
	};
	if(code) {
		data.code = code;
		data.grant_type = 'authorization_code';
	}
	else if(refresh_token){
		data.refresh_token = refresh_token;
		data.grant_type = 'refresh_token';
	}else{
		throw "code or refresh_token is required";
	}
	
	return client.post(`/oauth/token`, data)
}

async function listOfLists(query = String, token) {
	try {
		const popular = [];
		let url, header;
		if (query == 'trending' || query == 'popular') url = `/lists/${query}/?limit=20`;
		else if (query == 'personal') {
			if (token) {
				url = `/users/me/lists`;
				header = { headers: { "Authorization": `Bearer ${token}` } }
			}
			else return;
		}
		else url = `/search/list/?query=${query}`;
		console.log(url, header)

		data = await request(url, header);
		if (!data || !data.data) throw "error";
		for (let i = 0; i < data.data.length; i++) {
			const list = data.data[i].list ? data.data[i].list : data.data[i];
			if (list && ((list.privacy == "public") || token)) {
				popular.push({
					name: list.name,
					id: list.ids.trakt,
					user: list.user.ids.slug ? list.user.ids.slug : list.user.username,
					slug: list.ids.slug,
					likes: list.likes,
					item_count: list.item_count,
					description: list.description,
					sort: list["sort_by"] + "," + list["sort_how"]
				});
			}
		}
		return popular;

	} catch (e) {
		console.error(e);
	}
}

function list(list_ids = [], access_token) {
	let header;
	//console.log("list_ids", list_ids)
	if (access_token) header = { headers: { "Authorization": `Bearer ${access_token}` } }
	const promises = [];

	for (let i = 0; i < list_ids.length; i++) {
		let id = list_ids[i];
		if (id.startsWith("trakt_list:")) id = id.replace('trakt_list:', '')
		//console.log("id", id)
		const { url, sort } = idSplit(id);

		if (url) promises.push(request(url, header).then(data => { if (sort) { data.data.sort = sort }; return data }));
	}

	return promises;

}

function idSplit(id = String) {

	let list_id, sort, url, user_id;

	user_id = id.split(':')[0];
	list_id = id.split(':')[1];
	sort = id.split(':')[2].split(',');
	url = `/users/${user_id}/lists/${list_id}/`;
	//console.log(id, sort)
	return { list_id: list_id, user_id: user_id, sort: sort || [], url: url }

}

function filter(list = Array) {
	let result = list.filter(
		(element, index) => index === list.findIndex(
			other => element.id === other.id
			//&& element.lastname === other.lastname
		));
	return result;
}

async function list_cat(ids, access_token) {
	return Promise.allSettled(list(ids, access_token)).then(responses => {
		const promises = [];
		responses.forEach(res=>{
			if (res?.status == 'fulfilled') {
				let data = res.value.data;
				let name = data.name;
				let id = data.ids.trakt;
				let username = data.user.ids.slug || data.user.username;
				let sort = data.sort;
				let url, header;
				if (data.privacy == "private") url = `/users/${username}/lists/${id}/items`;
				else url = `/lists/${id}/items`;
				if (access_token) header = { headers: { "Authorization": `Bearer ${access_token}` } }

				promises.push(request(url, header).then(data => {
					if (data && data.data && data.data.length) {
						if (username) list_id = (sort && sort.length) ? `trakt_list:${username}:${id}:${sort}` : `trakt_list:${username}:${id}`;
						else list_id = (sort && sort.length) ? `trakt_list:${id}:${sort}` : `trakt_list:${id}`;

						return {
							"type": 'trakt',

							"id": list_id,

							"name": name,

							"extra": [{ "name": "genre", "isRequired": false, "options": sort_array }, { "name": "skip", "isRequired": false }]
						}
					}
				}));
			}
		})

		return Promise.allSettled(promises).then(catalogs => {


			catalogs.filter((element, index, arr) => {
				//console.log("element",arr[index])
				if (element.status == 'fulfilled') el = element.value
				else el = undefined
				catalogs[index] = el;
			});

			catalogs = catalogs.filter(Boolean);
			return (catalogs);
		});
	}).catch(error => { console.error(error) })
}

async function getMeta(type = String, id = String) {
	try {
		console.log(type, id);
		let url;
		if (type == "movie") url = `/movies/${id}?extended=full`
		if (type == "series") url = `/shows/${id}?extended=full`
		if (!url) throw "error creating url";

		const data = await request(url);
		if (!data || !data.data) throw "error getting data (getMeta)";
		const item = data.data;
		let meta = {
			id: id,
			type: type,
			name: item.title,
			genres: item.genres,
			description: item.overview,
			runtime: item.runtime,
			releaseInfo: item.year,
			imdbRating: item.rating,
			language: item.language,
			country: item.country,
			website: item.homepage
		}
		const ids = item.ids;
		if (type == "series") {
			const videos = [];
			const url = `/shows/${id}/seasons?extended=episodes`;
			const data = await request(url);
			if (!data || !data.data) throw "error getting data (getMeta)";
			data.data.forEach(function (season, index, array) {
				//console.log("element",season);
				season.episodes.forEach(function (episode, index, array) {
					videos.push({ id: `trakt:${id}:${episode.ids.trakt}:${episode.season}:${episode.number}`, title: episode.title, episode: episode.number, season: episode.season })
				})
			})
			meta.videos = videos;
		}
		return meta;
	} catch (e) {
		console.error(e);
	}
}


module.exports = { getToken, generic_lists: { watchlist, rec: recomendations, popular, trending }, list_catalog, list_cat, listOfLists, getMeta, search };