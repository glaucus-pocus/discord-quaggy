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
			aliases: ['personnages', 'personnage'],
			description: '',
			usage: '[nom:str] [backstory|core|crafting|equipment|heropoints|inventory|recipes|sab|skills|specializations|training]',
			usageDelim: ' '
		});
	}

	loadList(apiKey) {
		return snekfetch.get(`https://api.guildwars2.com/v2/characters/`, { headers: { Authorization: `Bearer ${apiKey}` } })
			.then(rs => rs.body);
	}

	loadCharacter(apiKey, name, endpoint = '') {
		return snekfetch.get(`https://api.guildwars2.com/v2/characters/${name}/${endpoint}?lang=fr`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Accept-Language': 'fr'
			}
		}).then(rs => rs.body);
	}

	async generateCorePage(res) {
		const profession = await this.client.db.professions.get(res.profession);
		return template => {
			template
				.setThumbnail(profession.icon)
				.addField('⚔ Profession', profession.name, true)
				.addField('⚙ Niveau', res.level, true)
				.addField('🗓 Création', moment(res.created).locale('fr').format('L'), true)
				.addField('⌛ Age', moment.duration(res.age, 'seconds').format('y [ans] d [jours] h [heures]'), true)
				.addField('💀 Morts', res.deaths, true);
			return template;
		};
	}

	async generateBackstoryPage(res) {
		let { backstory } = res;
		backstory = await Promise.all(backstory.map(bs => this.client.db.backstories.get(bs)));
		console.log(backstory);
		return template => {
			template
				.addField('Journal', backstory.map(bs => bs.journal).join('').replace(/<br>/ig, '\n'))
				.addBlankField();
			backstory.map(bs => template.addField(bs.title, bs.description));
			return template;
		};
	}

	async generateCraftingPage(res) {
		return template => {
			res.crafting.map(craft => template.addField(craft.discipline, craft.rating, true));
			return template;
		};
	}

	async generateEquipmentPage(res) {
		await this.client.db.items.loadMany(res.equipment.map(eq => eq.id));
		const equipment = {};
		await Promise.all(res.equipment.map(eq => {
			equipment[eq.slot] = eq;
			return this.client.db.items.get(eq.id).then(item => { equipment[eq.slot].item = item; });
		}));
		const displayItem = (item) => {
			if (!item) return '-';
			({ item } = item);
			return [
				`${item.name} ${item.chat_link}`,
				`${item.rarity} - Niveau ${item.level}`
			].join('\n');
		};
		return template => {
			template.addField('Tête', displayItem(equipment.Helm));
			template.addField('Epaules', displayItem(equipment.Shoulders));
			template.addField('Torse', displayItem(equipment.Coat));
			template.addField('Mains', displayItem(equipment.Gloves));
			template.addField('Jambes', displayItem(equipment.Leggings));
			template.addField('Pieds', displayItem(equipment.Boots));
			template.addBlankField();
			template.addField('Arme', displayItem(equipment.WeaponA1));
			template.addField('Arme', displayItem(equipment.WeaponA2));
			template.addBlankField();
			template.addField('Arme', displayItem(equipment.WeaponB1));
			template.addField('Arme', displayItem(equipment.WeaponB2));
			template.addBlankField();
			template.addField('Dos', displayItem(equipment.Backpack));
			template.addField('Accessoire', displayItem(equipment.Accessory1));
			template.addField('Accessoire', displayItem(equipment.Accessory2));
			template.addField('Amulette', displayItem(equipment.Amulet));
			template.addField('Bague', displayItem(equipment.Ring1));
			template.addField('Accessoire', displayItem(equipment.Ring2));
			return template;
		};
	}

	async run(msg, [name, endpoint]) {
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
		const res = await this.loadCharacter(configs.apiKey, name, endpoint);
		console.log(res);

		const title = res.title ? (await this.client.db.titles.get(res.title)).name : '-';
		const display = new RichDisplay(new this.client.methods.Embed().addField(res.name, title));
		display.addPage(await this.generateCorePage(res));
		display.addPage(await this.generateBackstoryPage(res));
		display.addPage(await this.generateCraftingPage(res));
		display.addPage(await this.generateEquipmentPage(res));

		return display.run(await msg.sendMessage(`Chargement de ${name}...`));
	}

	async init() {
		// You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
	}

};
