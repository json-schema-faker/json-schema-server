'use strict';

const fs = require('fs');


const color = require('cli-color');

function print(message) {
  process.stdout.write(message);
}

function println(message, error) {
  process[error ? 'stderr' : 'stdout'].write(`${message}\n`);
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
  const args = Array.prototype.slice.call(arguments, 1);

  return message.replace(/\{([.\w]+)\|([^{}]+)\}/g, function () {
    const colors = arguments[1];


    const msg = arguments[2];

    let colorized = color;


    const segments = colors.split('.');

    while (segments.length) {
      const key = segments.shift();

      if (!colorized[key]) {
        break;
      }

      colorized = colorized[key];
    }

    return colorized(msg);
  }).replace(/%s/g, function () {
    return args.shift();
  });
}

module.exports = {
  is_file,
  is_dir,
  read,
  print,
  println,
  style,
  color,
};
