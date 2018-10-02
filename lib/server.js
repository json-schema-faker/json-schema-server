'use strict';

var path = require('path'),
  glob = require('glob'),
  express = require('express'),
  jsf = require('json-schema-faker');

var utils = require('./utils'),
  constants = require('./constants');

var Server = {

  app: express(), // express application - handles request/response cycle;
  instance: null,

  params: {}, // parameter placeholder

  callback: undefined, // callback function - non optional

  log: function log() {
    if (!this.params.silent) {
      utils.println(utils.style.apply(null, arguments));
    }
  },

  start: function start(params, callback) {
    this.params = params;
    this.callback = callback;

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

  // TODO: schemaExtensions should be passed and used within json-schema-ref-parser?
  resolvePath: function resolve(file) {
    for (var key in constants.schemaExtensions) {
      var suffix = constants.schemaExtensions[key],
        fixedPath = path.join(this.params.directory, file + suffix);
      if (utils.is_file(fixedPath)) {
        return fixedPath;
      }
    }
  },

  readJSONFile: function readJSONFile(res, filePath) {
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
    var server = this;

    if (req.path.indexOf('.json') > -1
      || req.path.indexOf('.schema') > -1) {
      return res.json(content);
    }

    var schemas = [];

    if (this.params.directory) {
      schemas = glob.sync(path.join(this.params.directory, '**/*.{json,schema}'));
    }

    Promise.resolve()
      .then(() => schemas.map(ref => {
        const schema = this.readJSONFile(res, ref);

        if (!schema.id) {
          schema.id = path.basename(ref);
        }

        return schema;
      }))
      .then(refs => jsf.resolve(content, refs, this.params.directory))
      .then(function(sample) {
        res.json(sample);
      })
      .catch(function(err) {
        server.fail(res, constants.HTTPStatus.InternalServerError, err.message || err.toString());
      });
  },

  configureJSF: function configureJSF() {
    // TODO: check only if diff/checksum changes on each request,
    // if changed just reload the entire module before faking anything
    try {
      this.log('Configuring json-schema-faker');

      if (this.params.formats) {
        jsf.formats(require(this.params.formats));
      }

      jsf.extend('faker', () => require('faker'));
      jsf.extend('chance', () => new (require('chance'))());
    } catch (e) {
      return this.callback(e);
    }
  },

  configureApp: function configureApp() {
    this.log('Configuring application');
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
          server.fail(res, constants.HTTPStatus.InternalServerError, err.message || err.toString());
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
        var content = server.readJSONFile(res, filePath);
        if (content) {
          server.handle(req, res, content);
        }
      }
    });

    var done = this.callback;

    server.instance = app.listen(server.params.port, function() {
      server.log('Listening...');
      done();
    });
  },

  closeApp: function close(callback) {
    if (this.instance) {
      this.log('Closing server');
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
