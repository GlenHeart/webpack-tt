const Parser = require('@babel/parser')
const { transformFromAst, transform } = require('@babel/core')
const traverse = require('@babel/traverse').default
const fs = require('fs')
const path = require('path')
let bundleId = 0
const installedChunks = {}

function getAst(content) {
  const ast = Parser.parse(content, {
    sourceType: 'module'
  })
  return ast
}
function traverseAst(ast, dependencies, filename) {
  traverse(ast, {
    ImportDeclaration({ node }) {
      dependencies[node.source.value] = `./${path.join(
        path.dirname(filename),
        node.source.value
      )}`
    },
    CallExpression({ node }) {
      if (node.callee.type === 'Import') {
        const realPath = path.join(
          path.dirname(filename),
          node.arguments[0].value
        )
        let source = fs.readFileSync(realPath, 'utf-8')
        const { code } = transform(source, {
          presets: ['@babel/preset-env']
        })
        source = `jsonp.load([${bundleId}, function(){${code}}])`
        fs.writeFileSync(`./dist/${bundleId}.bundle.js`, source)
        installedChunks[realPath] = bundleId
        bundleId++
        process.installedChunks = {
          nowPath: path.dirname(filename),
          ...installedChunks
        }
      }
    }
  })
  return dependencies
}
function genCode(ast) {
  const { code } = transformFromAst(ast, null, {
    plugins: [path.resolve(__dirname, './babel-plugin.js')],
    presets: ['@babel/preset-env']
  })
  return code
}
module.exports = {
  getAst,
  traverseAst,
  genCode
}