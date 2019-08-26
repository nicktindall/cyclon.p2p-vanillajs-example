module.exports = {
    entry: './src/index.js',
    mode: 'development',

    devServer: {
        contentBase: './dist',
        compress: true,
        port: 9000
    }
}