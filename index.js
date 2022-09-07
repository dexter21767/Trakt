const express = require('express');
const app = express();
const cors = require('cors');

const { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client } = require('./trakt.js');

var manifest = require("./manifest.json");
const landingTemplate = require('./landingTemplate');
var lists_array = { 'trakt_trending': "trakt - Trending", 'trakt_popular': "trakt - Popular", 'trakt_watchlist': "trakt - Watchlist", 'trakt_rec': "trakt - Recommended" };
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
	res.setHeader('content-type', 'text/html');
	res.end(landingTemplate());
});

app.get('/manifest.json', (req, res) => {

	manifest.catalogs = [{
		"type": "movie",

		"id": "trakt_popular",

		"name": "trakt - Popular movies"
	}, {
		"type": "movie",

		"id": "trakt_popular",

		"name": "trakt - Trending movies"
	}, {
		"type": "series",

		"id": "trakt_trending",

		"name": "trakt - Popular series"
	}, {
		"type": "series",

		"id": "trakt_trending",

		"name": "trakt - Trending series"
	}];


	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/manifest.json', (req, res) => {
	console.log(req.params);

	res.setHeader('Cache-Control', 'max-age=86400, public');
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
			if (access_token || (lists[i] == 'trakt_trending' || lists[i] == 'trakt_popular')) {
				manifest.catalogs[c] = {
					"type": "movie",

					"id": lists[i],

					"name": lists_array[lists[i]] + " movies"
				};
				c++;
				manifest.catalogs[c] = {
					"type": "series",

					"id": lists[i],

					"name": lists_array[lists[i]] + " series"
				};
				c++;
			}
		}
	}
	if (ids) {
		list_cat(ids).then((data) => {
			manifest.catalogs = manifest.catalogs.concat(data);
			res.send(manifest);
			res.end();
		}).catch((error) => {
			res.end();
			console.error(error);
		})
	} else {
		res.send(manifest);
		res.end();
	}
});

app.get('/:configuration?/:resource/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');

	console.log(req.params);
	const { configuration, resource, type, id } = req.params;
	if (configuration) {

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
		list_id = id.split(':')[1].split('.')[0];
		console.log('trakt_list:', list_id);
		list_catalog(type, trakt_type, list_id).then(promises => {
			Promise.all(promises).then(metas => {
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
				res.send(JSON.stringify({ metas: metas }));
				res.end();
			})
		})
	} else if (id.match(/trakt_[a-z]*/i)) {
		list_id = id.split('_')[1];
		console.log(list_id);

		if (list_id == "rec") {
			if (access_token) {
				recomendations(type, trakt_type, access_token).then(metas => {
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
			trending(type, trakt_type).then(metas => {
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
			popular(type).then(metas => {
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
			var name = datas[i].data.name;
			var id = datas[i].data.ids.trakt;
			if (id) {
				promises.push(request(`${host}/lists/${id}/items/movie`, id, name, "movie"));
				promises.push(request(`${host}/lists/${id}/items/shows`, id, name, "series"));
			}
		}
		return promises;
	}).then(promises => {
		return Promise.all(promises).then(catalogs => {
			catalogs = catalogs.filter(function (element) {
				return element !== undefined;
			});
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

					"name": name
				}
			}
		})
		.catch(error => {
			console.error(error);
		});

}

module.exports = app
