module.exports = {
  entry: './src/index.js',
  output: {
    filename: './script.js'
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.pegjs$/, loader: 'pegjs-loader' },
      { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader'}
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.pegjs']
  }
};
