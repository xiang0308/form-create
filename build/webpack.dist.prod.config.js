const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const pkg = require("../package.json");

module.exports = {
    entry: __dirname + '/../src/index.js',
    output: {//输出文件
        filename: 'form-create.min.js',
        path: __dirname + '/../dist',
        library: 'formCreate',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
            'process.env.VERSION': `'${pkg.version}'`,
            'process.env.NODE_ENV': '"production"'
        }),
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css)$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new webpack.BannerPlugin('form-create v' + pkg.version + ' | github https://github.com/xaboy/form-create | author xaboy')
    ],
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.min.js',
            'iview': 'iview'
        }
    },
    externals: {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
        },
        iview: {
            root: 'iview',
            commonjs: 'iview',
            commonjs2: 'iview',
            amd: 'iview'
        }
    },
};
