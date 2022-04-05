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
var mdTS = {
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
}
var cw = {
  entry: './public/cw.js',
  output: { path: __dirname, filename: './public/cwbundle.js' },
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
}

module.exports = {
  mode: 'development',
  entry: {
    
    cw:'./public/cw.js',
    combo:'./public/combo.js',
    tata:'./public/tata.js',
    if:'./public/iframe.js',
    stealthMD:'./public/stealthMD.js'
    /*
    md:'./public/index.js',
    xray:'./public/xray.js',
    dual:'./public/dual.js',
    */
  },
  output: { path: __dirname+ '/public/', filename: '[name].bundle.js' },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['@babel/react','@babel/env'],
          plugins: ['@babel/proposal-class-properties']
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