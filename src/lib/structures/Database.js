const Proxy = require('./Proxy');

class Database {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		this.achievements = new Proxy(client, { name: 'achievements' });
		this.items = new Proxy(client, { name: 'items' });
		this.titles = new Proxy(client, { name: 'titles' });
		this.professions = new Proxy(client, { name: 'professions' });
		this.backstories = new Proxy(client, { name: 'backstories', endpoint: 'backstory/answers' });
	}

	async init() {
		await Promise.all([
			this.achievements.init(),
			this.items.init(),
			this.titles.init(),
			this.professions.init(),
			this.backstories.init()
		]);
	}

}

module.exports = Database;
