const amqp = require('amqplib');

const eventEmitter = require('../../eventEmitter');

module.exports = (...args) => {
	const producer = {
		_id: undefined,

		_url: undefined,
		_queueName: undefined,
		_queueOptions: undefined,

		_connection: undefined,
		_channel: undefined,

		_init: async (id, url, queueName, queueOptions, channelOptions) => {
			try {
				if (!channelOptions) {
					channelOptions = {};
				}

				producer._id = id;

				producer._url = url;
				producer._queueName = queueName;
				producer._queueOptions = queueOptions;

				const conn = await amqp.connect(url);
				producer.initConnectionListeners(conn);

				const ch = await producer.registerChannel(conn);
				await producer.registerQueue(ch);

				const promises = Object.keys(channelOptions).map(async functionName => {
					const arg = channelOptions[functionName];

					await ch[functionName](arg);
				});

				await Promise.all(promises);

				console.log(`[*] Producer ${queueName} queue started.`);

				return producer;
			} catch (err) {
				producer.reconnect();

				console.error(err);
			}
		},

		registerChannel: (conn) => {
			producer._connection = conn;

			return conn.createChannel();
		},

		registerQueue: (ch) => {
			producer._channel = ch;

			return ch.assertQueue(producer._queueName, producer._queueOptions);
		},

		initConnectionListeners: (conn) => {
			conn.on('error', function (err) {
				producer.reconnect();

				console.error(err);
			});

			conn.on('close', () => {
				producer.reconnect();

				console.error('[*] RabbitMq connection is closed!');
			});
		},

		reconnect: () => {
			setTimeout(async () => {
				const newProducer = await producer._init(
					producer._id,
					producer._url,
					producer._queueName,
					producer._queueOptions
				);

				if (newProducer) {
					eventEmitter.emit('producer_update', newProducer);
				}
			}, 2000);
		},

		getId: () => {
			return producer._id;
		},

		sendToQueue: (msg) => {
			return producer._channel.sendToQueue(producer._queueName, Buffer.from(msg));
		},

		publish: (msg) => {
			return producer._channel.publish(producer._queueName, '', Buffer.from(msg));
		}
	};

	return producer._init(...args);
};
