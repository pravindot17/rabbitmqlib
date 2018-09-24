Rabbitmq Library for Queue operations
===================
This library is useful for RabbitMQ subscriber and consumer to send and receive message to queue

## How to use
```js
let rabbitMq = require('rabbitmqlib');

let config = {
    'host': 'amqp://username:passsword@localhost:5672/vHostName?heartbeat=30',
    'queueName': 'qMyFirstQueue',
    'options': {
        'messageTtl': 15000,
        'durable': true
    }
}

// init the connection in your bootstrap file using following code
rabbitMq.__init(config).then((res) => {
	console.log('Rabbitmq connected successfully');
}).catch(console.error);

// Publisher: use this code to send the message to queue
await rabbitMq.__addToQueue(config, 'This is my first message');

// Subscriber: use this code to receive the message from queue
rabbitMq.__fetchFromQueue(config, (err, message) => {
    if(err) throw err;
    console.log('Received from queue', JSON.stringify(message.content));

    // just to send the acknowledgement
    rabbitMq.__confirmAck(config.queueName, message);
});
```
