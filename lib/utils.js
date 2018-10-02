const fs = require('fs');
const color = require('cli-color');

function print(message) {
  process.stdout.write(message);
}

function println(message, error) {
  process[error ? 'stderr' : 'stdout'].write(`${message}\n`);
}

function isFile(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
}

function isDir(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isDirectory();
}

function read(filepath) {
  return fs.readFileSync(filepath);
}

function style(message) {
  const args = Array.prototype.slice.call(arguments, 1);

  return message.replace(/\{([.\w]+)\|([^{}]+)\}/g, (_, colors, msg) => {
    const segments = colors.split('.');

    let colorized = color;

    while (segments.length) {
      const key = segments.shift();

      if (!colorized[key]) {
        break;
      }

      colorized = colorized[key];
    }

    return colorized(msg);
  }).replace(/%s/g, () => {
    return args.shift();
  });
}

module.exports = {
  isFile,
  isDir,
  read,
  print,
  println,
  style,
  color,
};
