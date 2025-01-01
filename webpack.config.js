const path = require("path");

module.exports = {
  entry: "./src/index.ts", // Adjust if the entry file is different
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production", // Use 'development' for debugging builds
};
