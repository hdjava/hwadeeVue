// springboot2+vue整合
var path = require('path')
module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    productionSourceMap: true,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    host: '127.0.0.1',
    port: 9009,
    autoOpenBrowser: true,
    autoOpenPage: '/login',
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        pathRewrite: {
          '^/api': '/'
        }
      }
    },
    cssSourceMap: true,
    devtool: 'cheap-module-eval-source-map'
  }
}
