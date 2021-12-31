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
    })({"./src/index.js":{"dependencies":{"a.js":"./src/a.js"},"code":"\"use strict\";\n\nvar _a = require(\"a.js\");\n\n(0, _a.a)();"},"./src/a.js":{"dependencies":{"./b.js":"./src/b.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.a = a;\n\nvar _b = require(\"./b.js\");\n\nfunction a() {\n  require[\"import\"](0).then(function (c) {\n    console.log(c, 'b');\n  });\n\n  console.log(_b.b, 'a');\n}"},"./src/b.js":{"dependencies":{"./common.js":"./src/common.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.b = void 0;\n\nvar _common = _interopRequireDefault(require(\"./common.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_common[\"default\"], 'c');\nvar b = 4;\nexports.b = b;"},"./src/common.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _default = 1234;\nexports[\"default\"] = _default;"}})