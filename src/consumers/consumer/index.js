const amqp = require('amqplib');

const eventEmitter = require('../../eventEmitter');

module.exports = (...args) => {
	const consumer = {
		_id: undefined,

		_url: undefined,
		_queueName: undefined,
		_queueOptions: undefined,

		_handleMsg: undefined,

		_connection: undefined,
		_channel: undefined,

		_init: async (id, url, queueName, queueOptions, channelOptions, handleMsg) => {
			try {
				if (!channelOptions) {
					channelOptions = {};
				}

				consumer._id = id;

				consumer._url = url;
				consumer._queueName = queueName;
				consumer._queueOptions = queueOptions;

				consumer._handleMsg = handleMsg;

				const conn = await amqp.connect(url);
				consumer.initConnectionListeners(conn);

				const ch = await consumer.registerChannel(conn);
				await consumer.registerQueue(ch);

				const promises = Object.keys(channelOptions).map(async functionName => {
					const arg = channelOptions[functionName];

					await ch[functionName](arg);
				});

				await Promise.all(promises);

				console.log(`[*] Consumer ${queueName} queue started and waiting for messages.`);

				ch.consume(queueName, (msg) => {
					handleMsg(msg, ch);
				}, { noAck: false });

				return consumer;
			} catch (err) {
				consumer.reconnect();

				console.error(err);
			}
		},

		registerChannel: (conn) => {
			consumer._connection = conn;

			return conn.createChannel();
		},

		registerQueue: (ch) => {
			consumer._channel = ch;

			return ch.assertQueue(consumer._queueName, consumer._queueOptions);
		},

		initConnectionListeners: (conn) => {
			conn.on('error', function (err) {
				consumer.reconnect();

				console.error(err);
			});

			conn.on('close', () => {
				consumer.reconnect();

				console.error('[*] RabbitMq connection is closed!');
			});
		},

		reconnect: () => {
			setTimeout(async () => {
				const newConsumer = await consumer._init(
					consumer._id,
					consumer._url,
					consumer._queueName,
					consumer._queueOptions,
					consumer._handleMsg
				);

				if (newConsumer) {
					eventEmitter.emit('consumer_update', newConsumer);
				}
			}, 2000);
		},

		getId: () => {
			return consumer._id;
		}
	};

	return consumer._init(...args);
};
