const producerFactory = require('./producer');
const eventEmitter = require('../eventEmitter');

const producers = {};

eventEmitter.on('producer_update', (producer) => {
	producers[producer._id] = producer;
});

module.exports = {
	/**
	 * Get all active Producers
	 *
	 * @returns {Object} producers
	 */
	getProducers: () => {
		return producers;
	},

	/**
	 * Get producer by id
	 *
	 * @param {any} id Unique id of producer
	 *
	 * @returns {Object} producerFactory or undefined
	 */
	getProducer: (id) => {
		return producers[id];
	},

	/**
	 * Create new instance of Producer
	 *
	 * @param {any} id Unique id of producer
	 *
	 * @returns {Promise} producerFactory
	 */
	addProducer: async (id, url, options) => {
		if (!producers[id]) {
			const producer = await producerFactory(
				id,
				url,
				options.queue_name,
				options.queue_options,
				options.channel_options
			);

			producers[id] = producer;

			return producer;
		}

		return producers[id];
	}
};
