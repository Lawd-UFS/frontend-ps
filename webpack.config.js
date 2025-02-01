const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

const pagesPath = path.join(__dirname, 'src', 'pages');

const generatePages = (root = '', dir = pagesPath) => {
  const entries = {};
  const htmlPlugins = [];

  const readDir = path.join(dir, root);

  fs.readdirSync(readDir).forEach((file) => {
    const fullPath = path.join(dir, root, file);
    const relativePath = path.join(root, file);
    const fileStat = fs.statSync(fullPath);

    if (readDir === dir && !fileStat.isDirectory()) return;

    if (fileStat.isDirectory()) {
      const { entries: subEntries, htmlPlugins: subHtmlPlugins } =
        generatePages(relativePath);
      htmlPlugins.push(...subHtmlPlugins);
      Object.assign(entries, subEntries);

      return;
    }

    if (file == 'index.html') {
      const pageName = relativePath.split('/').slice(0, -1).join('/');
      htmlPlugins.push(
        new HtmlWebpackPlugin({
          template: fullPath,
          favicon: path.join(__dirname, 'src', 'assets', 'favicon.ico'),
          filename: `${pageName}/index.html`,
          chunks: [pageName, 'global'],
        }),
      );

      return;
    }

    if (file == 'index.js') {
      const pageName = relativePath.split('/').slice(0, -1).join('/');
      entries[pageName] = fullPath;

      return;
    }
  });

  return { entries, htmlPlugins };
};

const pages = generatePages();

const config = {
  entry: {
    index: path.join(pagesPath, 'index.js'),
    global: path.join(pagesPath, 'global.js'),
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
      favicon: path.join(__dirname, 'src', 'assets', 'favicon.ico'),
      filename: 'index.html',
      chunks: ['index', 'global'],
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
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        type: 'asset/source',
      },
    ],
  },
  mode: 'development',
};

module.exports = config;
