const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['dm'],
			cooldown: 10,
			aliases: [],
			usage: '<set> <api:regex/^[A-z0-9]{8}(?:-[A-z0-9]{4}){3}-[A-z0-9]{20}(?:-[A-z0-9]{4}){3}-[A-z0-9]{12}$/i>',
			usageDelim: ' ',
			extendedHelp: 'No extended help available.'
		});
	}

	async run(msg, [action, [api]]) {
		await this[action](msg, api);
	}

	async set(msg, api) {
		this.client.gateways.accounts.getEntry(msg.author.id, true).updateOne('apiKey', api, this.client.home);
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
