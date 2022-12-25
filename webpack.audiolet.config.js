/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    // mode: "development",
    mode: "production",
    entry: path.resolve(__dirname, "worklet/src/volume-worklet-processor.ts"),
    output: {
        path: path.resolve(__dirname, "worklet/dist"),
        filename: "index.js",
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
        // fallback: {
        //     buffer: require.resolve("buffer/"),
        //     fs: false,
        //     path: false,
        // },
    },
    module: {
        rules: [
            {
                test: [/\.ts$/, /\.tsx$/],
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            // transpileOnly: true,
                            configFile: "tsconfig.audiolet.json",
                        },
                    },
                ],
            },
        ],
    },
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         Buffer: ["buffer", "Buffer"],
    //         process: "process/browser",
    //     }),
    // ]
};
