const http = require('http');

function build(res, data) {
  return {
    json: data,
    status: res.statusCode,
  };
}

module.exports = (url, callback) => {
  const req = http.get(url, res => {
    let body;

    body = '';

    res.on('data', data => {
      body += data;
    });

    return res.on('end', () => {
      try {
        body = JSON.parse(body);
      } catch (_error) {
        callback(_error);
        return;
      }

      return callback(null, build(res, body));
    });
  });

  req.on('error', callback);
};
