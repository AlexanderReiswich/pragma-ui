const path = require('path')

// This is a dummy config to help IntelliJ resolve path aliases
module.exports = {
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      '~': path.resolve(__dirname, 'src/'),
      '@c': path.resolve(__dirname, 'src/components/'),
      '@img': path.resolve(__dirname, 'src/assets/img/')
    }
  }
}
