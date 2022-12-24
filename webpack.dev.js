const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js')

const manager = merge(common[0],{
    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        client: {
            overlay: {
                errors: false,
                warnings: false,
            },
        },
        host: "0.0.0.0",
        https: true,
    },
})
module.exports = [manager];