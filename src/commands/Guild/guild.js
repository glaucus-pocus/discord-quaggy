const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 10,
			aliases: ['guilde']
		});
	}

	async run(msg) {
		const guild = this.client.gateways.guilds.getEntry(msg.channel.guild.id);
		if (!guild.apiKey) {
			return msg.send('Qoo ! Quaggy ne trouve pas de clef d\'API pour cette guilde ! Quaggy est triste ...');
		}
		return msg.send('Qoo ! Quaggy ne sait pas encore faire ça !');
	}

	async init() {
		if (!this.client.gateways.guilds.schema.hasKey('apiKey')) {
			await this.client.gateways.guilds.schema.addKey('apiKey', {
				type: 'String',
				min: 72,
				max: 72
			});
		}
	}

};
