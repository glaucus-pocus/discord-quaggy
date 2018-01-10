const { Command, RichDisplay } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text', 'dm', 'group'],
			cooldown: 60,
			aliases: ['quoti', 'journalières'],
			usage: '[demain] [pve|pvp|wvw|fractals|special]',
			usageDelim: ' '
		});
	}

	async dm(msg, res, filter) {
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
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``).catch(err => this.client.emit('error', err));
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
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``).catch(err => this.client.emit('error', err));
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
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``).catch(err => this.client.emit('error', err));
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
			msg.send(`\`\`\`md\n${ret.join('\n')}\n\`\`\``).catch(err => this.client.emit('error', err));
		}
	}

	async generatePage(display, res, subtitle, type) {
		const achievements = [];
		for (let i = 0, l = res[type].length; i < l; ++i) {
			const meta = res[type][i];
			const achievement = await this.client.db.achievements.get(meta.id);
			achievements.push({
				title: `[${achievement.name}](${meta.level.min}-${meta.level.max})`,
				description: `${achievement.requirement}`
			});
		}
		display.addPage(template => {
			template
				.setTitle(`Succès quotidiens - ${subtitle}`)
				.setThumbnail(this.client.assets.achievements.daily[type])
				.addBlankField();
			for (let i = 0, l = achievements.length; i < l; ++i) {
				const achievement = achievements[i];
				template.addField(achievement.title, achievement.description);
			}
			return template;
		});
	}

	async embed(msg, res, filter) {
		const display = new RichDisplay(new this.client.methods.Embed()
			.setAuthor(this.client.user.username, this.client.user.avatarURL())
			.setTitle('Succès quotidiens')
		);
		if (!filter || filter === 'pve') {
			await this.generatePage(display, res, 'PvE', 'pve');
		}
		if (!filter || filter === 'pvp') {
			await this.generatePage(display, res, 'PvP', 'pvp');
		}
		if (!filter || filter === 'wvw') {
			await this.generatePage(display, res, 'WvW', 'wvw');
		}
		if (!filter || filter === 'fractals') {
			await this.generatePage(display, res, 'Fractals', 'fractals');
		}
		return display.run(await msg.sendMessage('Loading slideshow...'));
	}

	async run(msg, [tomorrow, filter]) {
		const res = await snekfetch.get(`https://api.guildwars2.com/v2/achievements/daily${tomorrow ? '/tomorrow' : ''}`)
			.then(rs => rs.body);

		if (filter && !res[filter].length) return msg.send('Qoo ! Quaggy ne sait pas quoi répondre à cela.');
		const ids = [];
		Object.entries(res).map(type => ids.push(...type[1].map(ach => ach.id)));
		await this.client.db.achievements.loadMany(ids);

		return msg.guild ? this.embed(msg, res, filter) : this.dm(msg, res, filter);
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
