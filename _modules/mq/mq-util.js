'use strict'
var Stomp = require('stomp-client');
var config = require('./config');
var destination = '/queue/someQueueName';
console.log('started mq ... ');

function getNewClient()
{
    return new Stomp(config.get('/mq/host'), 
                config.get('/mq/port'), 
                config.get('/mq/user'), 
                config.get('/mq/password'));
}
function sendAndWait(queueName, msg, headers, callback)
{
    const client = getNewClient();
    client.connect(sessionId => {
        client.publish(config.get('/queuePrefix') + queueName, JSON.stringify(msg), headers);
        // console.log('Sent : ' + JSON.stringify(msg) + '\n at ' + JSON.stringify(headers) + Date.now());        
        }
    );
    let replyTo = headers.replyTo;
        if(replyTo != null)
        {
            subscribeQueue(replyTo, 
                            callback, 
                            {'tempQueue' : true, 'expires' : 20000});
            // console.log('Waiting at : ' + replyTo);
        }
}
function subscribeQueue(queueName, callback, firstHeaders)
{
    const client = getNewClient();
    client.connect(sessionId => {
                    client.subscribe(config.get('/queuePrefix') + queueName, 
                                        (body, headers) => {
                                            // console.log(body);
                                            callback(body, headers);

                                            // console.log(firstHeaders);
                                            let deleteQueue = firstHeaders != undefined 
                                                                && firstHeaders.tempQueue == true;
                                            // console.log(firstHeaders);
                                                if(deleteQueue != null && deleteQueue)
                                                {
                                                    console.log('Should be unsubscribed ' + queueName);
                                                    // unsubscribeQueue(queueName);
                                                    client.unsubscribe(config.get('/queuePrefix') + queueName,headers);
                                                }
                                            //  console.log('Recieved : ' + JSON.stringify(body));
                                            //  console.log('Recieved : ' + JSON.stringify(headers));
                                        },
                                        firstHeaders
                                    )
                                   // console.log('Session id : ' + sessionId);
                    }
                );
}
function unsubscribeQueue(queueName, headers)
{
    const client = getNewClient();
    client.connect(sessionId => client.unsubscribe(config.get('/queuePrefix') + queueName,headers));
    console.log('Unsubscribed ' + queueName);
}
function sendInQueue(queueName, msg, headers)
{
    const client = getNewClient();    
    client.connect((sessionId, err) => {        
                        if(err)
                            console.log(err);
                        else
                        {
                            client.publish(config.get('/queuePrefix') + queueName, msg, headers);
                            // console.log('Sent : ' + JSON.stringify(msg) + '  to : ' + queueName);
                            // console.log('Session id : ' + sessionId);
                        }
                    }
                );
}


exports.sendAndWait = sendAndWait;
exports.subscribeQueue = subscribeQueue;
exports.unsubscribeQueue = unsubscribeQueue;
exports.sendInQueue = sendInQueue;