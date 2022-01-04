var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js', // code splitting的chunk是异步(动态)加载，需要指定chunkFilename(具体可以了解和filename的区别)
    },
    optimization: {
        minimize: false
    }
}
