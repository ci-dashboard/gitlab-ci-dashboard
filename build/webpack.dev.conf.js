'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const portfinder = require('portfinder')

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devtool: config.dev.devtool,

  devServer: {
    client: {
      logging: 'warn',
      overlay: config.dev.errorOverlay
        ? { warnings: false, errors: true }
        : false,
    },
    historyApiFallback: true,
    hot: true,
    host: process.env.HOST || config.dev.host,
    port: process.env.PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    devMiddleware: {
      publicPath: config.dev.assetsPublicPath,
    },
    proxy: config.dev.proxyTable,
    watchFiles: {
      options: {
        poll: config.dev.poll,
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    ...(config.dev.useEslint ? [
      new EslintWebpackPlugin({
        extensions: ['js', 'vue'],
        formatter: 'stylish',
        emitWarning: !config.dev.showEslintErrorsInOverlay
      })
    ] : [])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      process.env.PORT = port
      devWebpackConfig.devServer.port = port

      console.log(`\n  Your application is running here: http://${config.dev.host}:${port}\n`)

      resolve(devWebpackConfig)
    }
  })
})
