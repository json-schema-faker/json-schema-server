exec = require('child_process').exec
child = null

exitEventName =
  if process.version.split('.')[1] is '6' then 'exit' else 'close'

process.on exitEventName, ->
  if child
    child.kill 'SIGINT'

execCommand = (cmd, callback) ->
  execCommand.stdout = ''
  execCommand.stderr = ''
  execCommand.exitStatus = null

  cli = ['./bin/json-schema-server']

  if typeof cmd is 'function'
    callback = cmd
  else
    cli.push cmd

  if child
    child.kill 'SIGINT'

  child = exec cli.join(' ')

  t = null
  s = []
  e = []

  killme = ->
    clearTimeout t
    t = setTimeout ->
      execCommand.stdout = s.join('')
      execCommand.stderr = e.join('')
      callback()
    , 100

  child.stderr.on 'data', (text) ->
    e.push(text)
    killme()

  child.stdout.on 'data', (text) ->
    s.push(text)
    killme()

  child.on exitEventName, (code) ->
    execCommand.stdout = s.join('')
    execCommand.stderr = e.join('')
    execCommand.exitStatus = code

module.exports = execCommand
