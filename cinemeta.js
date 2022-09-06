const needle = require("needle");

function cinemeta(type, tt) {

    return needle(
        "get",
        `https://v3-cinemeta.strem.io/meta/${type}/${tt}.json`).then((res) => {
            const body = res.body;
            if (body && body.meta) {
                const meta = body.meta;
                const name = meta.name;
                const year = meta.year.substring(0, 4);
                return body.meta;
            }
            return Promise.reject();
        }).catch(error => {
            //console.error(error);
            console.log('error');
            return;
        })
}


module.exports = cinemeta;
