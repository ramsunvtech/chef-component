#! /usr/bin/env node
const program = require('commander')
const fs = require('fs')
const es = require('event-stream')
const {
  hasWhiteSpace,
  findIndentCount,
} = require('./utils/string')
const { getFunctionalComponentCode } = require('./utils/react/component')
const { getComponentStyleCode } = require('./utils/react/styles')
const { createDirectory, createFile } = require('./utils/files')
const { initStore } = require('./utils/path')
const { error } = require('./utils/message')
const packageJson = require("./package.json");

program
  .name('@chef/component')
  .description('CLI to generate your component skeleton in few seconds')
  .version(packageJson.version)
  .option('-f, --definitionFile <value>', 'definition file')
  .option('-s, --style <value>', 'component style type are css or sass or styled')
  .option('-l, --location <value>', 'location separated by slashes')
  .option('-e, --extension <value>', 'component types are jsx or js or tsx')
  .parse()

const firstParam = program.args[0]
const { definitionFile, style, location = 'components', extension = 'js' } = program.opts()
const generateLocation = location.split('/')

const { basePath, setBasePath, getBasePath, removeLastPathItem } = initStore(generateLocation)

let lineNumber = 0;
const TYPE = 'react'
const SPACER = 'space'
const INDENT_SIZE = 2
const FILE_EXTENSION = extension
const DEFINITION_FILE = firstParam || definitionFile

if (!DEFINITION_FILE) {
  error('Please provide a indented definition file.')
}

let currentIndentation = 0

const createComponentSet = (line) => {
  if (line.indexOf('/') === -1) {
    const componentName = line.trim()
    const componentCode = getFunctionalComponentCode({
      extension,
      name: componentName,
      style
    })
    const indexFileExtensionMap = {
      'tsx': 'ts',
      'jsx': 'js',
    }
    const componentIndexFileExtension = indexFileExtensionMap[FILE_EXTENSION] || FILE_EXTENSION

    createFile({
      pathToFile: `${getBasePath()}/${componentName}.${FILE_EXTENSION}`,
      data: componentCode
    })
    createFile({
      pathToFile: `${getBasePath()}/index.${componentIndexFileExtension}`,
      data: `export { default } from './${componentName}'`
    })

    if (['css', 'sass', 'styled'].includes(style)) {
      const styleExtensionMap = {
        'styled': `${style}.js`,
        'sass': 'module.scss',
        'css':  `module.css`
      }

      const STYLE_FILE_EXTENSION = styleExtensionMap[style]
      const componentStyleCode = getComponentStyleCode({
        style
      })
      createFile({
        pathToFile: `${getBasePath()}/${componentName}.${STYLE_FILE_EXTENSION}`,
        data: componentStyleCode
      })
    }
  }
}

const fileStream = fs.createReadStream(DEFINITION_FILE)
  .pipe(es.split())
  .pipe(es.mapSync(function (line) {

    if (!hasWhiteSpace(line) && currentIndentation === 0) {
      setBasePath(line)
      createDirectory(getBasePath())
    } else if (hasWhiteSpace(line)) {
      if (currentIndentation === findIndentCount(line)) {
        basePath.splice(-1, 1, line.trim())
      } else if (findIndentCount(line) > currentIndentation) {
        setBasePath(line)
      } else if (findIndentCount(line) < currentIndentation) {
        const repeatTimes = currentIndentation / findIndentCount(line)
        const repeatTimesArray = new Array(Math.ceil(repeatTimes)).fill(7)
        repeatTimesArray.forEach(() => removeLastPathItem())
        setBasePath(line)
      }
      currentIndentation = findIndentCount(line)
      createDirectory(getBasePath())
      createComponentSet(line)
    }

    // pause the readstream
    fileStream.pause();

    lineNumber += 1;

    // process line here and call fileStream.resume() when rdy
    // function below was for logging memory usage
    // logMemoryUsage(lineNumber);

    // resume the readstream, possibly from a callback
    fileStream.resume();
  })
    .on('error', function (err) {
      console.log('Error while reading file.', err);
    })
    .on('end', function () {
      console.log('Happy Coding!')
    })
  );