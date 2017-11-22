const snekfetch = require('snekfetch');

class Proxy extends Map {

	constructor(client, config) {
		super();
		Object.defineProperty(this, 'client', { value: client });
		this._name = config.name || null;
		this._type = config.type || null;
		this._endpoint = config.endpoint || config.name || null;
	}

	async init() {
		if (!this.client.settings[this._name]) {
			await this.client.settings.add(this._name, this._validate, this._schema);
		}
	}

	async fetchFromApi(id) {
		console.log(`fetching ${this._name}[${id}]`);
		return snekfetch.get(`${this._apiPath}/${id}`, {
			headers: {
				'Accept-Language': 'fr'
			}
		}).then(r => r.body);
	}

	async fetchFromBwd(id) {
		const item = this.client.settings[this._name].getEntry(id);
		let data;
		if (item.default) {
			data = await this.fetchFromApi(id);
			this.client.settings[this._name].updateMany(data, {
				lastUpdate: 'now', data: JSON.stringify(data)
			}, this.client.home);
		} else {
			console.log('item', item);
			({ data } = item);
			data = JSON.parse(data);
		}
		return data;
	}

	async set(item) {
		// console.log(`setting ${this.name}[${piece.id}]`);
		super.set(item.id, item);
		return item;
	}

	async get(id) {
		console.log(`getting ${this._name}[${id}]`);
		const existing = super.get(id);
		if (existing) return existing;
		const item = await this.fetchFromBwd(id);
		await this.set(item);
		return item;
	}

	get _apiPath() {
		return `https://api.guildwars2.com/v2/${this._endpoint}`;
	}

	async _validate(resolver, obj) {
		//if (!obj.id && (!obj.data || !obj.data.id)) throw 'The parameter must have an id field.';
		return obj;
	}

	get _schema() {
		return {
			lastUpdate: { type: 'String' },
			data: { type: 'String' }
		};
	}


}

module.exports = Proxy;
