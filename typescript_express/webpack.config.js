const path = require("path");

// eslint-disable-next-line no-console
console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}`)

module.exports = {
    entry: "./src/public/scripts/index.ts",
    devtool: "inline-source-map",
    mode: process.env.NODE_ENV || "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist", "public", "scripts"),
    },
};
