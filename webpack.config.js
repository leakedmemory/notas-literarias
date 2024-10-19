const path = require("node:path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// TODO: split file into dev and prod <https://webpack.js.org/guides/production/>
module.exports = {
  mode: "development",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devtool: "inline-source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifests/firefox.json", to: "manifest.json" },
        { from: "src/content.css", to: "." },
      ],
    }),
  ],
};
