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
		if (!this.client.gateways[this._name]) {
			await this.client.gateways.add(this._name, this._validate, this._schema);
		}
	}

	async fetchFromApi(id) {
		console.log(`fetching ${this._name}[${id}]`);
		return snekfetch.get(`${this._apiPath}/${id}`, { headers: { 'Accept-Language': 'fr' } }).then(rs => rs.body);
	}

	async fetchFromBwd(id) {
		const item = this.client.gateways[this._name].getEntry(id);
		let data;
		if (item.default) {
			data = await this.fetchFromApi(id);
			(await this.client.gateways[this._name].createEntry(id)).update({ lastUpdate: 'now', data: JSON.stringify(data) });
		} else {
			({ data } = item);
			data = JSON.parse(data);
		}
		return data;
	}

	async set(item) {
		super.set(item.id, item);
		return item;
	}

	async get(id) {
		const existing = super.get(id);
		if (existing) return existing;
		const item = await this.fetchFromBwd(id);
		await this.set(item);
		return item;
	}

	loadManyFromApi(ids) {
		return snekfetch.get(`${this._apiPath}?ids=${ids.join(',')}`, { headers: { 'Accept-Language': 'fr' } }).then(rs => rs.body);
	}

	async loadManyFromBwd(ids) {
		const gateway = this.client.gateways[this._name];
		const missingIds = ids.filter(id => gateway.getEntry(id).default);
		if (missingIds.length) {
			const res = await this.loadManyFromApi(missingIds);
			await Promise.all(res.map(item => gateway.createEntry(item.id).then(config => config.update({ lastUpdate: 'now', data: JSON.stringify(item) }))));
		}
		return ids.map(id => {
			const { data } = gateway.getEntry(id);
			return JSON.parse(data);
		});
	}

	async loadMany(ids) {
		const missingIds = ids.filter(id => !super.get(id));
		if (missingIds.length) {
			const items = await this.loadManyFromBwd(missingIds);
			await Promise.all(items.map(this.set.bind(this)));
		}
	}

	get _apiPath() {
		return `https://api.guildwars2.com/v2/${this._endpoint}`;
	}

	async _validate(obj) {
		// if (!obj.id && (!obj.data || !obj.data.id)) throw 'The parameter must have an id field.';
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
