const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Quaggy sait. Demande à Quaggy',
			usage: '[recherche:str] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, search) {
		search = search.join(' ');
		let result = `Hoo ! Quaggy n'a rien trouvé pour **${search}**`;
		if (/api(key)?/i.test(search)) {
			result = 'Qoo ! Etranger doit aller sur https://account.arena.net et se connecter. Etranger doit ensuite aller dans l\'onglet Application et générer une clef.';
			result += ' Quaggy conseille de cocher toutes les permissions, comme ça Quaggy saura tout d\'Etranger.';
			result += ' Il faut ensuite que Etranger donne la clef par message privé à Quaggy en faisant `Quaggy, userconf set apiKey EX4MP73-EX4MP73-EX4MP73-EX4MP73`.';
		}
		return msg.sendMessage(result);
	}

};
