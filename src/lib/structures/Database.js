const Proxy = require('./Proxy');

class Database {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		this.achievements = new Proxy(client, { name: 'achievements' });
	}

	async init() {
		await this.achievements.init();
	}

}

module.exports = Database;
