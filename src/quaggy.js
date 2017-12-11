const { Client } = require('klasa');
const { config, token, data } = require('./config');
const assets = require('./assets');
const Database = require('./lib/structures/Database');

class Quaggy extends Client {

	constructor(...params) {
		super(...params);

		this.data = data;
		this.assets = assets;
		this.db = new Database(this);
	}

	get home() {
		return this.guilds.get(this.data.home);
	}

}

new Quaggy(config).login(token);

module.exports = {
	Proxy: require('./lib/structures/Proxy'),
	Database
};
