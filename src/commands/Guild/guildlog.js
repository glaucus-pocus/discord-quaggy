const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			cooldown: 60,
			aliases: ['historique']
		});
	}

	async joined(entry) {
		return `${entry.user} a rejoint la guilde.`;
	}

	async invited(entry) {
		return `${entry.invited_by} a invité ${entry.user} à rejoindre la guilde.`;
	}

	async kick(entry) {
		return `${entry.kicked_by} a expulsé ${entry.user} de la guilde.`;
	}

	// eslint-disable-next-line camelcase
	async rank_change(entry) {
		return `${entry.changed_by} a passé ${entry.user} au rang de ${entry.new_rank}.`;
	}

	async treasury(entry) {
		return `${entry.user} a déposé [${entry.count} ${(await this.client.db.items.get(entry.item_id)).name}].`;
	}

	async stash(entry) {
		// eslint-disable-next-line max-len
		return `${entry.user} a ${entry.operation === 'deposit' ? 'déposé' : 'retiré'} ${entry.coins ? `${entry.coins} pièces` : `[${entry.count} ${(await this.client.db.items.get(entry.item_id)).name}]`} dans la banque de guilde.`;
	}

	async motd(entry) {
		return `${entry.user} a changé le mot du jour de la guilde.`;
	}

	async upgrade(entry) {
		return `${entry.user} a touché à une amélioration.`;
	}

	async run(msg) {
		const { guild } = this.client.gateways.guilds.getEntry(msg.channel.guild.id);
		if (!guild.apiKey) {
			return msg.send('Qoo ! Quaggy ne trouve pas de clef d\'API pour cette guilde ! Quaggy est triste ...');
		}
		if (!guild.id) {
			return msg.send('Qoo ! Quaggy ne trouve pas d\'identifiant pour cette guilde ! Quaggy est triste ...');
		}
		const res = await snekfetch.get(`https://api.guildwars2.com/v2/guild/${guild.id}/log`, { headers: { Authorization: `Bearer ${guild.apiKey}` } })
			.then(rs => rs.body);

		return msg.send([
			'```',
			...await Promise.all(res.slice(0, 100).map(entry => this[entry.type](entry))),
			'```'
		].join('\n'), {
			split: {
				prepend: '```',
				append: '```'
			}
		});
	}

};
