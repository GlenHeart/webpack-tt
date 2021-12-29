const config = require('../webpack.config');
const fs = require('fs');
const Parser = require('@babel/parser');
const { transformFromAst } = require('@babel/core');
const traverse = require('@babel/traverse').default;
const path = require('path');

class Compier {
  constructor(options) {
    this.entry = options.entry;
    this.modules = [];
    this.output = options.output;
  }
  run () {
    const info = this.build(this.entry)
    this.modules.push(info)
    this.modules.forEach(({ dependencies }) => {
      for (const key in dependencies) {
        if (Object.hasOwnProperty.call(dependencies, key)) {
          const path = dependencies[key];
          this.modules.push(this.build(path))
        }
      }
    })
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
  build (filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    const ast = Parser.parse(content, {
      sourceType: 'module',
    });
    const dependencies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        dependencies[node.source.value] = `./${path.join(path.dirname(filename), node.source.value)}`;
      }
    })
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    })
    return {
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
        var exports = {};
        (function(require, exports, code) { eval(code) })(localRequire, exports, codeGraph[module].code)
        return exports
      }
      require('${this.entry}')
    })(${JSON.stringify(codeGraph)})`
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}

new Compier(config).run();