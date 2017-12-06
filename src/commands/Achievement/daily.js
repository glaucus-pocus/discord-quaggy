const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text', 'dm', 'group'],
			cooldown: 60,
			aliases: ['quoti', 'journalières'],
			usage: '[demain] [pve|pvp|wvw|fractals|special]',
			usageDelim: ' ',
		});
	}

	async run(msg, [tomorrow, filter]) {		
		const res = await snekfetch.get(`https://api.guildwars2.com/v2/achievements/daily${tomorrow ? '/tomorrow' : ''}`)
			.then(r => r.body);

		if (filter && !res[filter].length) return msg.send('Qoo ! Quaggy ne sait pas quoi répondre à cela.');

		if (!filter || filter === 'pve') {
			const ret = ['# PvE #'];
			for (let i = 0, l = res.pve.length; i < l; ++i) {
				const meta = res.pve[i];
				const achievement = await this.client.db.achievements.get(meta.id);
				ret.push(
					'',
					`[${achievement.name}](${meta.level.min}-${meta.level.max})`,
					`> ${achievement.description} <`,
					`${achievement.requirement}`
				);
			}
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``);
		}
		if (!filter || filter === 'pvp') {
			const ret = ['# PvP #'];
			for (let i = 0, l = res.pvp.length; i < l; ++i) {
				const meta = res.pvp[i];
				const achievement = await this.client.db.achievements.get(meta.id);
				ret.push(
					'',
					`[${achievement.name}](${meta.level.min}-${meta.level.max})`,
					`> ${achievement.description} <`,
					`${achievement.requirement}`
				);
			}
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``);
		}
		if (!filter || filter === 'wvw') {
			const ret = ['# WvW #'];
			for (let i = 0, l = res.wvw.length; i < l; ++i) {
				const meta = res.wvw[i];
				const achievement = await this.client.db.achievements.get(meta.id);
				ret.push(
					'',
					`[${achievement.name}](${meta.level.min}-${meta.level.max})`,
					`> ${achievement.description} <`,
					`${achievement.requirement}`
				);
			}
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``);
		}
		if (!filter || filter === 'fractals') {
			const ret = ['# Fractales #'];
			for (let i = 0, l = res.fractals.length; i < l; ++i) {
				const meta = res.fractals[i];
				const achievement = await this.client.db.achievements.get(meta.id);
				ret.push(
					'',
					`[${achievement.name}](${meta.level.min}-${meta.level.max})`,
					// `> ${achievement.description} <`,
					`${achievement.requirement}`
				);
			}
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``);
		}
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
