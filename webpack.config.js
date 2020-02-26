// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const production = process.env.NODE_ENV === "production";

// eslint-disable-next-line no-console
console.log(`Mode: ${production
    ? "production" : "development"
} (process.env.NODE_ENV=${process.env.NODE_ENV})`);

module.exports = {
    entry: {
        main: "./src/public/scripts/index.ts",
        error: "./src/public/scripts/error.ts",
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
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    output: {
        filename: "[name]_bundle.js",
        path: path.resolve(__dirname, "dist", "public", "scripts")
    }
};
