const path = require('path')

module.exports = {
  css: {
    extract: false
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'async'
      }
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '~': path.resolve(__dirname, 'src/'),
        '@c': path.resolve(__dirname, 'src/components/'),
        '@img': path.resolve(__dirname, 'src/assets/img/')
      }
    }
  }
}
