const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const dotenv = require('dotenv');

dotenv.config();

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
    if (readDir === dir && file === 'home') return;

    if (fileStat.isDirectory()) {
      const { entries: subEntries, htmlPlugins: subHtmlPlugins } =
        generatePages(relativePath);
      htmlPlugins.push(...subHtmlPlugins);
      Object.assign(entries, subEntries);

      return;
    }

    if (file == 'index.html') {
      const pageName = path.dirname(relativePath);
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
      const pageName = path.dirname(relativePath);
      entries[pageName] = fullPath;

      return;
    }
  });

  return { entries, htmlPlugins };
};

const processState = process.env.PROCESS_STATE || 'closed';
const homeStateDir = path.join(pagesPath, 'home', 'states', processState);

const homePage = {
  entry: path.join(homeStateDir, 'index.js'),
  htmlPlugin: new HtmlWebpackPlugin({
    template: path.join(homeStateDir, 'index.html'),
    favicon: path.join(__dirname, 'src', 'assets', 'favicon.ico'),
    filename: 'index.html',
    chunks: ['index'],
  }),
};

const pages = generatePages();

const config = {
  entry: {
    index: homePage.entry,
    global: path.join(pagesPath, 'global.js'),
    ...pages.entries,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    publicPath: '/',
  },
  devServer: {
    open: true,
    host: 'localhost',
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/entrevista\/.*/,
          to: '/entrevista/index.html',
        },
      ],
    },
  },
  plugins: [
    ...pages.htmlPlugins,
    homePage.htmlPlugin,
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
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
        oneOf: [
          {
            issuer: /\.js$/i,
            type: 'asset/source',
          },
          {
            type: 'asset/resource',
          },
        ],
      },
      {
        test: /\.html$/i,
        use: 'html-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  mode: 'production',
};

module.exports = config;
