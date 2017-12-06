const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text', 'dm', 'group'],
			cooldown: 10,
			aliases: ['compte']
		});
	}

	async run(msg) {
		const account = this.client.gateways.accounts.getEntry(msg.author.id);
		if (!account.apiKey) {
			return msg.send('Qoo ! Tu n\'as pas donné à Quaggy ta clef d\'API ! Quaggy est triste ...');
		}
		return msg.send('Qoo ! Quaggy ne sait pas encore faire ça !');
	}

	async init() {
		if (!this.client.gateways.accounts) {
			this.client.gateways.add('accounts', async (resolver, user) => {
				const result = await resolver.user(user);
				if (!result) throw 'The parameter <User> expects either a User Id or a User Object.';
				return result;
			}, {
				apiKey: {
					type: 'String',
					min: 72,
					max: 72
				}
			});
		}
	}

};
