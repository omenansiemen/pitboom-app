
const common = (env) => {

	const plugins = []
	let sourceMapLoader = {}
	let devtool = ''
	if(env.dev) {
		try {
			const BitBarWebpackProgressPlugin = require("bitbar-webpack-progress-plugin")
			plugins.push(new BitBarWebpackProgressPlugin())
		} catch(ex) {}
		sourceMapLoader = {
			test: /\.js$/,
			use: ['source-map-loader'],
			enforce: 'pre'
		}
		devtool = 'source-map'
	}
	
	return {
		plugins, sourceMapLoader, devtool
	}
}

module.exports = common