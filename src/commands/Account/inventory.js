const { Command, RichDisplay } = require('klasa');
const snekfetch = require('snekfetch');
const moment = require('moment');
require('moment-duration-format');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			cooldown: 10,
			aliases: ['inventaire'],
			description: '',
			usage: '[name:str]',
			usageDelim: ''
		});
	}

	loadList(apiKey) {
		return snekfetch.get(`https://api.guildwars2.com/v2/characters/`, { headers: { Authorization: `Bearer ${apiKey}` } })
			.then(rs => rs.body);
	}

	loadInventory(apiKey, name) {
		return snekfetch.get(`https://api.guildwars2.com/v2/characters/${name}/inventory?lang=fr`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Accept-Language': 'fr'
			}
		}).then(rs => rs.body.bags);
	}

	async generateBagPage(bag) {
		const bagItem = await this.client.db.items.get(bag.id);
		const bagList = bag.inventory.filter(Boolean);
		await this.client.db.items.loadMany(bagList.map(it => it.id));
		await Promise.all(bagList.map(it => this.client.db.items.get(it.id).then(res => { it.item = res; })));
		return template => {
			template.addField(bagItem.name, `${bagList.length} / ${bag.size} emplacements`);
			bagList.map(item => template.addField(`[${item.count > 1 ? `${item.count} ` : ''}${item.item.name}]`, item.item.chat_link, true));
			return template;
		};
	}

	async run(msg, [name]) {
		const { configs } = msg.author;
		if (!configs.apiKey) {
			return msg.send('Qoo ! Tu n\'as pas donné à Quaggy la clef pour lire tes informations ! Quaggy est triste ... Pour savoir comment faire, demande `Quaggy, howto apikey`.');
		}
		if (!name) {
			const res = await this.loadList(configs.apiKey);
			msg.send(`Qoo ! Qui souhaites-tu que Quaggy te montre ? ${res.map(ch => `**${ch}**`).join(', ')}`);
			const messages = await msg.channel.awaitMessages(mess => mess.author === msg.author, { max: 1, time: 30000 });
			if (!messages.first()) return msg.send('Qoooo...');
			name = messages.first().content;
		}
		const bags = await this.loadInventory(configs.apiKey, name);
		await this.client.db.items.loadMany(bags.map(bag => bag.id));

		const display = new RichDisplay(new this.client.methods.Embed().setTitle(name));
		(await Promise.all(bags.map(bag => this.generateBagPage(bag)))).map(display.addPage.bind(display));

		return display.run(await msg.sendMessage(`Chargement de ${name}...`));
	}

};
