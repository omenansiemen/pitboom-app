const electronConfig = require("./config/electron.webpack.config");

module.exports = (env) => {
	env = env || {}
	return [
		electronConfig(env)
	]
};