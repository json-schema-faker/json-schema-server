#!/usr/bin/env node

'use strict';

var pkg = require('../package.json'),
    utils = require('./lib/utils'),
    server = require('./lib/server');

var path = require('path'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    f: 'fakeroot',
    r: 'formats',
    q: 'silent',
    p: 'port'
  },
  string: ['port', 'formats', 'fakeroot'],
  boolean: ['help', 'silent', 'version']
});

function printUsage(message) {
  if (message) {
    utils.println(utils.color.red(message + ' (use --help for usage info)'));
    utils.exit(1);
  }

  utils.println(utils.style([
    'Usage: {yellow|' + Object.keys(pkg.bin)[0] + '} [dir] {cyan|opts}',
    '',
    'Options:',
    '  {cyan|-p}, {cyan|--port}      {blue|number}   The port used for serving schemas',
    '  {cyan|-q}, {cyan|--silent}    {blue|boolean}  Disable the output reporting through the STDOUT',
    '  {cyan|-r}, {cyan|--formats}   {blue|string}   Require CommonJS-module for custom format generators',
    '  {cyan|-f}, {cyan|--fakeroot}  {blue|string}   Used to resolve $ref\'s from the given directory (optional)',
    ''
  ].join('\n')));
}


if (argv.version) {
  utils.println([pkg.name, pkg.version].join(' '));
} else if (argv.help) {
  printUsage();
} else {
  var schema_dir = path.resolve(argv._[0] || '.');

  if (!utils.is_dir(schema_dir)) {
    printUsage('Invalid directory');
  }

  var formats_src = argv.formats && path.resolve(argv.formats);

  server({
    port: argv.port,
    silent: argv.silent,
    fakeroot: argv.fakeroot,
    directory: schema_dir,
    formats: formats_src
  }, function(err) {
    if (err) {
      printUsage(err);
    } else {
      utils.println('OK, listening...');
    }
  });
}
