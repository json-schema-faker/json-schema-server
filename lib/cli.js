const path = require('path');

const utils = require('./utils');
const pkg = require('../package.json');

const CLI = {

  implementation: function implementation() {
    // process command line arguments and options
    const argv = require('wargs')(process.argv.slice(2), {
      alias: {
        h: 'help',
        v: 'version',
        f: 'fakeroot',
        r: 'formats',
        q: 'silent',
        p: 'port',
      },
      string: ['port', 'formats', 'fakeroot'],
      boolean: ['help', 'silent', 'version'],
    });

    // execute program
    const server = require('./server');
    const constants = require('./constants');

    if (argv.version) {
      this.printVersion();
    } else if (argv.help) {
      this.printHelp();
    } else {
      // check if schema directory is correct (cwd by default)
      const schemaDir = path.resolve(argv._[0] || '.');

      if (!utils.isDir(schemaDir)) {
        this.printError('Invalid schema directory');
        process.exit(1);
      }

      server.start({
        directory: schemaDir,
        silent: argv.silent,
        port: argv.port || process.env.PORT || constants.port,
        fakeroot: argv.fakeroot || constants.fakeroot,
        formats: argv.formats && path.resolve(argv.formats),
      }, err => {
        if (err) {
          this.printError(err);
          process.exit(1);
        }
      });
    }

    function gracefulExit() {
      process.exit(0);
    }

    process.on('SIGINT', () => {
      utils.println(utils.style('\r{yellow|Caught SIGINT}'));
      server.closeApp(gracefulExit);
    });

    process.on('SIGTERM', () => {
      utils.println(utils.style('\r{yellow|Caught SIGTERM}'));
      server.closeApp(gracefulExit);
    });
  },

  /**
   * Prints package version.
   */
  printVersion: function printVersion() {
    utils.println([pkg.name, pkg.version].join(' '));
  },

  /**
   * Prints tool help content.
   */
  printHelp: function printHelp() {
    utils.println(utils.style([
      `Usage: {yellow|${Object.keys(pkg.bin)[0]}} [dir] {cyan|opts}`,
      '',
      'Options:',
      '  {cyan|-p}, {cyan|--port}      {blue|number}   The port used for serving schemas',
      '  {cyan|-q}, {cyan|--silent}    {blue|boolean}  Disable the output reporting through the STDOUT',
      '  {cyan|-r}, {cyan|--formats}   {blue|string}   Require CommonJS-module for custom format generators',
      '  {cyan|-f}, {cyan|--fakeroot}  {blue|string}   Used to resolve $ref\'s from the given directory (optional)',
      '',
    ].join('\n')));
  },

  printError: function printError(message) {
    utils.println(utils.color.red(`${message} (use --help for usage info)`), true);
  },
};

module.exports = CLI;
