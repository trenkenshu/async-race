const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { NetlifyPlugin } = require('netlify-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';
const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  entry: './src/index.tsx',
  output: {
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      publicPath: '/',
  },
  devServer: {
      open: true,
      host: 'localhost',
      historyApiFallback: true,
  },
  plugins: [
      new HtmlWebpackPlugin({
          template: 'src/index.html',
      }),
      new NetlifyPlugin({
        redirects: [
            {
                from: "/*",
                to: "/index.html",
                status: 200
            }
        ]
      }),
      new MiniCssExtractPlugin(),
  ],
  module: {
      rules: [
          {
              test: /\.tsx?$/,
              loader: "babel-loader"
          },
          {
              test: /\.(ts|tsx)$/i,
              loader: 'ts-loader',
              exclude: ['/node_modules/'],
          },
          {
              test: /\.css$/i,
              use: [stylesHandler, 'css-loader'],
          },
          {
            test: /\.svg$/i,
            use: ['@svgr/webpack'],
          },
          {
              test: /\.(eot|ttf|woff|woff2|png|jpg|gif)$/i,
              type: 'asset',
          },
      ],
  },
  resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
};


module.exports = () => {
  if (isProduction) {
      config.mode = 'production';
  } else {
      config.mode = 'development';
      config.devtool = 'eval-source-map';
  }
  return config;
};