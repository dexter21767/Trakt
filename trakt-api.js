const axios = require('axios').default;
const config = require('./config.js');
const tmdb = require('./tmdb.js');
const _ = require('underscore');

const NodeCache = require("node-cache");
const Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const { sort_array, host, count, local: myurl } = config;

client = axios.create({
	baseURL:host,
	headers: {
		"Content-type": "application/json",
		"trakt-api-key": config.API_KEY,
		"trakt-api-version": 2,
		"Accept-Encoding": "gzip,deflate,compress"
	}, 
	timeout: 50000,
});

async function request(url = String, header = Object) {
	console.log(header)

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

async function popular(user_data = Object) {
	try {
		const { trakt_type, type, access_token, genre, skip } = user_data;

		let url = `${host}/${trakt_type}s/popular/?extended=full`;

		if (!url) throw "error getting url";
		if (skip) url += `&page=${skip}`;
		if (count) url += `&limit=${count}`;
		if (genre) url += `&genres=${genre}`;

		const data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type));
		return items;
	} catch (e) {
		console.error(e);
	}
}

async function trending(user_data = Object) {
	try {
		const { trakt_type,type, access_token, genre, skip } = user_data;

		let url = `${host}/${trakt_type}s/trending/?extended=full`;

		if (!url) throw "error getting url";
		if (skip) url += `&page=${skip}`;
		if (count) url += `&limit=${count}`;

		if (genre) url += `&genres=${genre}`;

		const data = await request(url);

		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type));

		return items;
	}
	catch (e) {
		console.error(e)
	}
}

async function watchlist(user_data = Object) { 
	try {

		const { trakt_type: trakt_type, type: type, access_token: access_token, genre: genre, skip: skip } = user_data;

		if (!access_token) throw "access_token is required"
		const header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		};
		const url = `${host}/sync/watchlist/?extended=full`;
		const data = await request(url, header);

		if (!data || !data.data) throw "error getting data (recommended list)";

		let items = NormalizeLists(data.data);

		if (genre && genre.length) items = SortList(items, genre);

		if (items && items.length > 100) {
			if ((skip * 100) < items.length) items = items.slice((skip - 1) * 100, skip * 100);
			else items = items.slice(items.length - 100, items.length);
		}

		if (items) return await ConvertToStremio(items)

		return await ConvertToStremio(items);
	} catch (e) {
		console.error(e)
	}
};

async function recomendations(user_data = Object) {
	try {

		const { trakt_type: trakt_type, type: type, access_token: access_token, genre: genre, skip: skip } = user_data;

		if (!access_token) throw "access_token is required"

		const header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		};

		let url = `${host}/recommendations/${trakt_type}s?limit=${count}&extended=full`;
		if (skip !== undefined) url += `&page=${skip}`;
		if (genre !== undefined) url += `&genres=${genre}`;

		console.log("access_token", access_token)

		const data = await request(url, header);
		if (!data || !data.data) throw "error getting data (recommended list)";

		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type));
		return items;

	} catch (e) {
		console.error(e);
	}
}

async function search(trakt_type = String, query = String) {
	try {

		let url = `${host}/search/${trakt_type}?query=${encodeURIComponent(query)}&extended=full`;

		const data = await request(url);
		if (!data || !data.data) throw "error getting data (search)";
		const items = await ConvertToStremio(NormalizeLists(data.data, trakt_type));

		return items;

	} catch (e) {
		console.error(e);
	}
}

async function list_catalog(list = Object) {
	try {
		let { id, username, access_token, genre, sort, skip } = list;
		const cached_id = username ? `${id}:${username}` : id;
		genre = genre ? genre : sort;
		let list_elements;

		const Cached = Cache.get(cached_id);

		if (Cached) list_elements = Cached;
		else {
			let url, header;
			if (username) {
				url = `${host}/users/${username}/lists/${id}/items?extended=full`;
				if (access_token) {
					header = {
						headers: {
							"Authorization": `Bearer ${access_token}`
						}
					}
				}
			}
			else url = `${host}/lists/${id}/items/?extended=full`;
			console.log(url)
			if (!url) throw "no url";

			const data = await request(url, header);
			if (!data || !data.data) throw "error getting data (recommended list)";
			const NormalizedItems = NormalizeLists(data.data);
			const headers = data.headers;
			let { 'x-pagination-page': page, 'x-pagination-page-count': pagesCount } = data.headers;
			console.log(page, pagesCount);
			if (Cached && Cached.length && Cached.length != pagesCount) Cache.del(cached_id)

			list_elements = [];
			list_elements.length = pagesCount - 1;
			list_elements[page] = NormalizedItems;
			Cache.set(cached_id, list_elements);

		}




		list = list_elements.flat(1)

		listFiltered = filter(list);

		items = SortList(listFiltered, genre);

		if (items && items.length > 100) {
			if ((skip * 100) < items.length) items = items.slice((skip - 1) * 100, skip * 100);
			else items = items.slice(items.length - 100, items.length);
		}
		if (items) return await ConvertToStremio(items)
		return await ConvertToStremio(list_elements)
	} catch (e) {
		console.error(e);
	}

}

function SortList(items = Array, sort = Array) {
	console.log('sorting', sort)

	if (!sort || !sort.length || sort[0] == ',') return items;

	let [sort_by, sort_how] = sort;

	if (sort_by == "added") {
		items = _.sortBy(items, function (item) {
			return  new Date(item['listed_at'])
		});
	}
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
	else if (sort_by == "released") items =  _.sortBy(items, "released");
	else if (sort_by == "runtime") items = items = _.sortBy(items, "runtime");
	else if (sort_by == "votes") items = items = _.sortBy(items, "votes");
	else if (sort_by == "rating") items = items = _.sortBy(items, "rating");

	if (sort_how == 'asc') {
		items = items.reverse();
	}

	return items;
}

async function ConvertToStremio(items = Array) {
	const metas = [];
	for (let i = 0; i < items.length; i++) {
		const item = items[i];

		if (item.ids) {
			let type = item.type == "movie" ? "movie" : "series"
			let meta = {
				"id": item.ids.imdb || ("trakt:" + item.ids.trakt),
				"type": type,
				"name": item.title,
				"poster": item.ids.imdb ? `https://images.metahub.space/poster/small/${item.ids.imdb}/img` : "",
				"background": item.ids.imdb ? `https://images.metahub.space/background/medium/${item.ids.imdb}/img` : "",
				"releaseInfo": item.year ? item.year.toString() : "N/A",
				"description": item.overview || '',
				"genres": item.genres || [],
				"trailers": item.trailer ? [{ source: item.trailer.split('?v=')[1], type: "Trailer" }] : []
			}
			const ids = item.ids;
			if (!ids.imdb && ids.tmdb) {
				const images = await getImages(type, ids);
				if (images.poster) meta.poster = images.poster;
				if (images.background) meta.background = images.background;
			}

			metas.push(meta);
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

async function listOfLists(query = String, token) {
	try {
		const popular = [];
		let url, header;
		if (query == 'trending' || query == 'popular') url = `${host}/lists/${query}/?limit=20`;
		else if (query == 'personal') {
			if (token) {
				url = `${host}/users/me/lists`;
				header = { headers: { "Authorization": `Bearer ${token}` } }
			}
			else return;
		}
		else url = `${host}/search/list/?query=${query}`;
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

function list(list_ids = Array, access_token) {
	let header;
	console.log("list_ids", list_ids)
	if (access_token) header = { headers: { "Authorization": `Bearer ${access_token}` } }
	const promises = [];

	for (let i = 0; i < list_ids.length; i++) {
		let id = list_ids[i];
		if (id.startsWith("trakt_list:")) id = id.replace('trakt_list:', '')
		console.log("id", id)
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
	url = `${host}/users/${user_id}/lists/${list_id}/`;
	console.log(id, sort)
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
	return Promise.allSettled(list(ids, access_token)).then(datas => {
		const promises = [];
		for (let i = 0; i < datas.length; i++) {
			if (datas[i] && datas[i].status == 'fulfilled') {
				let data = datas[i].value.data
				let name = data.name;
				let id = data.ids.trakt;
				let username = data.user.username;
				let sort = data.sort;
				let url, header;
				if (data.privacy == "private") url = `${host}/users/${username}/lists/${id}/items`;
				else url = `${host}/lists/${id}/items`;
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
		}

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
		if (type == "movie") url = `${host}/movies/${id}?extended=full`
		if (type == "series") url = `${host}/shows/${id}?extended=full`
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
		if (!ids.imdb && ids.tmdb) {
			const images = await getImages(type, ids);
			if (images.poster) meta.poster = images.poster;
			if (images.background) meta.background = images.background;
		}
		if (type == "series") {
			const videos = [];
			const url = `${host}/shows/${id}/seasons?extended=episodes`;
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

async function getImages(type = String, ids = Object) {
	let meta = {};
	if (ids.tmdb) {
		const images = await tmdb(type, ids.tmdb);
		console.log(images)
		if(images){
		if (images.poster) meta.poster = images.poster;
		if (images.background) meta.background = images.background;
	}}
	return meta
}

module.exports = { getToken, generic_lists: { watchlist, rec: recomendations, popular, trending }, list_catalog, list_cat, listOfLists, getMeta, search };