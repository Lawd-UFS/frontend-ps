const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pagesPath = path.join(__dirname, 'src', 'pages');

const config = {
    entry: {
        home: path.join(pagesPath, 'home', 'home.js'),
        about: path.join(pagesPath, 'about', 'about.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[contenthash].js'
    },
    devServer: {
        open: true,
        host: 'localhost'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(pagesPath, 'home', 'home.html'),
            filename: 'home.html',
            chunks: ['home']
        }),
        new HtmlWebpackPlugin({
            template: path.join(pagesPath, 'about', 'about.html'),
            filename: 'about.html',
            chunks: ['about']
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
    mode: 'development',
};

module.exports = config;
