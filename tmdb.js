const axios = require('axios').default;
const config = require('./config');
const NodeCache = require("node-cache");
const Cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const BaseURL = 'https://api.themoviedb.org/3';
const imagePath= 'https://image.tmdb.org/t/p/original/';


async function request(url, header) {

    return await axios
        .get(url, header, { timeout: 5000 })
        .then(res => {
            return res;
        })
        .catch(error => {
            if (error.response) {
                console.error('error on tmdb.js request:', error.response.status, error.response.statusText, error.config.url);
            } else {
                console.error(error);
            }
        });

}
async function getMeta(type, id) {
    try{
    const Cached = Cache.get(id)
    if(Cached) return Cached
    let data;
    let meta = {};
    if (type == "movie") {
        const url = `${BaseURL}/movie/${id}?api_key=${config.tmdb}`
        const res = await request(url);
        data = res.data
    } else if (type == "series") {
        const url = `${BaseURL}/find/${id}?api_key=${config.tmdb}&external_source=imdb_id`
        const res = await request(url);
        data = res.data.tv_results;
    }
    if(!data) throw "error getting data"
    //console.log(data)
    if(data.backdrop_path) meta.background = imagePath + data.backdrop_path; 
    if(data.poster_path) meta.poster = imagePath + data.poster_path; 
    Cache.set(id,meta);
    return meta 
}catch(e){
    console.error(e)
}
}

//getMeta("series", 'tt0903747').then(meta => (console.log(meta)))

module.exports = getMeta;