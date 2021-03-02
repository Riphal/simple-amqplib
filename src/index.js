'use strict';

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

const consumers = require('./consumers');
const producers = require('./producers');

module.exports = {
	url: undefined,

	/**
	 *
	 * @param {*} options example --> { "url": "amqp://localhost:5672" }
	 */
	config: (options) => {
		if (!options.url) {
			options.url = 'amqp://localhost:5672';
		}

		module.exports.url = options.url;
	},

	/**
	 * Get all active Consumers
	 *
	 * @returns {Object} consumers
	 */
	getConsumers: () => {
		return consumers.getConsumers();
	},

	/**
	 * Get consumer by id
	 *
	 * @param {any} id Unique id of consumer
	 *
	 * @returns {Object} consumerFactory or undefined
	 */
	getConsumer: (id) => {
		return consumers.getConsumer(id);
	},

	/**
	 *
	 * @param {*} options example -->
	 * {
	 * 		"id": "9ea91a3c-4225-4d88-955b-9c9a24e1b313",
	 * 		"queue_name": "example",
	 * 		"queue_options": {
	 * 			"messageTtl": 24 * 60 * 60 * 1000
	 * 		},
	 * 		"channel_options": {
	 * 			"prefetch": 1
	 * 		}
	 *  	"handle_msg": (msg) => {
	 * 			console.log(msg)
	 * 		}
	 * }
	 */
	addConsumer: (options) => {
		if (!options.id) {
			options.id = uuidv4();
		}

		return consumers.addConsumer(options.id, module.exports.url, options);
	},

	/**
	 * Get all active Producers
	 *
	 * @returns {Object} producers
	 */
	getProducers: () => {
		return producers.getProducers();
	},

	/**
	 * Get producer by id
	 *
	 * @param {any} id Unique id of producer
	 *
	 * @returns {Object} producerFactory or undefined
	 */
	getProducer: (id) => {
		return producers.getProducer(id);
	},

	/**
	 *
	 * @param {*} options example -->
	 * {
	 * 		"id": "9ea91a3c-4225-4d88-955b-9c9a24e1b313",
	 * 		"queue_name": "example",
	 * 		"queue_options": {
	 * 			"messageTtl": 24 * 60 * 60 * 1000
	 * 		},
	 * 		"channel_options": {
	 * 			"prefetch": 1
	 * 		}
	 * }
	 */
	addProducer: (options) => {
		if (!options.id) {
			options.id = uuidv4();
		}

		return producers.addProducer(options.id, module.exports.url, options);
	}
};
