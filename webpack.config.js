const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    mode: 'development',

    plugins: [new HtmlWebpackPlugin({
        title: "Minimal vanillaJS cyclon.p2p WebRTC example",
        template: "./src/index.html"
    })],
    devServer: {
        contentBase: './dist',
        compress: true,
        port: 9000
    }
};