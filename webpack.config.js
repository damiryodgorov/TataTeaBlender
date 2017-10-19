var path = require('path');
var webpack = require('webpack');
 
/*module.exports = {
  entry: './public/testindex.js',
  output: { path: __dirname, filename: './public/bundletest.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react','env']
        }
      }
    ]
  },
};*/
module.exports = {
  entry: './public/index.js',
  output: { path: __dirname, filename: './public/bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react','env']
        }
      }
    ]
  },
};