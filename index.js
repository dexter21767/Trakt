const express = require('express');
const app = express();
const cors = require('cors');

const { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client } = require('./trakt.js');

const manifest = require("./manifest.json");
const landingTemplate = require('./landingTemplate');
const lists_array = { 'trakt_trending': "trakt - Trending", 'trakt_popular': "trakt - Popular", 'trakt_watchlist': "trakt - Watchlist", 'trakt_rec': "trakt - Recommended" };
const genres = ["action", "adventure", "animation", "anime", "comedy", "crime", "disaster", "documentary", "Donghua", "drama", "eastern", "family", "fan-film", "fantasy", "film-noir", "history", "holiday", "horror", "indie", "music", "musical", "mystery", "none", "road", "romance", "science-fiction", "short", "sports", "sporting-event", "suspense", "thriller", "tv-movie", "war", "western"];
const sort = ["added asc", "added desc", "title asc", "title desc", "released asc", "released desc", "runtime asc", "runtime desc", "votes asc", "votes desc" , "rating asc", "rating desc"];

app.use(cors())

app.get('/', (req, res) => {
	if (req.query.code) {
		getToken(req.query.code).then(data => {
			res.redirect('/configure/?access_token=' + data);
		}).catch(() => {
			res.redirect('/configure');
		})
	} else {
		res.redirect('/configure')
	}
});

app.get('/:configuration?/configure', (req, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('content-type', 'text/html');
	landingTemplate().then(template => { res.end(template) })
		.catch(error => console.log(error));
});

app.get('/manifest.json', (req, res) => {

	manifest.catalogs = [{
		"type": "movie",

		"id": "trakt_popular_movies",

		"name": "trakt - Popular movies",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "movie",

		"id": "trakt_trending_movies",

		"name": "trakt - Trending movies",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "series",

		"id": "trakt_popular_series",

		"name": "trakt - Popular series",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}, {
		"type": "series",

		"id": "trakt_trending_series",

		"name": "trakt - Trending series",

		"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
	}];


	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});

app.get('/:configuration?/manifest.json', (req, res) => {
	console.log(req.params);
	var catalog = [];
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	const configuration = req.params.configuration;


	if (configuration.split('|')[0].split('=')[1]) {
		var lists = configuration.split('|')[0].split('=')[1].split(',');
	} else {
		var lists = 0;
	}
	if (configuration.split('|')[1].split('=')[1]) {
		var ids = configuration.split('|')[1].split('=')[1].split(',');
		ids = ids.filter(Boolean);
	} else {
		var ids = 0;
	}
	if (configuration.split('|')[2]) {
		var access_token = configuration.split('|')[2].split('=')[1];
	} else {
		var access_token = 0;
	}
	console.log(lists, ids, access_token);

	var c = 0;

	if (lists) {
		for (let i = 0; i < lists.length; i++) {

			console.log(lists[i])
			if ((access_token.length > 0 && lists[i] == 'trakt_rec') || (lists[i] == 'trakt_trending' || lists[i] == 'trakt_popular')) {
				catalog[c] = {
					"type": "movie",

					"id": lists[i] + "_movies",

					"name": lists_array[lists[i]] + " movies",

					"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
				};
				c++;
				catalog[c] = {
					"type": "series",

					"id": lists[i] + "_series",

					"name": lists_array[lists[i]] + " series",

					"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
				};
				c++;
			} else if (access_token.length > 0 && lists[i] == 'trakt_watchlist') {
				catalog[c] = {
					"type": "movie",

					"id": lists[i] + "_movies",

					"name": lists_array[lists[i]] + " movies"
				};
				c++;
				catalog[c] = {
					"type": "series",

					"id": lists[i] + "_series",

					"name": lists_array[lists[i]] + " series"
				};
				c++;
			}
		}
	}
	if (ids) {
		list_cat(ids).then((data) => {
			manifest.catalogs = catalog.concat(data);
			manifest.catalogs = manifest.catalogs.filter(Boolean);
			res.send(manifest);
			res.end();
		}).catch((error) => {
			res.send(error);
			res.end();
			console.error(error);
		})
	} else {
		res.send(manifest);
		res.end();
	}
});


app.get('/:configuration?/:resource/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');


	if (req.params.resource == "catalog") {
		var { configuration, resource, type, id, extra } = req.params;
	} else if (req.params.resource == ("movie" || "series")) {
		//var { resource, type, id, extra } = req.params;
		var type = req.params.resource;
		var id = req.params.type;
		var extra = req.params.id;
	} else {
		var { resource, type, id, extra } = req.params;
	}
	if (extra !== undefined) {
		const params = new URLSearchParams(extra);
		console.log(params);
		//extra = extra.split('=');
		for (const [key, value] of params) {
			console.log('key', key, 'value', value);
			if (key == "genre") {

				var genre = value;
			} else if (key == "skip") {
				if (value >= 100) {
					var skip = (value / 100) + 1;
				}
				else {
					var skip = 0;
				}

			}
		}
	}
	console.log(configuration, resource, type, id);
	console.log('extra: genre:', genre, 'skip:', skip);
	if (configuration !== undefined) {
		if (configuration.split('|')[0].split('=')[1]) {
			var lists = configuration.split('|')[0].split('=')[1].split(',');

		} else {
			var lists = 0;
		} if (configuration.split('|')[1].split('=')[1]) {
			var ids = configuration.split('|')[1].split('=')[1].split(',');
			ids = ids.filter(Boolean);
		} else {
			var ids = 0;
		}

		var access_token;
		if (configuration.split('|')[2]) {
			access_token = configuration.split('|')[2].split('=')[1];
		}
	}

	if (type == "movie") {
		var trakt_type = "movie";
	} else if (type == "series") {
		var trakt_type = "show";
	}

	if (id.match(/trakt_list:[0-9]*/i)) {
		list_id = id.split(':')[1];
		console.log('trakt_list:', list_id);
		list_catalog(type, trakt_type, list_id, genre, skip).then(promises => {
			Promise.all(promises).then(metas => {
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
				console.log(metas.length);
				res.send(JSON.stringify({ metas: metas }));
				res.end();
			})
		})
	} else if (id.match(/trakt_[a-z]*/i)) {
		list_id = id.split('_')[1];
		console.log(list_id);

		if (list_id == "rec") {
			if (access_token) {
				recomendations(type, trakt_type, access_token, genre, skip).then(metas => {
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
				watchlist(type, trakt_type, access_token).then(metas => {
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
			trending(type, trakt_type, genre, skip).then(metas => {
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


async function list_cat(ids) {
	const host = "https://api.trakt.tv";
	return Promise.all(list(ids)).then(datas => {
		const promises = [];
		for (let i = 0; i < datas.length; i++) {
			if (datas[i] !== undefined) {
				var name = datas[i].data.name;
				var id = datas[i].data.ids.trakt;
				if (id) {
					promises.push(request(`${host}/lists/${id}/items/movie`, id, name, "movie"));
					promises.push(request(`${host}/lists/${id}/items/shows`, id, name, "series"));
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


async function request(url, id, name, type) {
	//console.log(url,'url');
	return await client
		.get(url, { timeout: 5000 })
		.then(res => {
			if (res.data.length) {
				return {
					"type": type,

					"id": "trakt_list:" + id,

					"name": name,

					"extra": [{ "name": "genre", "isRequired": true, "options": sort }, { "name": "skip", "isRequired": false }]
				}
			}
		})
		.catch(error => {
			if (error.response !== undefined) {
				console.error('error on index.js request:', error.response.status, error.response.statusText, error.config.url);
			} else {
				console.error(error);
			}
		});

}

module.exports = app
