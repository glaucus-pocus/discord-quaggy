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
		this.updateActivity();
		this.updateAvatar();
		await this.client.db.init();
	}

	async updateActivity() {
		const today = moment();
		let activity = '';
		switch (today.day()) {
			case 0:
				// sunday
				activity = 'Bagarre de barils';
				break;
			case 1:
			case 4:
				// monday and thursday
				activity = 'Lancer de crabe';
				break;
			case 2:
			case 5:
				// tuesday and friday
				activity = 'Course du Sanctuaire';
				break;
			case 3:
			case 6:
				// wednesday and saturday
				activity = 'Survie à Sud-Soleil';
		}
		this.client.user.setActivity(activity).catch(err => this.client.emit('log', err, 'error'));
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
