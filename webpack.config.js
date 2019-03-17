const webpack = require('webpack');
const path = require('path');


const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	mode: 'development',
	node: { fs: 'empty' },
};
