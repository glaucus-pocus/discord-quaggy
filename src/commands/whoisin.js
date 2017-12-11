const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permLevel: 0,
			runIn: ['text'],

			description: 'Enumerates the members having the role.',
			usage: '<role:role|role:str>',
			usageDelim: ''
		});
	}

	async run(msg, [role]) {
		if (role.constructor.name !== 'Role') {
			role = msg.guild.roles.find('name', role);
			if (!role) {
				return msg.send('Qoo ! Quaggy ne trouve pas ce rôle dans la guilde.');
			}
		}
		if (role.members.size === 0) {
			return msg.send(`Qoo ! Personne n'est ${role.name}.`);
		}
		return msg.send(`Qoo ! Voici les ${role.name} : ${role.members.map(member => member.displayName).join(', ')}`);
	}

};
