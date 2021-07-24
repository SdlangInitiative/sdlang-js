const path = require("path");

module.exports = (env, argv) => {
  return {
    mode: "production",
    entry: {
      index: path.resolve(__dirname, "./dist/esm/index.js")
    },
    output: {
      path: path.resolve(__dirname, "./dist/umd"),
      filename: "[name].js", // index.js
      library: "sdlang",
      libraryTarget: "umd", // supports commonjs, amd and web browsers
      globalObject: "this"
    },
    module: {
      rules: [
        { 
            test: /\.t|js$/, 
            use: [
                { loader: "babel-loader" },
            ] 
        }
    ]
    }
  };
};