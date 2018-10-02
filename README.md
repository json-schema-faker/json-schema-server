# JSON-Schema Server

[![Build Status](https://travis-ci.org/json-schema-faker/json-schema-server.png?branch=master)](https://travis-ci.org/json-schema-faker/json-schema-server)
[![NPM version](https://badge.fury.io/js/json-schema-server.png)](http://badge.fury.io/js/json-schema-server)
[![Coverage Status](https://codecov.io/gh/json-schema-faker/json-schema-server/branch/master/graph/badge.svg)](https://codecov.io/gh/json-schema-faker/json-schema-server)

[![Dependency Status](https://david-dm.org/json-schema-faker/json-schema-server/status.svg)](https://david-dm.org/json-schema-faker/json-schema-server)
[![devDependency Status](https://david-dm.org/json-schema-faker/json-schema-server/dev-status.svg)](https://david-dm.org/json-schema-faker/json-schema-server#info=devDependencies)

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

## Options

- `--fakeroot` &rarr; BaseURI for references that will fake (default: `http://json-schema.org`).
- `--formats` &rarr; CommonJS module-id or path for custom formats.
- `--silent` &rarr; Turns off the reporting through the STDOUT.
- `--port` &rarr; Custom port for the server (default: `3000`).

If no `dir` is provided `process.cwd()` will be used instead.

Run `json-schema-server -h` to display all usage info

> Try [fake-schema-cli](https://github.com/atomsfat/fake-schema-cli) if you want single-shot calls.
