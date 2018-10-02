const exec = require('child_process').exec;

const exitEventName = process.version.split('.')[1] === '6' ? 'exit' : 'close';

let child = null;

process.on(exitEventName, () => {
  if (child) {
    child.kill('SIGINT');
  }
});

function execCommand(cmd, callback) {
  execCommand.stdout = '';
  execCommand.stderr = '';
  execCommand.exitStatus = null;

  const cli = ['./bin/json-schema-server'];

  if (typeof cmd === 'function') {
    callback = cmd;
  } else {
    cli.push(cmd);
  }

  if (child) {
    child.kill('SIGINT');
  }

  child = exec(cli.join(' '));

  let t = null;

  const s = [];
  const e = [];

  function killme() {
    clearTimeout(t);
    t = setTimeout(() => {
      execCommand.stdout = s.join('');
      execCommand.stderr = e.join('');

      callback();
    }, 100);
  }

  child.stderr.on('data', text => {
    e.push(text);
    killme();
  });

  child.stdout.on('data', text => {
    s.push(text);
    killme();
  });

  child.on(exitEventName, code => {
    execCommand.stdout = s.join('');
    execCommand.stderr = e.join('');
    execCommand.exitStatus = code;
  });
}

module.exports = execCommand;
