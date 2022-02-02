const shell = require('shelljs');

function createDirectory(pathWithName) {
  return shell.mkdir('-p', pathWithName)
}

function createFile(options) {
  const { pathToFile, data = '' } = options
  return shell.echo(data).to(pathToFile)
}

module.exports = {
  createDirectory,
  createFile,
}