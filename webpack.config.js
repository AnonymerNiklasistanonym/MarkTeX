/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

const production = process.env.NODE_ENV !== "development";

// eslint-disable-next-line no-console
console.log(`Mode: ${production ? "production" : "development"} (process.env.NODE_ENV=${process.env.NODE_ENV})`);

/** @type {webpack.Plugin[]} */
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

/** @type {webpack.Configuration} */
module.exports = {
    devtool: production ? undefined : "inline-source-map",
    entry: {
        account: "./src/public/scripts/account.ts",
        document: "./src/public/scripts/document.ts",
        error: "./src/public/scripts/error.ts",
        group: "./src/public/scripts/group.ts",
        home: "./src/public/scripts/home.ts",
        login: "./src/public/scripts/login.ts",
        testing: "./src/public/scripts/testing.ts"
    },
    mode: production ? "production" : "development",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader"
            }
        ]
    },
    output: {
        filename: "[name]_bundle.js",
        path: path.resolve(__dirname, "dist", "public", "scripts")
    },
    plugins,
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    }
};
