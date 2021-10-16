const path = require("path")

module.exports = env => {

	return {
		entry: './src/electron/index.ts',
		output: {
			filename: 'electron-renderer.bundle.js'
		},
		target: 'electron-renderer',
		resolve: {
			extensions: ['.ts', '.js']
		},
		module: {
			rules: [
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
	}
}
