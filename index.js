const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client, listOfLists } = require('./trakt.js');
const manifest = require("./manifest.json");
const { default: axios } = require('axios');
const { isGeneratorFunction } = require('util/types');

app.set('trust proxy', true)
app.use(cors());

app.use('/configure', express.static(path.join(__dirname, 'vue', 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'vue', 'dist', 'assets')));

const lists_array = { 'trakt_trending': "trakt - Trending", 'trakt_popular': "trakt - Popular", 'trakt_watchlist': "trakt - Watchlist", 'trakt_rec': "trakt - Recommended" };
const genres = ["action", "adventure", "animation", "anime", "comedy", "crime", "disaster", "documentary", "Donghua", "drama", "eastern", "family", "fan-film", "fantasy", "film-noir", "history", "holiday", "horror", "indie", "music", "musical", "mystery", "none", "road", "romance", "science-fiction", "short", "sports", "sporting-event", "suspense", "thriller", "tv-movie", "war", "western"];
const sort = ["added asc", "added desc", "title asc", "title desc", "released asc", "released desc", "runtime asc", "runtime desc", "votes asc", "votes desc", "rating asc", "rating desc"];


app.get('/', (req, res) => {
	if (req.query.code) {
		getToken(req.query.code).then(data => {
			if (data !== undefined) {
				res.redirect('/configure/?access_token=' + data);
			} else {
				res.redirect('/configure/?access_token_undefined');
			}
		}
		).catch(() => {
			res.redirect('/configure/?error_getting_access_token');
		})
	} else {
		res.redirect('/configure/')
	}
});

app.get('/:configuration?/configure', (req, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, publiccache-control: max-age=86400, stale-while-revalidate=43200, stale-if-error=86400, public');
	res.setHeader('content-type', 'text/html');
	res.sendFile(path.join(__dirname, 'vue', 'dist', 'index.html'));
});

app.get('/manifest.json', (req, res) => {

	manifest.catalogs = [{
		"type": "trakt",

		"id": "trakt_popular_movies",

		"name": "trakt - Popular movies",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "trakt",

		"id": "trakt_trending_movies",

		"name": "trakt - Trending movies",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "trakt",

		"id": "trakt_popular_series",

		"name": "trakt - Popular series",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "trakt",

		"id": "trakt_trending_series",

		"name": "trakt - Trending series",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}];


	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, publiccache-control: max-age=86400, stale-while-revalidate=43200, stale-if-error=86400, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});

app.get('/lists/:query', async (req, res) => {
	res.send(await listOfLists(req.params.query).catch(e => console.error));
});

app.get('/:configuration?/manifest.json', (req, res) => {
	console.log(req.params);
	var catalog = [];
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, publiccache-control: max-age=86400, stale-while-revalidate=43200, stale-if-error=86400, public');
	res.setHeader('Content-Type', 'application/json');
	configuration = req.params.configuration;
	if(configuration){
	if(!configuration.startsWith('lists')) configuration = atob(configuration);
	console.log("configuration",configuration)
	let lists, ids, access_token;
	if (configuration.split('|')[0].split('=')[1]) {
		lists = Object.fromEntries(new URLSearchParams(configuration.split('|')[0]));
	}
	if (configuration.split('|')[1].split('=')[1]) {
		ids = configuration.split('|')[1].split('=')[1].split(',');
		ids = ids.filter(Boolean);
		ids = ids.filter((c, index) => {
			return ids.indexOf(c) === index;
		});
	}
	if (configuration.split('|')[2]) {
		access_token = configuration.split('|')[2].split('=')[1];
	}
	console.log(lists, ids, access_token);

	var c = 0;
	if (lists) {
		for (let i = 0; i < lists.length; i++) {

			if ((lists[i] == 'trakt_trending' || lists[i] == 'trakt_popular') || (access_token.length > 0 && lists[i] == 'trakt_rec')) {
				catalog[c] = {
					"type": 'trakt',

					"id": lists[i] + "_movies",

					"name": lists_array[lists[i]] + " movies",

					"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
				};
				c++;
				catalog[c] = {
					"type": "trakt",

					"id": lists[i] + "_series",

					"name": lists_array[lists[i]] + " series",

					"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
				};
				c++;
			} else if (access_token.length > 0 && lists[i] == 'trakt_watchlist') {
				catalog[c] = {
					"type": 'trakt',

					"id": lists[i],

					"name": lists_array[lists[i]]
				};
				c++;
			}
		}
	}

	if (ids) {
		list_cat(ids, access_token).then((data) => {
			manifest.catalogs = catalog.concat(data);
			manifest.catalogs = manifest.catalogs.filter(Boolean);
			res.send(manifest);
			res.end();
		}).catch((error) => {
			res.send(error);
			res.end();
			console.error(error);
		})
	}
	} else {
		manifest.catalogs = catalog;
		manifest.catalogs = manifest.catalogs.filter(Boolean);
		res.send(manifest);
		res.end();
	}
});


app.get('/:configuration?/catalog/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, publiccache-control: max-age=86400, stale-while-revalidate=43200, stale-if-error=86400, public');
	res.setHeader('Content-Type', 'application/json');
	let { configuration, type, id, extra } = req.params;

	console.log('req.params', req.params);
	let skip,genre;
	skip=0;
	if (extra) {
	if (extra) params = Object.fromEntries(new URLSearchParams(extra));
	console.log(params)
	if (params) genre = params['genre'];
	if (genre) genre = genre.split(' ');
	if (params) skip = params['skip'];
	if (skip && skip >= 100) skip = Math.round(skip / 100);
	if(!skip) skip = 0;
	}
	skip++;

	console.log(configuration, type, id);
	console.log('extra: genre:', genre, 'skip:', skip);
	let lists, ids, access_token;
	if (configuration) {
		configuration = atob(configuration);
		if (configuration.split('|')[0].split('=')[1]) {
			lists = configuration.split('|')[0].split('=')[1].split(',');
		}
		if (configuration.split('|')[1].split('=')[1]) {
			ids = configuration.split('|')[1].split('=')[1].split(',');
			ids = ids.filter(Boolean);
			ids = ids.filter((c, index) => {
				return ids.indexOf(c) === index;
			});
		}
		if (configuration.split('|')[2]) {
			access_token = configuration.split('|')[2].split('=')[1];
		}
	}
	let sort,username;
	if (id.match(/trakt_list:([0-9]*||([\w]*:[\w]*))/i)) {
		if(id.match(/trakt_list:\d*(:\w*,\w*)?/gi)){
			list_id = id.split(':')[1];
			sort = id.split(":")[2].split(',');
		}else{
			list_id = id.split(':')[1];
			username = id.split(':')[2];
			sort = id.split(":")[3].split(',');
			
		}
		if (genre == undefined && id.split(':').length == 4) {
			genre = [id.split(':')[2], id.split(':')[3]]
		}
		console.log('list_id:', list_id, 'username', username,'sort',sort);
		console.log(id);
		list_catalog({id:list_id, username, access_token, genre,sort, skip}).then(metas => {
			if (metas) {
				console.log(metas.length);
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
				console.log(metas.length);
			}
			res.send(JSON.stringify({ metas: metas }));
			res.end();
		})
	} else if (id.match(/trakt_[a-z]*/i)) {
		list_id = id.split('_')[1];
		type = id.split('_')[2];
		if (type == "movies") {
			trakt_type = "movie";
		} else if (type == "series") {
			trakt_type = "show";
		}
		console.log(list_id);

		if (list_id == "rec") {
			if (access_token) {
				recomendations(trakt_type, access_token, genre, skip).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				}).catch(() => {
					res.end();
				})
			}
		} else if (list_id == "watchlist") {
			if (access_token) {
				watchlist(access_token).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				}).catch(() => {
					res.end();
				})
			}
		}
		else if (list_id == "trending") {
			trending(trakt_type, genre, skip).then(metas => {
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
				res.send(JSON.stringify({ metas: metas }));
				res.end();

			}).catch(() => {
				res.end();
			})

		}
		else if (list_id == "popular") {
			popular(type, genre, skip).then(metas => {
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
				res.send(JSON.stringify({ metas: metas }));
				res.end();
			}).catch(() => {
				res.end();
			})

		} else {
			res.end();
		}


	} else {
		res.end();
	}
})


async function list_cat(ids, access_token) {
	const host = "https://api.trakt.tv";
	return Promise.all(list(ids, access_token)).then(datas => {
		const promises = [];
		for (let i = 0; i < datas.length; i++) {
			if (datas[i]) {
				let data = datas[i].data
				let name = data.name;
				let id = data.ids.trakt;
				let username = data.user.username;
				let sort = data.sort;
				if (data.privacy == "private") {
					promises.push(request(`${host}/users/${username}/lists/${id}/items`, access_token, id, name, username).then(data=>{if(sort){data.id+=':'+sort};return data}));
				}
				else {
					promises.push(request(`${host}/lists/${id}/items`, access_token, id, name).then(data=>{if(sort){data.id+=':'+sort};return data}));
				}
			}
		}
		return promises;
	}).then(promises => {
		return Promise.all(promises).then(catalogs => {
			catalogs = catalogs.filter(Boolean);
			return (catalogs);
		});
	}).catch(error => { console.error(error) })
}


async function request(url, access_token, id, name, username) {
	//console.log(url,'url');
	if (access_token) {
		var header = {
			headers: {
				"Authorization": `Bearer ${access_token}`
			}
		}
	}
	return await client
		.get(url, header, { timeout: 5000 })
		.then(res => {
			if (res.data.length) {
				if (username) {
					return {
						"type": 'trakt',

						"id": "trakt_list:" + username + ":" + id,

						"name": name,

						"extra": [{ "name": "genre", "isRequired": false, "options": sort }, { "name": "skip", "isRequired": false }]
					}
				} else {
					return {
						"type": 'trakt',

						"id": "trakt_list:" + id,

						"name": name,

						"extra": [{ "name": "genre", "isRequired": false, "options": sort }, { "name": "skip", "isRequired": false }]
					}
				}

			}
		})
		.catch(error => {
			if (error.response) {
				console.error('error on index.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}

module.exports = app
