(function (codeGraph) {
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
      require('./src/index.js')
    })({"./src/index.js":{"dependencies":{},"code":"\"use strict\";\n\nrequire[\"import\"](0).then(function (c) {\n  console.log(c, 'b');\n});"}})