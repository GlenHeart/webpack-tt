const config = require('../webpack.config')
const fs = require('fs')
const Parser = require('@babel/parser')
const { transformFromAst, transform } = require('@babel/core')
const traverse = require('@babel/traverse').default
const path = require('path')

let id = 0
let bundleId = 0
const installedChunks = {}
class Compier {
  constructor(options) {
    this.entry = options.entry
    this.modules = []
    this.output = options.output
  }
  run() {
    const info = this.build(this.entry)
    this.modules.push(info)
    for (let i = 0; i < this.modules.length; i++) {
      const { dependencies } = this.modules[i]
      for (const key in dependencies) {
        if (Object.hasOwnProperty.call(dependencies, key)) {
          const path = dependencies[key]
          this.modules.push(this.build(path))
        }
      }
    }
    const dependencyGraph = this.modules.reduce((graph, item) => {
      return {
        ...graph,
        [item.filename]: {
          dependencies: item.dependencies,
          code: item.code
        }
      }
    }, {})
    this.generate(dependencyGraph)
  }
  build(filename) {
    const content = fs.readFileSync(filename, 'utf-8')
    const ast = Parser.parse(content, {
      sourceType: 'module'
    })
    const dependencies = {}
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
          console.log(process.installedChunks, '1245')
        }
      }
    })
    const { code } = transformFromAst(ast, null, {
      plugins: [path.resolve(__dirname, './babel-plugin.js')],
      presets: ['@babel/preset-env']
    })
    return {
      id: id++,
      filename,
      dependencies,
      code
    }
  }
  generate(codeGraph) {
    const filePath = path.join(this.output.path, this.output.filename)
    const bundle = `(function (codeGraph) {
      function require (module) {
        function localRequire(relativePath){
          return require(codeGraph[module].dependencies[relativePath])
        }
        localRequire = require.import;
        var exports = {};
        (function(require, exports, code) { eval(code) })(localRequire, exports, codeGraph[module].code)
        return exports
      }
      var installedChunks = {}
      require.import = function (chunkId) {}
      require('${this.entry}')
    })(${JSON.stringify(codeGraph)})`
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}

new Compier(config).run()
