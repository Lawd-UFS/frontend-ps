const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

const pagesPath = path.join(__dirname, 'src', 'pages');

const pages = fs.readdirSync(pagesPath).reduce(
  (acc, page) => {
    const [pageName, pageExtension] = page.split('.');

    if (pageExtension) {
      return acc;
    }

    acc.htmlPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(pagesPath, pageName, 'index.html'),
        filename: `${pageName}/index.html`,
        chunks: [pageName],
      }),
    );

    acc.entries[pageName] = path.join(pagesPath, pageName, 'index.js');

    return acc;
  },
  { htmlPlugins: [], entries: {} },
);

const config = {
  entry: {
    index: path.join(pagesPath, 'index.js'),
    ...pages.entries,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(pagesPath, 'index.html'),
      filename: 'index.html',
      chunks: ['index'],
    }),
    ...pages.htmlPlugins,
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(env),
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
