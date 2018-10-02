'use strict';

const utils = require('./utils');


const pkg = require('../package.json');

const CLI = {

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
