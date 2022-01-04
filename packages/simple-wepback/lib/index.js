const config = require('../webpack.config')
const fs = require('fs')
const path = require('path')
const { getAst, traverseAst, genCode } = require('./Parser')
const { AsyncSeriesHook, SyncHook } = require('tapable')

let id = 0

class Compier {
  constructor(options) {
    this.entry = options.entry
    this.modules = []
    this.output = options.output
    this.hooks = {
      run: new  AsyncSeriesHook(['compiler']),
      compier: new SyncHook(["params"])
    }
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
    const dependencies = {}
    const content = fs.readFileSync(filename, 'utf-8')
    const ast = getAst(content)
    traverseAst(ast, dependencies, filename)
    const code = genCode(ast)
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
      require.import = function (chunkId) {
        var promises = []
        var installedChunkData = installedChunks[chunkId]
        if (installedChunkData !== 0) {
          if (installedChunkData) {
            promises.push(installedChunkData[2])
          } else {
            const promise = new Promise(function (resolve, reject) {
              installedChunkData = installedChunks[chunkId] = [resolve, reject]
            })
            promises.push((installedChunkData[2] = promise))
            var script = document.createElement('script')
            var onScriptComplete
            var error = new Error()
            script.charset = 'utf-8'
            script.src = chunkId + '.bundle.js'
            document.head.appendChild(script)
            onScriptComplete = function (event) {
              script.onload = script.onerror = null
              clearTimeout(timeout)
              var chunk = installedChunks[chunkId]
              if (chunk !== 0) {
                if (chunk) {
                  var errorType =
                    event && (event.type === 'load' ? 'missing' : event.type)
                  var realSrc = event && event.target && event.target.src
                  error.message =
                    'Loading chunk ' + chunkId +
                    ' failed.(' +
                      errorType +
                    ': ' +
                    realSrc +
                    ')'
                  error.name = 'ChunkLoadError'
                  error.type = errorType
                  error.request = realSrc
                  chunk[1](error)
                }
              }
              var timeout = setTimeout(() => {
                onScriptComplete({ type: 'timeout', target: script })
              }, 120000)
            }
            script.onerror = script.onload = onScriptComplete
          }
        }
        return Promise.all(promises)
      }
      require('${this.entry}')
    })(${JSON.stringify(codeGraph)})`
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}


new Compier(config).run()
