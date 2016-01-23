'use strict';

var fs = require('fs'),
    color = require('cli-color');

function print(message) {
  process.stdout.write(message);
}

function println(message) {
  process.stdout.write(message + '\n');
}

function is_file(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
}

function is_dir(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isDirectory();
}

function read(filepath) {
  return fs.readFileSync(filepath);
}

function style(message) {
  var args = Array.prototype.slice.call(arguments, 1);

  return message.replace(/\{([.\w]+)\|([^{}]+)\}/g, function() {
    var colors = arguments[1],
        msg = arguments[2];

    var colorized = color,
        segments = colors.split('.');

    while (segments.length) {
      var key = segments.shift();

      if (!colorized[key]) {
        break;
      }

      colorized = colorized[key];
    }

    return colorized(msg);
  }).replace(/%s/g, function() {
    return args.shift();
  });
}

module.exports = {
  is_file: is_file,
  is_dir: is_dir,
  read: read,
  print: print,
  println: println,
  style: style,
  color: color
};
