const { Event } = require('klasa');
const moment = require('moment');

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
		this.updateAvatar();
		await this.client.db.init();
	}

	async updateAvatar() {
		const today = moment();
		let url = this.client.user.avatarURL();
		switch (today.month()) {
			case 0:
				if (today.date() === 1) url = 'http://wiki.guildwars2.com/images/a/a4/Party_time_quaggan_icon.png';
				break;
			case 1:
				if (today.date() === 2) url = 'http://wiki.guildwars2.com/wiki/File:Pancakes_quaggan_icon.png';
				else if (today.date() === 14) url = 'http://wiki.guildwars2.com/images/6/68/Girly_quaggan_icon.png';
				break;
			case 6:
				url = 'http://wiki.guildwars2.com/images/0/03/Relax_quaggan_icon.png';
				break;
			case 7:
				url = 'http://wiki.guildwars2.com/images/e/e0/Bowl_icon.png';
				break;
			case 11:
				if (today.date() === 24) url = 'http://wiki.guildwars2.com/images/d/d1/Present_quaggan_icon.png';
				else url = 'http://wiki.guildwars2.com/images/2/25/Seasons_greetings_quaggan_icon.png';
				break;
		}
		this.client.user.setAvatar(url);
	}

	async init() {
		if (!this.client.gateways.guilds.schema.hasKey('channels')) {
			await this.client.gateways.guilds.schema.addFolder('channels', {
				bot: { type: 'TextChannel' },
				mod: { type: 'TextChannel' },
				starboard: { type: 'TextChannel' }
			});
		}
	}

};
