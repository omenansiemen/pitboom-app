const electronConfig = require("./config/electron.webpack.config");

module.exports = (env) => {
	return [
		electronConfig(env)
	]
};