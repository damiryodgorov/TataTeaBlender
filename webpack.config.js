var path = require('path');
var webpack = require('webpack');
process.noDeprecation = true;
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
      },
      {
        test: /\.css$/,
        loader: 'style-loader'
      }, 
      {
        test: /\.css$/,
        loader: 'css-loader',
        query: {
         modules: true,
         localIdentName: '[name]__[local]___[hash:base64:5]'
        }
      }
    ]
  },
};