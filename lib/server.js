const path = require('path');
const glob = require('glob');
const Grown = require('grown')();
const jsf = require('json-schema-faker');

const utils = require('./utils');
const constants = require('./constants');

Grown.use(require('@grown/logger'));

const Server = {

  app: new Grown({ cors: true }), // express application - handles request/response cycle;
  instance: null,

  params: {}, // parameter placeholder
  schemas: {}, // loaded schemas
  routes: [], // added routes

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
    this.log('Endpoint: {yellow|%s}', `http://localhost:${this.params.port}`);
    this.configureApp();
  },

  // TODO: schemaExtensions should be passed and used within json-schema-ref-parser?
  resolvePath: function resolve(file) {
    const keys = Object.keys(constants.schemaExtensions);

    for (let i = 0, key; i < keys.length; i += 1) {
      key = keys[i];

      const suffix = constants.schemaExtensions[key];
      const fixedPath = path.join(this.params.directory, file + suffix);

      if (utils.isFile(fixedPath)) {
        return fixedPath;
      }
    }
  },

  readJSONFile: function readJSONFile(res, filePath) {
    try {
      return JSON.parse(utils.read(filePath));
    } catch (e) {
      const errorMessage = e.message || e.toString();
      this.fail(res, constants.HTTPStatus.InternalServerError, errorMessage);
    }
  },

  fail: function fail(res, status, message) {
    res.statusCode = status;
    res.json({ error: message });
  },

  configureJSF: function configureJSF() {
    // TODO: check only if diff/checksum changes on each request,
    // if changed just reload the entire module before faking anything
    try {
      this.log('Configuring json-schema-faker');

      if (this.params.formats) {
        jsf.format(require(this.params.formats));
      }

      jsf.option('resolveJsonPath', true);

      jsf.extend('faker', () => require('faker'));
      jsf.extend('chance', () => new (require('chance'))());

      jsf.define('param', (value, schema, property, rootSchema, pathToSchema) => {
        schema.jsonPath = `$..params.${typeof value !== 'string' ? pathToSchema.pop() : value}`;

        delete schema.pattern;
        delete schema.format;
        delete schema.param;
        delete schema.enum;
      });
    } catch (e) {
      return this.callback(e);
    }
  },

  configureApp: function configureApp() {
    this.log('Configuring application');
    const server = this;
    const app = this.app;

    // enable request-logger
    app.plug(Grown.Logger.setLevel('debug'));

    /**
     * Scan and load schemas on startup.
     */
    glob.sync('**/*.{json,schema}', {
      cwd: server.params.directory,
    }).forEach(file => {
      try {
        const schema = JSON.parse(utils.read(`${server.params.directory}/${file}`));

        schema.id = schema.id || path.basename(file).replace(/(?:-schema\.json|(\.(?:json|schema)))$/, '');
        server.schemas[schema.id] = schema;
        if (schema.routes) {
          schema.routes.forEach(route => {
            server.routes.push({ route: route.split('/'), schema: { $ref: schema.id } });
          });
        }
      } catch (e) {
        server.log("{red|Failed to load '%s'\n%s}", file, e.message);
        process.exit(1);
      }
    });

    /**
     * Executes JSF for a given file or executes directory listing.
     */
    // FIXME: call through proxied api if no-schema was resolved instead?
    app.mount(({ req, res }) => {
      const [url, query] = req.url.split('?');

      if (url === '/') {
        try {
          const schemas = glob.sync(path.join(server.params.directory, '**/*.{json,schema}'));

          return res.json(schemas.map(schema => {
            return path.relative(server.params.directory, schema);
          }));
        } catch (err) {
          server.fail(res, constants.HTTPStatus.InternalServerError, err.message || err.toString());
        }
      }

      const filePath = server.resolvePath(url);

      if (!filePath) {
        const retval = utils.match(`${req.method} ${url}`, server.routes);

        if (retval) {
          return jsf.resolve(retval, server.schemas).then(result => {
            res.statusCode = constants.HTTPStatus.OK;
            res.json(result.schema);
          });
        }

        server.fail(res, constants.HTTPStatus.NotFound, `Cannot '${req.method} ${url}'`);
      } else {
        return jsf.resolve(server.readJSONFile(res, filePath), server.schemas, server.params.directory).then(result => {
          res.statusCode = constants.HTTPStatus.OK;
          res.json(result);
        })
      }
    });

    const done = this.callback;

    app.listen(server.params.port, self => {
      server.log('Listening...');
      server.instance = self;
      done();
    });
  },

  closeApp: function close(callback) {
    if (this.instance) {
      this.log('Closing server');
      this.instance.close();
    }
    callback();
  },
};

module.exports = Server;
