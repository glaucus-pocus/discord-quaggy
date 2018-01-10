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
		const { quaggans } = this.client.assets;
		const current = this.client.user.avatarURL();
		let url = quaggans.pancake;
		switch (today.month()) {
			case 0:
				if (today.date() === 1) url = quaggans.party;
				break;
			case 1:
				if (today.date() === 2) url = quaggans.pancake;
				else if (today.date() === 14) url = quaggans.girly;
				break;
			case 6:
				url = quaggans.relax;
				break;
			case 7:
				url = quaggans.bowl;
				break;
			case 11:
				if (today.date() === 24) url = quaggans.present;
				else url = quaggans.christmas;
				break;
		}
		if (current !== url) this.client.user.setAvatar(url);
	}

	async init() {
		const { guilds, users } = this.client.gateways;

		/* update guilds schema */
		if (!guilds.schema.hasKey('channels')) {
			await guilds.schema.addFolder('channels', {
				bot: { type: 'TextChannel' },
				mod: { type: 'TextChannel' },
				starboard: { type: 'TextChannel' }
			});
		}
		if (!guilds.schema.hasKey('guild')) {
			await guilds.schema.addFolder('guild', {
				id: {
					type: 'String',
					min: 36,
					max: 36
				},
				apiKey: {
					type: 'String',
					min: 72,
					max: 72
				}
			});
		}

		/* update users schema */
		if (!users.schema.hasKey('apiKey')) {
			await users.schema.addKey('apiKey', {
				type: 'String',
				min: 72,
				max: 72
			});
		}
	}

};
