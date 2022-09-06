const express = require('express');
const app = express();
const cors = require('cors');

const { getToken, watchlist, recomendations, list, list_catalog, popular, trending, client} = require('./trakt.js');

var manifest = require("./manifest.json");
const landingTemplate = require('./landingTemplate');
var lists_array = { 'trakt_trending': "trakt - Trending", 'trakt_popular': "trakt - Popular", 'trakt_watchlist': "trakt - Watchlist", 'trakt_rec': "trakt - Recommended" };
app.use(cors())

app.get('/', (req, res) => {
	if (req.query.code) {
		Promise.resolve(getToken(req.query.code)).then(data => {
			res.redirect('/configure/?access_token=' + data);
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

		"id": "trakt_popular_movies",

		"name": "trakt - Popular movies"
	}, {
		"type": "movie",

		"id": "trakt_popular_movies",

		"name": "trakt - Trending movies"
	}, {
		"type": "series",

		"id": "trakt_trending_series",

		"name": "trakt - Popular series"
	}, {
		"type": "series",

		"id": "trakt_trending_series",

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
	console.log(manifest.catalogs);
	var lists = req.params.configuration.split('|')[0].split('=')[1].split(',');
	var ids = req.params.configuration.split('|')[1].split('=')[1].split(',');
	var access_token = 0;
	if (req.params.configuration.split('|')[2]) {
		access_token = req.params.configuration.split('|')[1].split('=')[1];
	}
	console.log(lists, ids, access_token);

	var c = 0;

	if (lists) {
		
		for (let i = 0; i < lists.length; i++) {
			if(((lists[i] = ("trakt_watchlist"||"trakt_rec"))&& access_token) || (lists[i] = ("trakt_trending"||"trakt_popular"))){
			manifest.catalogs[c] = {
				"type": "movie",

				"id":  + "_movies",

				"name": lists_array[lists[i]] + " movies"
			};
			c++;
			manifest.catalogs[c] = {
				"type": "series",

				"id": lists[i] + "_series",

				"name": lists_array[lists[i]] + " series"
			};
			c++;
		}}
	}
	if (ids) {
		Promise.resolve(list_cat(ids)).then((data) => {

			manifest.catalogs = manifest.catalogs.concat(data);
			console.log(manifest)
			res.send(manifest);
			res.end();
		})
	} else {
		res.send(manifest);
		res.end();
	}
});


app.get('/:configuration?/:resource/:type/:id/', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');

	//console.log(req.params);
	const { configuration, resource, type, id } = req.params;

	var lists = configuration.split('|')[0].split('=')[1].split(',');
	var ids = configuration.split('|')[1].split('=')[1].split(',');
	var access_token;
	if (configuration.split('|')[2]) {
		access_token = configuration.split('|')[2].split('=')[1];
	}

	console.log(resource, type, id, lists, ids, access_token)
	if (type == "movie") {
		var trakt_type = "movie";
	} else if (type == "series") {
		var trakt_type = "show";
	}

	if (id.match(/trakt_list:[0-9]*/i)) {
		list_id = id.split(':')[1].split('.')[0];
		console.log(list_id);
		list_catalog(type, trakt_type, list_id).then(promises => {
			Promise.all(promises).then(metas => {
				metas = metas.filter(function (element) {
					return element !== undefined;
				});
			res.send(JSON.stringify({ metas: metas }));
			res.end();
			console.log(metas);

		})})
	} else if (id.match(/trakt_[a-z]*_[a-z]*/i)) {
		list_id = id.split('_')[1];
		console.log(list_id);
		if (list_id == "rec") {
			recomendations(type, trakt_type, access_token).then(promises=>{
				Promise.all(promises).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				})
			})
		} else if (list_id == "watchlist") {
			watchlist(type, trakt_type, access_token).then(promises=>{
				Promise.all(promises).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				})
			})
		}
		else if (list_id == "trending") {
			trending(type, trakt_type).then(promises=>{
				Promise.all(promises).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				})
			})
			
		}
		else if (list_id == "popular") {
			popular(type).then(promises=>{
				Promise.all(promises).then(metas => {
					metas = metas.filter(function (element) {
						return element !== undefined;
					});
					res.send(JSON.stringify({ metas: metas }));
					res.end();
				})
			})
			
		}


	}

})


async function list_cat(ids) {
	const host = "https://api.trakt.tv";
	const data = await Promise.all(list(ids)).then(datas => {
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
	});
	return await Promise.all(data).then(catalogs => {
		catalogs = catalogs.filter(function (element) {
			return element !== undefined;
		});
		return (catalogs);
	});
}


async function request(url, id, name, type) {
	//console.log(url,'url');
	return await client
		.get(url)
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
			console.log('error');
		});

}

module.exports = app
