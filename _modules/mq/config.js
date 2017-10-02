const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({ silent: true });

const criteria = {
  env: process.env.NODE_ENV,
};

const config = {
  
    queuePrefix : '/queue/',
    tempQueuePrefix : '/queue/temp/',
    mq: {
      host: {
        $filter: 'env',
        production: '127.0.0.1',
        test: '127.0.0.1',
        dev: '127.0.0.1',
        $default: '127.0.0.1',
      },
      port: {
        $filter: 'env',
        production: '61613',
        test: '61613',
        dev: '61613',
        $default: '61613',
      },
      user: {
        $filter: 'env',
        production: 'user',
        test: 'user',
        dev: 'user',
        $default: 'user',
      },
      password: {
        $filter: 'env',
        production: 'pass',
        test: 'pass',
        dev: 'pass',
        $default: 'pass',
      },
    }  
};


const store = new Confidence.Store(config);

exports.get = function (key) {
  return store.get(key, criteria);
};


exports.meta = function (key) {
  return store.meta(key, criteria);
};

