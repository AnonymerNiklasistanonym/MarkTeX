/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

const production = process.env.NODE_ENV !== "development";

// eslint-disable-next-line no-console
console.log(`Mode: ${production
    ? "production" : "development"
} (process.env.NODE_ENV=${process.env.NODE_ENV})`);

const plugins = [
    new webpack.DefinePlugin({
        DEBUG_APP: !production
    })
];

if (production) {
    // Compress scripts in production for smaller file size
    plugins.push(new CompressionPlugin({
        algorithm: "gzip",
        cache: true
    }));
}

module.exports = {
    entry: {
        main: "./src/public/scripts/index.ts",
        error: "./src/public/scripts/error.ts",
        document: "./src/public/scripts/document.ts",
        login: "./src/public/scripts/login.ts",
        testing: "./src/public/scripts/testing.ts"
    },
    devtool: production ? undefined : "inline-source-map",
    mode: production ? "production" : "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    plugins,
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    output: {
        filename: "[name]_bundle.js",
        path: path.resolve(__dirname, "dist", "public", "scripts")
    }
};
