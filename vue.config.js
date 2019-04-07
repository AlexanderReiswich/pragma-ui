const path = require('path')

module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
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
