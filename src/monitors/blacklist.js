const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			enabled: true,
			ignoreBots: true,
			ignoreSelf: true,
			ignoreOthers: false // 0.4.0-dev only
		});
	}

	run(msg) {
		if (/(?:acinha|kissa)/i.test(msg)) {
			msg.send('Qoo ! Quaggy pas être content ! Hoo !');
			msg.delete();
		}
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
