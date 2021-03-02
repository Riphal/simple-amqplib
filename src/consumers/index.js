const consumerFactory = require('./consumer');
const eventEmitter = require('../eventEmitter');

const consumers = {};

eventEmitter.on('consumer_update', (consumer) => {
	consumers[consumer._id] = consumer;
});

module.exports = {
	/**
	 * Get all active Consumers
	 *
	 * @returns {Object} consumers
	 */
	getConsumers: () => {
		return consumers;
	},

	/**
	 * Get consumer by id
	 *
	 * @param {any} id Unique id of consumer
	 *
	 * @returns {Object} consumerFactory or undefined
	 */
	getConsumer: (id) => {
		return consumers[id];
	},

	/**
	 * Create new instance of Consumer
	 *
	 * @param {any} id Unique id of consumer
	 *
	 * @returns {Object} consumerFactory
	 */
	addConsumer: async (id, url, options) => {
		if (!consumers[id]) {
			const consumer = await consumerFactory(
				id,
				url,
				options.queue_name,
				options.queue_options,
				options.channel_options,
				options.handle_msg
			);

			consumers[id] = consumer;

			return consumer;
		}

		return consumers[id];
	}
};
