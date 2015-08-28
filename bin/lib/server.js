'use strict';

var utils = require('./utils');

var path = require('path'),
    glob = require('glob'),
    express = require('express'),
    refaker = require('refaker'),
    jsonfaker = require('json-schema-faker');

// TODO: this should be passed and used within refaker
var schema_extensions = ['', '.json', '.schema', '-schema.json'];

module.exports = function(params, callback) {
  if (!params.port) {
    params.port = process.env.PORT || 3000;
  }

  if (params.formats) {
    // TODO: on this only check if diff/checksum changes on each
    // request, if changed just reload the entire module
    // before faking anything
    try {
      jsonfaker.formats(require(params.formats));
    } catch (e) {
      return callback(e);
    }
  }

  if (!params.fakeroot) {
    params.fakeroot = 'http://json-schema.org';
  }

  function log() {
    if (!params.silent) {
      utils.println(utils.style.apply(null, arguments));
    }
  }

  function resolve(file) {
    for (var key in schema_extensions) {
      var suffix = schema_extensions[key],
          fixed_file = path.join(params.directory, file + suffix);

      if (utils.is_file(fixed_file)) {
        return fixed_file;
      }
    }
  }

  function enableCORS(res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length');
    res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
  }

  function responseFail(res, status, message) {
    res.statusCode = status;
    res.json({ error: message });
  }

  function readAndServe(req, res, file) {
    var json_schema,
        has_error;

    try {
      json_schema = JSON.parse(utils.read(file));
    } catch (e) {
      has_error = e.message || e.toString();
    }

    if (has_error) {
      return responseFail(res, 500, has_error);
    }

    refaker({
      directory: params.directory,
      fakeroot: params.fakeroot,
      schemas: [json_schema]
    }, function(err, refs, schemas) {
      if (err) {
        responseFail(res, 500, err.message || err.toString());
      } else {
        res.json(jsonfaker(schemas[0], refs));
      }
    });
  }

  log('Directory: {magenta|%s}', params.directory);

  var app = express(),
      base = 'http://localhost:' + params.port;

  log('Endpoint: {yellow|%s}', base);

  app.use(function(req, res, next) {
    enableCORS(res);
    next();
  });

  app.get('/', function(req, res) {
    glob(path.join(params.directory, '**/*.{json,schema}'), function(err, schemas) {
      if (err) {
        responseFail(res, 500, err.message || err.toString());
      } else {
        res.json(schemas.map(function(schema) {
          return path.relative(params.directory, schema);
        }));
      }
    });
  });

  app.get('/:path*', function(req, res) {
    var found_schema = resolve(req.path);

    if (!found_schema) {
      responseFail(res, 404, 'JSON-Schema for `' + req.path + '` not found');
    } else {
      readAndServe(req, res, found_schema);
    }
  });

  app.listen(params.port, function() {
    callback(null, this.close.bind(this));
  });
};
