import path from "node:path";
import type { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";

// TODO: split file into dev and prod <https://webpack.js.org/guides/production/>

const config: Configuration = {
  mode: "development",
  entry: {
    background: "./src/background/background.ts",
    content: "./src/content/content.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  devtool: "inline-source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "manifests/firefox.json", to: "manifest.json" }],
    }),
  ],
};

export default config;
