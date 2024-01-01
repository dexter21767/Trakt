const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { getToken, generic_lists, list_catalog, list_cat, listOfLists, getMeta, search } = require('./trakt-api.js');
const manifest = require("./manifest.json");
const config = require('./config.js')();

// create monitoring stats routes using swagger-stats

const swStats = require('swagger-stats');
const apiSpec = require('./swagger-specs.json')

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
app.use('/public', express.static(path.join(__dirname, 'vue', 'public')));

const { lists_array, genres, sort_array, host, count } = config;

app.use(function (req, res, next) {
	if (res.statusCode == 200) {
		res.setHeader('Cache-Control', config.CacheControl);
		res.setHeader('content-type', 'text/html');
	}
	next();
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

app.get('/:configuration?/', (req, res) => {
	console.log('req.query', req.query)
	if (req.query?.code || req.query?.refresh_token) {
		getToken({ code: req.query.code, refresh_token: req.query.refresh_token }).then(data => {
			let { access_token, refresh_token, created_at, expires_in } = data.data;
			if (access_token) {
				if (req.params.configuration)
					return res.redirect(`/${req.params.configuration}/configure/?access_token=${access_token}&refresh_token=${refresh_token}&expires=${created_at + expires_in}`);
				else
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
		return res.redirect('/configure/')
	}
});

app.get('/:configuration?/configure', (req, res) => {
	res.sendFile(path.join(__dirname, 'vue', 'dist', 'index.html'));
});

app.get('/lists/:query', (req, res) => {
	listOfLists(req.params.query, req.query.token).then(data => res.send(data)).catch(e => console.error(e));
});

app.get('/:configuration?/manifest.json', async (req, res) => {
	try {
		console.log(req.params);
		const catalog = [];
		let newManifest = JSON.parse(JSON.stringify(manifest));
		let parsedConfig = {};
		let configuration = req.params.configuration;
		if (configuration) {
			if (configuration.startsWith('lists')) throw "unsupported legacy config format"
			configuration = Buffer.from(configuration, 'base64').toString();
			try {
				parsedConfig = JSON.parse(configuration);
			} catch (e) {
				throw "config isn't a valid json";
			}
			let { lists, ids, access_token, refresh_token, expires } = parsedConfig || {};

			console.log("configuration", configuration)
			console.log(lists, ids, access_token);

			if (lists) {
				lists.forEach(list => {
					let data = genericLists(list, access_token);
					if (data.length)
						data.forEach(item => catalog.push(item))
					else
						catalog.push(data)
				});
			}

			if (expires) newManifest.description += `\n token expires on: ${new Date(expires * 1000).toLocaleString()}`;

			if (ids) {
				data = await list_cat(ids, access_token)
				if (data) newManifest.catalogs = catalog.concat(data);
				newManifest.catalogs = newManifest.catalogs.filter(Boolean);
				return res.json(newManifest);
			}
		} else {
			newManifest.catalogs = catalog;
			newManifest.catalogs = newManifest.catalogs.filter(Boolean);
			return res.json(newManifest);
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
		if (type != "trakt") return res.json(updateAddon('catalog'));

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
				res.json(updateAddon('catalog'));
				throw "config isn't a valid json";
			}
		}
		let { lists, ids, access_token, RPDBkey } = parsedConfig || {};
		console.log(lists, ids, access_token, RPDBkey);

		let sort, username, trakt_type;
		if (id.startsWith("trakt_list:")) {
			id = id.replace('trakt_list:', '');

			[username, list_id, sort] = id.split(':');

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

			if (list_id === 'watchlist') {
				let regex = new RegExp(/^(movies|series)$/);
				type = regex.test(id.split('_')[2]) ? id.split('_')[2] : null;
				if (type) {
					trakt_type = type == "movies" ? "movies" : type == "series" ? "shows" : null;
					sort = id.split('_')[3];

				} else {
					id.split('_')[2];
				}

				if (genre == undefined && sort) {
					genre = sort.split(',');
				}
			} else {
				if (type == "movies") {
					trakt_type = "movie";
				} else if (type == "series") {
					trakt_type = "show";
				}
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

function genericLists(list, access_token) {
	const [id, secondPart, thirdPart] = list.split(':');
	const separated = secondPart == "separated" ? true : false;
	const sort = secondPart == "separated" ? thirdPart : secondPart;

	if ((id == 'trakt_trending' || id == 'trakt_popular') || (access_token && access_token.length > 0 && id == 'trakt_rec')) {
		return [{
			"type": 'trakt',

			"id": sort ? `${id}_movies_${sort}` : `${id}_movies`,

			"name": lists_array[id] + " movies",

			"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
		}, {
			"type": "trakt",

			"id": sort ? `${id}_series_${sort}` : `${id}_series`,

			"name": lists_array[id] + " series",

			"extra": [{ "name": "genre", "isRequired": false, "options": genres }, { "name": "skip", "isRequired": false }]
		}];
	} else if (access_token && access_token.length > 0 && id == 'trakt_watchlist') {
		if (separated) {
			return [{
				"type": 'trakt',

				"id": sort ? `${id}_movies_${sort}` : `${id}_movies`,

				"name": lists_array[id] + " movies",

				"extra": [{ "name": "genre", "isRequired": false, "options": sort_array }, { "name": "skip", "isRequired": false }]
			}, {
				"type": 'trakt',

				"id": sort ? `${id}_series_${sort}` : `${id}_series`,

				"name": lists_array[id] + " series",

				"extra": [{ "name": "genre", "isRequired": false, "options": sort_array }, { "name": "skip", "isRequired": false }]
			}]
		}
		else {
			return {
				"type": 'trakt',

				"id": sort ? `${id}_${sort}` : `${id}`,

				"name": lists_array[id],

				"extra": [{ "name": "genre", "isRequired": false, "options": sort_array }, { "name": "skip", "isRequired": false }]
			};
		}
	} else if (id == 'trakt_search') {
		return [{
			"type": "trakt",

			"id": "trakt_search_movies",

			"name": "trakt - search movies",

			"extra": [{ name: "search", isRequired: true }]
		}, {
			"type": "trakt",

			"id": "trakt_search_series",

			"name": "trakt - search series",

			"extra": [{ name: "search", isRequired: true }]
		}]
	}
}

function updateAddon(resource){
	if(resource == 'catalog'){
		return [
			{
				id: 'trakt_updateAddon',
				name: 'ERROR: update addon',
				type: 'movie',
				poster: 'https://trakt.tv/assets/placeholders/thumb/poster-2561df5a41a5cb55c1d4a6f02d6532cf327f175bda97f4f813c18dea3435430c.png',
				description: "you're using an old version of this addon, please update it"
			}
		]
	}
	else if(resource == "meta"){
		return {
			id: 'trakt_updateAddon',
			name: 'ERROR: update addon',
			type: 'movie',
			poster: 'https://trakt.tv/assets/placeholders/thumb/poster-2561df5a41a5cb55c1d4a6f02d6532cf327f175bda97f4f813c18dea3435430c.png',
			description: "you're using an old version of this addon, please update it"
		}
	}
}