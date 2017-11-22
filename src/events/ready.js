const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			name: 'ready',
			enabled: true
		});
	}

	async run() {
		const { prefix } = this.client.config;
		this.client.user.setActivity(`${prefix[prefix.length - 1]}help`).catch(err => this.client.emit('log', err, 'error'));
		await this.client.db.init();
	}

	async init() {
		if (!this.client.settings.guilds.schema.hasKey('channels')) {
			await this.client.settings.guilds.schema.addFolder('channels', {
				bot: { type: 'TextChannel' },
				mod: { type: 'TextChannel' },
				starboard: { type: 'TextChannel' }
			});
		}
	}

};
