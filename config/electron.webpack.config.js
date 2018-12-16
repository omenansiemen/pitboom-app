// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
// const { CheckerPlugin } = require('awesome-typescript-loader')
const path = require("path")

module.exports = env => {

	const common = require('./common.webpack.config')
	const {plugins, sourceMapLoader, devtool} = common(env)

	return {
		entry: './src/electron/index.ts',
		output: {
			// path: path.resolve(__dirname, '../'),
			filename: 'electron-renderer.bundle.js'
		},
		target: 'electron-renderer',
		resolve: {
			extensions: ['.ts', '.js']
		},
		devtool,
		module: {
			rules: [
				sourceMapLoader,
				{
					test: /\.ts$/,
					loader: "ts-loader",
					options: {
						reportFiles: ["src/electron/**"],
						// configFile: 'src/engine/tsconfig.json'
					}
				}
			]
		},
		plugins
	}
}
