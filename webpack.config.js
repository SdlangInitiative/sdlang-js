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

                // Minimise private variable and function names, as the user has no reason to be calling those,
                // and it saves a decent amount of space.
                { 
                    loader: "string-replace-loader",
                    options: {
                        multiple: [
                            // ast_visitor.ts
                            { search: /_parentStack/g, replace: "_a" },
                            { search: /_currentNode/g, replace: "_b" },

                            // attribute.ts

                            // index.ts

                            // lexer.ts
                            { search: /_cursor/g, replace: "_a" },
                            { search: /_token/g, replace: "_b" },
                            { search: /_line/g, replace: "_c" },
                            { search: /_column/g, replace: "_d" },
                            { search: /_lastPeekCharsRead/g, replace: "_e" },
                            { search: /_lastPeekEscaped/g, replace: "_f" },
                            { search: /_lastPeekNewLineCount/g, replace: "_g" },
                            { search: /_lastPeekNewLineCursor/g, replace: "_h" },
                            { search: /_input/g, replace: "_i" },
                            { search: /_lastReadEndCursor/g, replace: "_j" },
                            { search: /readImpl/g, replace: "_0" },
                            { search: /readComment/g, replace: "_1" },
                            { search: /readIdentifierOrBooleanOrNull/g, replace: "_2" },
                            { search: /readString/g, replace: "_3" },
                            { search: /readNumberOrDateOrTimeOrTimespan/g, replace: "_4" },
                            { search: /readTime/g, replace: "_5" },
                            { search: /readDateOrDateTime/g, replace: "_6" },
                            { search: /isCommentStartChar/g, replace: "_7" },
                            { search: /peekChar/g, replace: "_8" },
                            { search: /commitPeek/g, replace: "_9" },
                            { search: /nextChar/g, replace: "_k" },
                            { search: /isEof/g, replace: "_l" },
                            { search: /skipSpacesAndTabs/g, replace: "_m" },
                            { search: /readToEndOrChar/g, replace: "_n" },
                            { search: /readToEndOrAnyChar/g, replace: "_o" },

                            // named.ts
                            { search: /_name/g, replace: "_a" },
                            { search: /_namespace/g, replace: "_b" },
                            { search: /_namespaceColonIndex/g, replace: "_c" },
                            { search: /_qualifiedName/g, replace: "_d" },

                            // pusher.ts

                            // tag.ts (inherits named.ts)
                            { search: /_children/g, replace: "_0a" },
                            { search: /_attributes/g, replace: "_0b" },
                            { search: /_values/g, replace: "_0c" },

                            // value.ts
                        ]
                    }
                }
            ] 
        }
    ]
    }
  };
};