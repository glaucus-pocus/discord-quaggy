const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			cooldown: 60,
			aliases: ['trésor']
		});
	}

	async run(msg) {
		const { guild } = this.client.gateways.guilds.getEntry(msg.channel.guild.id);
		if (!guild.apiKey) {
			return msg.send('Qoo ! Quaggy ne trouve pas de clef d\'API pour cette guilde ! Quaggy est triste ...');
		}
		if (!guild.id) {
			return msg.send('Qoo ! Quaggy ne trouve pas d\'identifiant pour cette guilde ! Quaggy est triste ...');
		}
		const res = await snekfetch.get(`https://api.guildwars2.com/v2/guild/${guild.id}/treasury`, { headers: { Authorization: `Bearer ${guild.apiKey}` } })
			.then(rs => rs.body);

		const itemIds = res.map(item => item.item_id);
		await this.client.db.items.loadMany(itemIds);
		const calculateMissing = (item) => item.needed_by.reduce((sum, val) => sum + val.count, 0) - item.count;
		const resp = [
			'```md',
			...await Promise.all(res.filter(calculateMissing).map(item => this.client.db.items.get(item.item_id).then(it => `[${it.name}](${calculateMissing(item)})`))),
			'```'
		].join('\n');
		return msg.send(resp);
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
