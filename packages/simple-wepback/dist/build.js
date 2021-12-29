(function (codeGraph) {
      function require (module) {
        function localRequire(relativePath){
          return require(codeGraph[module].dependencies[relativePath])
        }
        var exports = {};
        (function(require, exports, code) { eval(code) })(localRequire, exports, codeGraph[module].code)
        return exports
      }
      require('./src/index.js')
    })({"./src/index.js":{"dependencies":{"a.js":"./src/a.js"},"code":"\"use strict\";\n\nvar _a = require(\"a.js\");\n\n(0, _a.a)();"},"./src/a.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.a = a;\n\nfunction a() {\n  console.log('a');\n}"}})