const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: './src/frontend/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/frontend'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'COMEYA! - Sistema de Comedores',
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_MAPBOX_TOKEN': JSON.stringify(process.env.REACT_APP_MAPBOX_TOKEN || ''),
      'import.meta.env.VITE_MAPBOX_TOKEN': JSON.stringify(process.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiemV0YWplYyIsImEiOiJjbWYxYXY4NnYyN3JhMmtxMmsxdTAxamprIn0.t5jfSaTa---6XVQIJzLNUw'),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 5173,
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    ],
  },
  mode: 'development',
};
