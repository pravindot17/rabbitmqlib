/*
    Created by Pravin Lolage on 20 Sept 2018.
*/
'use strict';

let amqp = require('amqplib');
let libR = {};
libR.conn = null;
libR.channel = {};

module.exports = {
    __init,
    __addToQueue,
    __fetchFromQueue
}

function __init(config) {
    return new Promise((resolve, reject) => {
        if(!libR.conn) {
            amqp.connect(config.host)
            .then(conn => {
                libR.conn = conn;
                return conn.createChannel();
            }).then(ch => {
                libR.channel[config.queueName] = ch;
                resolve(libR.conn);
            }).catch(err => {
                console.error('connection failed with rabbbitmq:', err.message);
                reject(err);
            });
        } else {
            resolve(libR.conn);
        }
    });
}

function __addToQueue(queueName, message) {
    return new Promise((resolve, reject) => {
        if(libR.conn && libR.channel[queueName]) {
            libR.channel[queueName].assertQueue(queueName).then(function(ok) {
                return libR.channel[queueName].sendToQueue(queueName, new Buffer(JSON.stringify(message)), {persistent: true});
            }).then(ok => {
                resolve('success');
            }).catch(err => {
                console.log('Sending to queue failed', err);
                reject(err);
            });
        } else {
            reject(new Error('Rabbitmq connection or channel not found'));
        }
    });
}

function __fetchFromQueue(queueName) {
    return new Promise((resolve, reject) => {
        if(libR.conn && libR.channel[queueName]) {
            libR.channel[queueName].assertQueue(queueName, {durable: true}).then(function(ok) {
                return ok;
            }).then(ok => {
                return libR.channel[queueName].consume(queueName, (message) => {
                    libR.channel[queueName].ack(message);
                    resolve(message.content.toString());
                });
            })
            .catch(err => {
                console.log('Receiving from queue failed', err);
                reject(err);
            });
        } else {
            reject(new Error('Rabbitmq connection or channel not found'));
        }
    });
}