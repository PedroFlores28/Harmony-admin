module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', require('path').resolve(__dirname, 'src'))
  }
}


