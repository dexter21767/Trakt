const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { getToken, generic_lists, list_catalog, list_cat, listOfLists, getMeta, search } = require('./trakt-api.js');
const manifest = require("./manifest.json");
const config = require('./config.js');


// create monitoring stats routes using swagger-stats

const swStats = require('swagger-stats');
const apiSpec = require('./swagger-specs.json');

app.use(swStats.getMiddleware(
	{
		swaggerSpec: apiSpec,
		name: manifest.name,
		version: manifest.version,
		authentication: true,
		onAuthenticate: function (req, username, password) {
			// simple check for username and password
			return ((username === process.env.USER)
				&& (password === process.env.PASS));
		}

	}
));


app.set('trust proxy', true)
app.use(cors());

app.use('/configure', express.static(path.join(__dirname, 'vue', 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'vue', 'dist', 'assets')));

const { lists_array, genres, sort_array, host, count } = config;

app.use(function (req, res, next) {
	if (res.statusCode == 200) {
		res.setHeader('Cache-Control', config.CacheControl);
		res.setHeader('content-type', 'text/html');
	}
	next();
});


app.get('/', (req, res) => {
	console.log('req.query',req.query)
	if (req.query?.code || req.query?.refresh_token) {
		getToken({ code: req.query.code, refresh_token: req.query.refresh_token }).then(data => {
			let { access_token, refresh_token, created_at, expires_in } = data.data;
			if (access_token) {
				return res.redirect(`/configure/?access_token=${access_token}&refresh_token=${refresh_token}&expires=${created_at + expires_in}`);
				//return res.redirect('/configure/?access_token=' + data.data.access_token);
			}
			else {
				res.send(data);// res.redirect('/configure/?access_token_undefined');	
				res.end();
			}
		}
		).catch((e) => {
			console.error(e);
			//res.end(e);
			res.redirect('/configure/?error_getting_access_token');
		})
	} else {
		res.redirect('/configure/')
	}
});

app.get('/:configuration?/configure', (req, res) => {
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
	}, {
		"type": "trakt",

		"id": "trakt_search_movies",

		"name": "trakt - search movies",

		"extra": [{ name: "search", isRequired: true }]
	}, {
		"type": "trakt",

		"id": "trakt_search_series",

		"name": "trakt - search series",

		"extra": [{ name: "search", isRequired: true }]
	}];

	res.send(manifest);
	res.end();
});

app.get('/lists/:query', (req, res) => {
	listOfLists(req.params.query, req.query.token).then(data => res.send(data)).catch(e => console.error(e));
});

app.get('/:configuration?/manifest.json', async (req, res) => {
	try {
		console.log(req.params);
		const catalog = [];
		let parsedConfig = {};
		configuration = req.params.configuration;
		if (configuration) {
			if (configuration.startsWith('lists')) throw "unsupported legacy config format"
			configuration = Buffer.from(configuration, 'base64').toString();
			try {
				parsedConfig = JSON.parse(configuration);
			} catch (e) {
				throw "config isn't a valid json";
			}
			let { lists, ids, access_token } = parsedConfig || {};

			console.log("configuration", configuration)
			console.log(lists, ids, access_token);

			if (lists) {
				for (let i = 0; i < lists.length; i++) {

					if ((lists[i] == 'trakt_trending' || lists[i] == 'trakt_popular') || (access_token && access_token.length > 0 && lists[i] == 'trakt_rec')) {
						catalog.push({
							"type": 'trakt',

							"id": lists[i] + "_movies",

							"name": lists_array[lists[i]] + " movies",

							"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
						}, {
							"type": "trakt",

							"id": lists[i] + "_series",

							"name": lists_array[lists[i]] + " series",

							"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
						});
					} else if (access_token && access_token.length > 0 && lists[i] == 'trakt_watchlist') {
						catalog.push({
							"type": 'trakt',

							"id": lists[i],

							"name": lists_array[lists[i]],

							"extra": [{ "name": "genre", "isRequired": false, "options": sort_array }, { "name": "skip", "isRequired": false }]
						});
					}
				}
			}

			if (ids) {
				data = await list_cat(ids, access_token)
				if (data) manifest.catalogs = catalog.concat(data);
				manifest.catalogs = manifest.catalogs.filter(Boolean);
				manifest.catalogs.push({
					"type": "trakt",

					"id": "trakt_search_movies",

					"name": "trakt - search movies",

					"extra": [{ name: "search", isRequired: true }]
				}, {
					"type": "trakt",

					"id": "trakt_search_series",

					"name": "trakt - search series",

					"extra": [{ name: "search", isRequired: true }]
				});
				res.send(manifest);
				res.end();
			}
		} else {
			manifest.catalogs = catalog;
			manifest.catalogs.push({
				"type": "trakt",

				"id": "trakt_search_movies",

				"name": "trakt - search movies",

				"extra": [{ name: "search", isRequired: true }]
			}, {
				"type": "trakt",

				"id": "trakt_search_series",

				"name": "trakt - search series",

				"extra": [{ name: "search", isRequired: true }]
			});
			manifest.catalogs = manifest.catalogs.filter(Boolean);
			res.send(manifest);
			res.end();
		}
	} catch (e) {
		console.log(e)
		res.status(400).send(e);
		res.end();

	}
});


app.get('/:configuration?/catalog/:type/:id/:extra?.json', async (req, res) => {
	try {
		let { configuration, type, id, extra } = req.params;


		console.log('req.params', req.params);
		if (type != "trakt") return res.status(404).end();

		let skip, genre, search_query, parsedConfig = {};
		skip = 0;
		if (extra) {
			if (extra) params = Object.fromEntries(new URLSearchParams(extra));
			console.log(params)
			if (params) {
				if (params.genre) genre = params.genre.split(' ');
				if (params.skip) skip = Math.round(params.skip / 100);
				if (params.search) search_query = params['search'];
			}
		}
		skip++;

		console.log(configuration, type, id);
		console.log('extra: genre:', genre, 'skip:', skip);

		if (configuration) {
			if (configuration.startsWith('lists')) throw "unsupported legacy config format"
			configuration = Buffer.from(configuration, 'base64').toString();
			try {
				parsedConfig = JSON.parse(configuration);
			} catch (e) {
				throw "config isn't a valid json";
			}
		}
		let { lists, ids, access_token, RPDBkey } = parsedConfig || {};
		console.log(lists, ids, access_token, RPDBkey);

		let sort, username, trakt_type;
		if (id.startsWith("trakt_list:")) {
			id = id.replace('trakt_list:', '')

			username = id.split(':')[0];
			list_id = id.split(':')[1];

			sort = id.split(':')[2];
			if (sort) sort = sort.split(',');

			if (genre == undefined && id.split(':').length == 4) {
				genre = id.split(':')[2].split(',');
			}
			console.log('list_id:', list_id, 'username', username, 'sort', sort);
			console.log(id);
			metas = await list_catalog({ id: list_id, username, access_token, genre, sort, skip, RPDBkey })
			if (metas) metas = metas.filter(Boolean);
			res.send(JSON.stringify({ metas: metas }));

		} else if (id.startsWith("trakt")) {
			list_id = id.split('_')[1];
			type = id.split('_')[2];
			if (type == "movies") {
				trakt_type = "movie";
			} else if (type == "series") {
				trakt_type = "show";
			}
			console.log("list_id", list_id);
			const data = { trakt_type: trakt_type, type: type, access_token: access_token, genre: genre, skip: skip, RPDBkey }

			if (list_id && generic_lists.hasOwnProperty(list_id)) {
				metas = await generic_lists[list_id](data);
				if (metas) metas = metas.filter(Boolean);
				res.send(JSON.stringify({ metas: metas }));
			} else if (list_id && list_id == "search" && search_query) {
				metas = await search(trakt_type, search_query, RPDBkey);
				if (metas) metas = metas.filter(Boolean);
				res.send(JSON.stringify({ metas: metas }));
			}
		}
		res.end();
	} catch (e) {
		console.log(e)
		res.status(400).send(e);
		res.end();
	}
})


app.get('/:configuration?/meta/:type/:id/:extra?.json', async (req, res) => {

	let { configuration, type, id, extra } = req.params;

	console.log('req.params', req.params);
	if (id.startsWith("trakt:")) {
		id = id.replace('trakt:', '');
		meta = await getMeta(type, id)
		if (meta) res.send(JSON.stringify({ meta: meta }));
		res.end();

	} else {
		res.end();
	}
})

module.exports = app
