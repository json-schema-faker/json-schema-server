JSON-Schema Server
==================

[![Build Status](https://travis-ci.org/json-schema-faker/json-schema-server.png?branch=master)](https://travis-ci.org/json-schema-faker/json-schema-server) [![NPM version](https://badge.fury.io/js/json-schema-server.png)](http://badge.fury.io/js/json-schema-server) [![Coverage Status](https://coveralls.io/repos/json-schema-faker/json-schema-server/badge.png?branch=master)](https://coveralls.io/r/json-schema-faker/json-schema-server?branch=master)

Install `json-schema-server` globally:

```bash
$ npm install -g json-schema-server
```

Then starts a server for your JSON-Schema files:

```bash
$ json-schema-server [dir] -p 5000
```

Now you can make requests through the created server:

```bash
$ http http://localhost:5000/path/to/schema
```

The better if you're using [httpie](https://github.com/jakubroztocil/httpie). :beers:

Options
-------

- `--fakeroot` &rarr; BaseURI for references that will fake (default: `http://json-schema.org`).
- `--formats` &rarr; CommonJS module-id or path for custom formats.
- `--silent` &rarr; Turns off the reporting through the STDOUT.
- `--port` &rarr; Custom port for the server (default: `3000`).

If no `dir` is provided `process.cwd()` will be used instead.

Run `json-schema-server -h` to display all usage info.
