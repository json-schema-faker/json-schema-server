'use strict';

var path = require('path'),
  glob = require('glob'),
  express = require('express'),
  refaker = require('refaker'),
  jsf = require('json-schema-faker');

var utils = require('./utils'),
  constants = require('./constants');

var Server = {

  app: express(), // express application - handles request/response cycle;
  instance: null,

  params: {}, // parameter placeholder

  fallback: undefined, // fallback function - executed when something crashes

  log: function log() {
    if (!this.params.silent) {
      utils.println(utils.style.apply(null, arguments));
    }
  },

  start: function init(params, fallback) {
    this.params = params;
    this.fallback = fallback;

    this.configureJSF();
    this.log('Directory: {magenta|%s}', this.params.directory);
    this.log('Endpoint: {yellow|%s}', 'http://localhost:' + this.params.port);
    this.configureApp();
  },

  enableCORS: function enableCORS(res) {
    Object.keys(constants.CORSHeaders).forEach(function (header) {
      res.setHeader(header, constants.CORSHeaders[header]);
    });
  },

  // TODO: schemaExtensions should be passed and used within refaker
  resolvePath: function resolve(file) {
    for (var key in constants.schemaExtensions) {
      var suffix = constants.schemaExtensions[key],
        fixedPath = path.join(this.params.directory, file + suffix);
      if (utils.is_file(fixedPath)) {
        return fixedPath;
      }
    }
  },

  readJSONFile: function readJSONFile(filePath) {
    try {
      return JSON.parse(utils.read(filePath));
    } catch (e) {
      var errorMessage = e.message || e.toString();
      this.fail(res, constants.HTTPStatus.InternalServerError, errorMessage);
    }
  },

  fail: function fail(res, status, message) {
    res.statusCode = status;
    res.json({error: message});
  },

  handle: function handle(req, res, content) {
    refaker({
      directory: this.params.directory,
      fakeroot: this.params.fakeroot,
      schemas: [content]
    }, function (err, refs, schemas) {
      if (err) {
        fail(res, constants.HTTPStatus.InternalServerError, err.message || err.toString());
      } else {
        // TODO: here might be an error thrown... watch out!
        var result = jsf(schemas[0], refs);
        res.json(result);
      }
    });
  },

  configureJSF: function configureJSF() {
    // TODO: check only if diff/checksum changes on each request,
    // if changed just reload the entire module before faking anything
    if (this.params.formats) {
      try {
        this.log("Configuring json-schema-faker");
        jsf.formats(require(this.params.formats));
      } catch (e) {
        return this.fallback(e);
      }
    }
  },

  configureApp: function configureApp() {
    this.log("Configuring application");
    var server = this,
      app = this.app;

    app.use(function (req, res, next) {
      server.enableCORS(res);
      next();
    });

    /**
     * Executes directory listing.
     */
    app.get('/', function (req, res) {
      server.log('Requesting: {magenta|%s}', req.path);
      glob(path.join(server.params.directory, '**/*.{json,schema}'), function (err, schemas) {
        if (err) {
          fail(res, constants.HTTPStatus.InternalServerError, err.message || err.toString());
        } else {
          res.json(schemas.map(function (schema) {
            return path.relative(server.params.directory, schema);
          }));
        }
      });
    });

    /**
     * Executes JSF for a given file.
     */
    app.get('/:path*', function (req, res) {
      server.log('Requesting: {magenta|%s}', req.path);
      var filePath = server.resolvePath(req.path);

      if (!filePath) {
        var errorMessage = 'File `' + req.path + '` not found';
        server.fail(res, constants.HTTPStatus.NotFound, errorMessage);
      } else {
        var content = server.readJSONFile(filePath);
        if (content) {
          server.handle(req, res, content);
        }
      }
    });

    server.instance = app.listen(server.params.port, function () {
      server.log('Listening...');
    });
  },

  closeApp: function close(callback) {
    if (this.instance) {
      this.log("Closing server");
      // TODO: http.server isn't closed when keep-alive connections were opened, e.g. in case of browsers,
      // see https://github.com/nodejs/node-v0.x-archive/issues/9066
      // for reference, try executing `curl` from console - it doesn't send keep-alive header
      //this.instance.close(callback);
      this.instance.close();
      callback();
    }
  }
};

module.exports = Server;
