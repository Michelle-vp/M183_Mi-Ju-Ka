const axios = require('axios');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getHtml(req) {
    if (!req.body.terms) {
        return 'Not enough information provided';
    }

    const terms = String(req.body.terms);

    await sleep(1000);

    const result = await axios.get('http://localhost:3000/search/v2/', {
        params: {
            terms
        },
        headers: {
            Cookie: req.headers.cookie || ''
        }
    }).then(response => response.data)
      .catch(() => 'No results found!');

    return result;
}

module.exports = {
    html: getHtml
};