'use strict'
// This is the webpack config used for unit tests.
// NOTE: Jest is configured to use babel-jest and @vue/vue2-jest directly,
// so this file is kept for reference only and is not actively used.

const utils = require('./utils')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'none',
  module: {
    rules: utils.styleLoaders()
  },
  devtool: 'inline-source-map',
  resolveLoader: {
    alias: {
      'scss-loader': 'sass-loader'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/test.env')
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
