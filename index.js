
const express = require('express');
const app = express();
const cors = require('cors');

const {getToken,watchlist,recomendations,list,list_catalog,popular,trending,request} = require('./trakt.js');

var manifest = require("./manifest.json");
const landingTemplate = require('./landingTemplate');
var lists_array= { 'trakt_trending':"trakt - Trending", 'trakt_popular':"trakt - Popular", 'trakt_watchlist':"trakt - Watchlist", 'trakt_rec':"trakt - Recommended" };
app.use(cors())


// http://127.0.0.1:7515/?code=8e73f08f1cb2dfc8871c41fba11d9030ba3faa9e2694af6eb4e83110a27c2b62

app.get('/', (req, res) => {
	if(req.query.code){
		Promise.resolve(getToken(req.query.code)).then(data => {
			res.redirect('/configure/?access_token=' + data);
		})
	}else{
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
    },{
        "type": "movie",

        "id": "trakt_popular_movies",

        "name": "trakt - Trending movies"
    },{
        "type": "series",

        "id": "trakt_trending_series",

        "name": "trakt - Popular series"
    },{
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
	var access_token;
	if(req.params.configuration.split('|')[2]){
	access_token = req.params.configuration.split('|')[1].split('=')[1];	
	}
	console.log(lists,ids,access_token);
	
  var c = 0;
  
  if (lists){
	  for(let i=0;i<lists.length;i++){
	  manifest.catalogs[c] = {
        "type": "movie",

        "id": lists[i]+"_movies",

        "name": lists_array[lists[i]]+" movies"
    };
	c++;
	manifest.catalogs[c] = {
        "type": "series",

        "id": lists[i]+"_series",

        "name": lists_array[lists[i]]+" series"
    };
	c++;
  }}
if(ids){
	Promise.resolve(list_cat(ids,c)).finally(() =>{
	res.send(manifest);
	res.end();	
	})
}else
{
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
	if(configuration.split('|')[2]){
	access_token = configuration.split('|')[2].split('=')[1];	
	}
	
	console.log(resource,type, id,lists ,ids ,access_token)
	if (type == "movie"){
		var trakt_type = "movie";
	}else if (type == "series"){
		var trakt_type = "show";
	}
	
	if(id.match(/trakt_list:[0-9]*/i)){
		list_id = id.split(':')[1].split('.')[0];
		console.log(list_id);
		Promise.resolve(list_catalog(type,trakt_type,list_id)).then(metas => {
		res.send(JSON.stringify({metas: metas}));
		res.end();
		console.log(metas);
		
		})
	}else if(id.match(/trakt_[a-z]*_[a-z]*/i)){
		list_id = id.split('_')[1];
		console.log(list_id);
		if(list_id == "rec"){
		Promise.resolve(recomendations(type,trakt_type,access_token)).then(metas => {
		res.send(JSON.stringify({metas: metas}));
		res.end();
		console.log(metas);
			
		})	
		}else if(list_id == "watchlist"){
		Promise.resolve(watchlist(type,trakt_type,access_token)).then(metas => {
		res.send(JSON.stringify({metas: metas}));
		res.end();
		console.log(metas);	
		})	
		}
		else if(list_id == "trending"){
		Promise.resolve(trending(type,trakt_type)).then(metas => {
		res.send(JSON.stringify({metas: metas}));
		res.end();
		console.log(metas);	
		})	
		}
		else if(list_id == "popular"){
		Promise.resolve(popular(type)).then(metas => {
		res.send(JSON.stringify({metas: metas}));
		res.end();
		console.log(metas);	
		})	
		}
		
		
	}

})


async function list_cat(ids,c) {
const host = "https://api.trakt.tv";
    var data = await Promise.resolve(list(ids));
    for (let i = 0; i < data.length; i++) {


		var url = `${host}/lists/${data[i].id}/items/movie`;
		var items = (await request(url)).data;

        if (items.length) {
            manifest.catalogs[c] = {
                "type": "movie",

                "id": "trakt_list:" + data[i].id,

                "name": data[i].name
            };

            c++;
        }
		var url = `${host}/lists/${data[i].id}/items/shows`;
		var items = (await request(url)).data;
		console.log('items',items)
        if (items.length) {
            manifest.catalogs[c] = {
                "type": "series",

                "id": "trakt_list:" + data[i].id,

                "name": data[i].name
            };
            c++;
        };

    };
	
}



module.exports = app
