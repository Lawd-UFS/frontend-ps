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
      const pageName = path.dirname(relativePath).replace(/\\/g, '/');
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
      const pageName = path.dirname(relativePath).replace(/\\/g, '/');
      entries[pageName] = fullPath;

      return;
    }
  });

  return { entries, htmlPlugins };
};

let processState = process.env.PROCESS_STATE || 'interview';

// Transição automática para o modo form se a data de início for atingida e o modo for countdown
if (processState === 'countdown' && process.env.PROCESS_START_DATE) {
  let dateStr = process.env.PROCESS_START_DATE;
  // Se não tiver fuso horário especificado (Z ou offset), assume o horário de Brasília (-03:00)
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(dateStr)) {
    dateStr += '-03:00';
  }
  const startDate = new Date(dateStr);
  if (new Date() >= startDate) {
    processState = 'form';
  }
}

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
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/entrevista\/.*/,
          to: '/entrevista/index.html',
        },
        {
          from: /^\/candidatos\/[a-fA-F0-9]{24}\/?$/,
          to: '/candidatos/perfil/index.html',
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
      'process.env.INTERVIEW_START_DATE': JSON.stringify(process.env.INTERVIEW_START_DATE),
      'process.env.INTERVIEW_END_DATE': JSON.stringify(process.env.INTERVIEW_END_DATE),
      'process.env.PROCESS_START_DATE': JSON.stringify(process.env.PROCESS_START_DATE),
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
