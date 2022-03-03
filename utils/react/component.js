const getComponentStyles = ({ name, style }) => {
  let styleImport = ''
  let returnStatement = `return <>${name} goes here.</>`

  if (style === 'styled') {
    styleImport = `
import { StyledBlock } from './${name}.${style}'`
    returnStatement = `return (
    <>
      <StyledBlock>${name} goes here.</StyledBlock>
    </>
  )`
  } else if (['css', 'sass'].includes(style)) {
    const styleExtensionMap = {
      'sass': 'scss'
    }
    styleImport = `
import styles from './${name}.module.${styleExtensionMap[style] || style}'`
    returnStatement = `return (
    <>
      <p className={styles.line}>${name} goes here.</p>
    </>
  )`
  }

  return {
    styleImport,
    returnStatement,
  }
}

const jsFunctionaComponent = (options) => {
  const { name } = options
  const { styleImport, returnStatement } = getComponentStyles(options)

  return `import React from 'react'${styleImport}

function ${name}() {
  ${returnStatement}
}

export default ${name}
`
}

const tsFunctionaComponent = (options) => {
  const { name } = options
  const { styleImport, returnStatement } = getComponentStyles(options)

  return `import { FC } from 'react'
${styleImport}

const ${name}: FC = () => {
  ${returnStatement}
}

export default ${name}
`
}

function getFunctionalComponentCode(options) {
  const { extension } = options
  if (extension === 'tsx') {
    return tsFunctionaComponent(options)
  }

  return jsFunctionaComponent(options)
}

module.exports = {
  getFunctionalComponentCode
}